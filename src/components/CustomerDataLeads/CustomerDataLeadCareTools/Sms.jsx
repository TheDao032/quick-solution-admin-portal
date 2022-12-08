import React, { PureComponent } from "react";
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
  Alert,
  Col,
  Row,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

// Assets
import "../styles.scss";

// Component(s)
import Loading from "../../Common/Loading";

// Util(s)
// import * as utils from "../../../utils";

// Model(s)
import CustomerDataLeadModel from "../../../models/CustomerDataLeadModel";
import DataLeadsSmsModel from "../../../models/DataLeadsSmsModel";

/**
 * @class CustomerDataLeadCareToolsSms
 */
export default class CustomerDataLeadCareToolsSms extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._dataLeadSmsModel = new DataLeadsSmsModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    // +++
    // let { customerDataLeadEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: true,
      /** @var {Array} */
      alerts: [],
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  /**
   * 
   * @return {Object}
   */
  getInitialValues() {
    let values = Object.assign({}, this._dataLeadSmsModel.fillable());
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
    });

    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    // let { customerDataLeadEnt } = this.props;
    let bundle = {};
    let all = [];
    all.length && await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ))
    ;
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data).filter(_i => !!_i);
      }
      bundle[key] = data;
    });
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    content_sms: Yup.string().trim()
      .required("Nội dung sms là bắt buộc.")
      .max(160, "Nội dung sms tối đa 160 ký tự.")
  });

  handleFormikBeforeRender({ initialValues }) {
    // let { values } = this.formikProps;
    // if (values === initialValues) {
    //   return;
    // }
    // Reformat data
    // Object.assign(values, {});
  }

  handleFormikSubmit(values, formProps) {
    let {
      customerDataLeadEnt, taskEnt,
      task_data_leads_list = [],
      handleFormikSubmitSucceed
    } = this.props;
    let { setSubmitting } = formProps;
    let alerts = [];
    // Build form data
    // +++
    let apiCaller = this._dataLeadSmsModel;
    // +++
    if (customerDataLeadEnt && taskEnt) {
      let { data_leads_id, phone_number } = customerDataLeadEnt;
      let { task_id } = taskEnt;
      task_data_leads_list.push({
        data_leads_id, task_id, phone_number
      });
    }
    let formData = Object.assign({}, values, {
      task_data_leads_list
    });
    // console.log('formData: ', formData);
    //
    let apiCall = apiCaller.create(formData);
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = formData;
          if (false === handleFormikSubmitSucceed(cbData)) {
            return data;
          }
        }
        //.end
        window._$g.toastr.show('Gửi sms thành công!', 'success');
        // Chain
        return data;
      })
      .catch(apiData => { // NG
        let { errors, statusText, message } = apiData;
        let msg = [`<b>${statusText || message}</b>`].concat(errors || []).join('<br/>');
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        // OK?!
        if (!alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { customerDataLeadEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
    // Trigger
    let { handleFormikSubmitDone } = this.props;
    handleFormikSubmitDone && handleFormikSubmitDone(this);
    //.end
  }

  render() {
    let {
      _id,
      ready,
      alerts
    } = this.state;
    let { noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="clearfix">
        {/* general alerts */}
        {alerts.map(({ color, msg }, idx) => {
          return (
            <Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
              <span dangerouslySetInnerHTML={{ __html: msg }} />
            </Alert>
          );
        })}
        <Row>
          <Col xs={12}>
            <Formik
              initialValues={initialValues}
              validationSchema={this.formikValidationSchema}
              // validateOnBlur={false}
              validateOnChange={false}
              onSubmit={(values, formProps) => this.handleFormikSubmit(values, formProps)}
            >{(formikProps) => {
              let {
                values,
                // errors,
                // status,
                // touched, handleChange, handleBlur,
                submitForm,
                resetForm,
                handleSubmit,
                handleReset,
                // isValidating,
                isSubmitting,
              } = (this.formikPropsSms = formikProps);
              // [Event]
              this.handleFormikBeforeRender({ initialValues });
              // Render
              return (
                <Form id="formCareToolSms" onSubmit={handleSubmit} onReset={handleReset}>
                  {this.props.task_data_leads_list ? (() => {
                    let { task_data_leads_list } = this.props;
                    let value = {};
                    (task_data_leads_list || []).forEach(item => item.phone_number && (value[item.phone_number] = item.full_name));
                    value = Object.values(value);
                    return (
                      <FormGroup row>
                        <Label for="content_sms" sm={3} className="text-right">
                          Gửi đến
                        </Label>
                        <Col sm={9}>
                          <Input
                            type="textarea"
                            rows={Math.min(8, value.length)}
                            value={value.map((txt, idx) => `${idx + 1}. ${txt}`).join('\r\n')}
                            readOnly
                          />
                        </Col>
                      </FormGroup>
                    );
                  })() : null}
                  <FormGroup row>
                    <Label for="content_sms" sm={3} className="text-right">
                      Nội dung tin nhắn<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="content_sms"
                        render={({ field }) => <Input
                          {...field}
                          onBlur={null}
                          type="textarea"
                          rows={4}
                          maxLength={160}
                          disabled={isSubmitting || noEdit}
                        />}
                      />
                      <p className="text-right m-0">{(values.content_sms && values.content_sms.length) || 0}/160 ký tự</p>
                      <ErrorMessage name="content_sms" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col sm={3}></Col>
                    <Col sm={9}>
                      <Button
                        color="primary"
                        onClick={() => submitForm()}
                        className="ml-2"
                        disabled={isSubmitting || noEdit}
                      >
                        Gửi
                      </Button>
                      {(() => {
                        let { handleActionClose } = this.props;
                        return handleActionClose ? (
                          <Button
                            onClick={handleActionClose}
                            className="ml-2"
                            disabled={isSubmitting || noEdit}
                          >
                            Đóng
                          </Button>
                        ) : null;
                      })()}
                      {(false !== this.props.handleActionReset) ? <Button
                        color="success"
                        onClick={() => resetForm()}
                        className="ml-2"
                        disabled={isSubmitting || noEdit}
                      >
                        Làm lại
                      </Button> : null}
                    </Col>
                  </FormGroup>
                </Form>
              );
            }}</Formik>
          </Col>
        </Row>
      </div>
    );
  }
}

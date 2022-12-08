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
import Select from "react-select";

// Assets
import "../styles.scss";

// Component(s)
import Loading from "../../Common/Loading";

// Util(s)
import { mapDataOptions4Select } from "../../../utils/html";
// import * as utils from '../../utils';

// Model(s)
import CustomerDataLeadModel from "../../../models/CustomerDataLeadModel";
import DataLeadsEmailModel from "../../../models/DataLeadsEmailModel";

/**
 * @class CustomerDataLeadCareToolsEmail
 */
export default class CustomerDataLeadCareToolsEmail extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._dataLeadEmailModel = new DataLeadsEmailModel();

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
      /** @var {Array} */
      emailCampaignIds: [
        { label: "-- Chọn --",  value: "" }
      ],
      /** @var {Object} */
      emailCampaign: null,
      /** @var {Array} */
      emailListIds: undefined,
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
    // let { customerDataLeadEnt } = this.props;
    let values = Object.assign({
      campaign_status: ""
    }, this._dataLeadEmailModel.fillable());
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
    let all = [
      this._dataLeadEmailModel.getOptionsCampaign()
        .then(data => (bundle["emailCampaignIds"] = mapDataOptions4Select(data))),
    ];
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
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    campaign_id: Yup.string().trim()
      .required("Chiến dịch là bắt buộc."),
    list_id: Yup.string().trim()
      .required("Phân khúc email là bắt buộc."),
    sender_email: Yup.string().trim()
      .required("Gửi từ là bắt buộc."),
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
      task_data_leads = [],
      handleFormikSubmitSucceed
    } = this.props;
    let { emailCampaign } = this.state;
    let { setSubmitting } = formProps;
    let alerts = [];
    // Build form data
    // +++
    let apiCaller = this._dataLeadEmailModel;
    // +++
    if (customerDataLeadEnt && taskEnt) {
      let { data_leads_id } = customerDataLeadEnt;
      let { task_id } = taskEnt;
      task_data_leads.push({ data_leads_id, task_id });
    }
    let formData = Object.assign({}, values, { task_data_leads });
    let emailList = (emailCampaign.list || []).find(_item => ('' + _item.id) === ('' + formData.list_id));
    formData = Object.assign(formData, {
      campaign_name: emailCampaign.name,
      sender_id: '' + (emailCampaign.sender_id || ''),
      sender_name: emailCampaign.sender_name,
      sender_email: emailCampaign.sender_email,
      status: emailCampaign.status,
      list_name: emailList.name,
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
        window._$g.toastr.show('Gửi email thành công!', 'success');
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
      emailCampaign: null,
      // emailCampaignIds: [],
      emailListIds: undefined,
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
      alerts,
      emailCampaignIds,
      // emailCampaign,
      emailListIds
    } = this.state;
    let { customerDataLeadEnt, task_data_leads, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues('email');
    // console.log('initialValues: ', initialValuesinitialValues);

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
              } = (this.formikPropsEmail = formikProps);
              // [Event]
              this.handleFormikBeforeRender({ initialValues });
              // Render
              return (
                <Form id="formCareToolEmail" onSubmit={handleSubmit} onReset={handleReset}>
                  <FormGroup row>
                    <Label for="campaign_id" sm={3}>
                      Chiến dịch<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="campaign_id"
                        render={({ field, form: { setValues } }) => {
                          let value = emailCampaignIds.find(item => ('' + item.value) === values[field.name]);
                          let placeholder = (value && value.label) || '';
                          return (
                            <Select
                              name={field.name}
                              onChange={({ value }) => {
                                //
                                setValues(Object.assign(values, {
                                  [field.name]: value, "list_id": "",
                                }));
                                // 
                                this.setState({ emailListIds: null }, () => {
                                  this._dataLeadEmailModel.getCampaign(value)
                                    .then((emailCampaign) => {
                                      let { list: emailListIds } = emailCampaign;
                                      emailListIds = mapDataOptions4Select(emailListIds || []);
                                      this.setState({ emailCampaign, emailListIds }, () => {
                                        //
                                        setValues(Object.assign(values, {
                                          sender_email: emailCampaign.sender_email,
                                          campaign_status: emailCampaign.status,
                                        }));
                                      });
                                      return emailCampaign;
                                    })
                                  ;
                                });
                              }}
                              isSearchable={true}
                              value={value}
                              placeholder={placeholder}
                              options={emailCampaignIds}
                              isDisabled={isSubmitting || noEdit}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="campaign_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="list_id" sm={3}>
                      Phân khúc email<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="list_id"
                        render={({ field }) => {
                          return (
                            <Select
                              key={`list_id_by_campaign_id-${values.campaign_id || ""}`}
                              name={field.name}
                              onChange={({ value }) => field.onChange({
                                target: { name: field.name, value }
                              })}
                              isSearchable={true}
                              placeholder="-- Phân khúc email --"
                              options={(values.campaign_id && emailListIds) || []}
                              isDisabled={isSubmitting || noEdit || null === emailListIds}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="list_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="sender_email" sm={3}>
                      Gửi từ<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="sender_email"
                        render={({ field }) => <Input
                          {...field}
                          type="text"
                          value={values[field.name]}
                          readOnly
                        />}
                      />
                      <ErrorMessage name="sender_email" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  {(() => {
                    let value = (customerDataLeadEnt && customerDataLeadEnt.email) || "";
                    if (!value) {
                      value = {};
                      (task_data_leads || []).forEach(item => item.email && (value[item.email] = 1));
                      value = Object.keys(value).join(',\r\n');
                    }
                    return value ? (
                      <FormGroup row>
                        <Label for="receiver_email" sm={3}>
                          Gửi đến<span className="font-weight-bold red-text">*</span>
                        </Label>
                        <Col sm={9}>
                          <Input
                            type={task_data_leads ? "textarea" : "text"}
                            rows={4}
                            value={value}
                            readOnly
                          />
                          <ErrorMessage name="receiver_email" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                        </Col>
                      </FormGroup>
                    ) : null;
                  })()}
                  <FormGroup row>
                    <Label for="campaign_status" sm={3}>
                      Trạng thái chiến dịch
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="campaign_status"
                        render={({ field }) => <Input
                          {...field}
                          type="text"
                          value={values[field.name]}
                          readOnly
                        />}
                      />
                      <ErrorMessage name="campaign_status" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col sm={3}></Col>
                    <Col sm={9}>
                      <Button
                        color="primary"
                        onClick={() => submitForm()}
                        className="mr-2"
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
                        className="mr-2"
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

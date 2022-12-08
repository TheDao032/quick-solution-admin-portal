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
  InputGroupAddon,
  InputGroupText,
  InputGroup,
} from "reactstrap";
import Select from "react-select";
import moment from "moment";

// Assets
import "../styles.scss";

// Component(s)
import Loading from "../../Common/Loading";
import DatetimePicker from "../../Common/DatetimePicker";
import UserComponent from "../../Common/User";

// Util(s)
import {
  mapDataOptions4Select,
  readFileAsBase64, fileToObj,
  MOMENT_FORMAT_DATETIME
} from "../../../utils/html";

// Model(s)
import CustomerDataLeadModel from "../../../models/CustomerDataLeadModel";
import DataLeadsCallModel from "../../../models/DataLeadsCallModel";

/**
 * @class CustomerDataLeadCareToolsCall
 */
export default class CustomerDataLeadCareToolsCall extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._dataLeadCallModel = new DataLeadsCallModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);

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
      callTypeIds: [
        { label: "-- Chọn --", value: "" },
      ].concat(
        mapDataOptions4Select(
          this._dataLeadCallModel._entity.getCallTypesIdOpts()
        )
      ),
      /** @var {Object} */
      callFile: null,
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
    let values = Object.assign({}, this._dataLeadCallModel.fillable());
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
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    call_type_id: Yup.string().trim()
      .required("Loại cuộc gọi là bắt buộc."),
    responsible_user_name: Yup.string().trim()
      .required("Nhân viên thực hiện là bắt buộc."),
    event_start_date_time: Yup.string().trim()
      .required("Sự kiện bắt đầu là bắt buộc."),
    event_end_date_time: Yup.string().trim()
      .required("Sự kiện kết thúc là bắt buộc."),
    duration: Yup.number()
      .moreThan(0, 'Thời gian gọi không được âm')
      .required("Thời gian gọi là bắt buộc."),
    subject: Yup.string().trim()
      .required("Chủ đề là bắt buộc."), 
  });

  handleFormikBeforeRender({ initialValues }) {
    // let { values } = this.formikProps;
    // if (values === initialValues) {
    //   return;
    // }
    // Reformat data
    // Object.assign(values, {});
  }

  handleFormikValidate = (values) => {
    let errors = {};
    let {
      event_start_date_time,
      event_end_date_time
    } = values;
    //
    if (!errors.event_end_date_time && (
      event_start_date_time && event_end_date_time
    )) {
      let startDate = moment(event_start_date_time);
      let endDate = moment(event_end_date_time);
      if (startDate > endDate) {
        errors.event_end_date_time = (`Sự kiện bắt đầu/kết thúc không hợp lệ.`);
      }
    }
    return errors;
  }

  handleFormikSubmit(values, formProps) {
    let { customerDataLeadEnt, taskEnt } = this.props;
    let { callFile } = this.state;
    let { setSubmitting } = formProps;
    let alerts = [];
    // Build form data
    // +++
    let { data_leads_id } = customerDataLeadEnt;
    let { task_id } = taskEnt;
    // +++
    let apiCaller = null;
    let file_attactments = [];
    let formData = Object.assign({}, values, { data_leads_id, task_id });
    // +++ call
    apiCaller = this._dataLeadCallModel;
    callFile && file_attactments.push({
      attachment_name: callFile.name,
      attachment_path: callFile.dataBase64,
    });
    Object.assign(formData, {
      event_start_date_time: moment(values.event_start_date_time)
        .format(MOMENT_FORMAT_DATETIME),
      event_end_date_time: moment(values.event_end_date_time)
        .format(MOMENT_FORMAT_DATETIME),
      file_attactments
    });
    // console.log('formData: ', formData);
    //
    let apiCall = apiCaller.create(formData);
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu call thành công!', 'success');
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
      callFile: null,
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

  handleFileChange(event) {
    let { target } = event;
    let fileZero = target.files[0];
    if (fileZero) {
      readFileAsBase64(target, {
        // option: validate input
        validate: (file) => {
          // Check file's size in bytes
          if ('size' in file) {
            let maxSize = 4; /*4mb*/
            if ((file.size / 1024 / 1024) > maxSize) {
              return `Dung lượng tập tin tối đa là: ${maxSize}mb.`;
            }
          }
        }
      })
        .then(dataBase64 => {
          let uploadFile = Object.assign(fileToObj(fileZero), { dataBase64 });
          this.setState({ callFile: uploadFile });
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
      ;
    }
  }

  blurDuration = (event, field) => {
    let value = event.target.value > 0 || 0;

    return field.onChange({
      target: {
        type: "text",
        name: field.name,
        value,
      }
    })
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      callTypeIds,
      callFile,
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
              validate={this.handleFormikValidate}
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
              } = (this.formikPropsCall = window._formikPropsCall = formikProps);
              // [Event]
              this.handleFormikBeforeRender({ initialValues });
              // Render
              return (
                <Form id="formCareToolCall" onSubmit={handleSubmit} onReset={handleReset}>
                  <FormGroup row>
                    <Label for="call_type_id" sm={3}>
                      Loại cuộc gọi<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="call_type_id"
                        render={({ field }) => {
                          let value = (callTypeIds || []).find(item => ('' + item.value) === ('' + values[field.name]));
                          return (
                            <Select
                              name={field.name}
                              onChange={({ value }) => field.onChange({
                                target: { name: field.name, value }
                              })}
                              value={value}
                              isSearchable={false}
                              options={callTypeIds}
                              isDisabled={isSubmitting || noEdit}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="call_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="responsible_user_name" sm={3}>
                      Nhân viên thực hiện<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="responsible_user_name"
                        render={({ field }) => {
                          return (
                            <UserComponent
                              name={field.name}
                              onChange={(item) => field.onChange({
                                target: { name: field.name, value: item.user_name }
                              })}
                              value={values[field.name]}
                              isDisabled={isSubmitting || noEdit}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="responsible_user_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="event_start_date_time" sm={3}>
                      Sự kiện bắt đầu<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="event_start_date_time"
                        render={({ field, form: { setFieldValue } }) => <DatetimePicker
                          value={values[field.name] ? moment(values[field.name]) : undefined}
                          onChange={date => setFieldValue(field.name, date)}
                          inputProps={{
                            disabled: isSubmitting || noEdit,
                          }}
                        />}
                      />
                      <ErrorMessage name="event_start_date_time" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="event_end_date_time" sm={3}>
                      Sự kiện kết thúc<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="event_end_date_time"
                        render={({ field, form: { setFieldValue } }) => <DatetimePicker
                          value={values[field.name] ? moment(values[field.name]) : undefined}
                          onChange={date => setFieldValue(field.name, date)}
                          disabled={isSubmitting || noEdit}
                          inputProps={{
                            disabled: isSubmitting || noEdit,
                          }}
                        />}
                      />
                      <ErrorMessage name="event_end_date_time" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="duration" sm={3}>
                      Thời gian gọi<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <InputGroup>
                        <Field
                          name="duration"
                          render={({ field }) => {
                            return (
                              <Input
                                {...field}
                                // onBlur={(event)=> this.blurDuration(event,field)}
                                type="number"
                                className="text-right"
                                placeholder="0"
                                min="0"
                                disabled={isSubmitting || noEdit}
                              />
                            );
                          }}
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText>phút</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <ErrorMessage name="duration" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="subject" sm={3}>
                      Chủ đề<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="subject"
                        render={({ field }) => {
                          return (
                            <Input
                              {...field}
                              onBlur={null}
                              type="text"
                              disabled={isSubmitting || noEdit}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="subject" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="description" sm={3}>
                      Mô tả
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="description"
                        render={({ field }) => {
                          return (
                            <Input
                              {...field}
                              onBlur={null}
                              type="textarea"
                              disabled={isSubmitting || noEdit}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col sm={3}></Col>
                    <Col sm={9}>
                      {callFile ? (<ul><li>
                          {callFile.name} <Button color="danger" size="sm" onClick={() => this.setState({ callFile: null })}>x</Button>
                      </li></ul>) : null}
                      <span className="hidden ps-relative">
                        <span><i className="fa fa-link" /></span>
                        <Input
                          key={`call_file_${!!callFile}`}
                          id="call_file"
                          type="file"
                          className="input-overlay"
                          onChange={(evt) => this.handleFileChange(evt)}
                          disabled={isSubmitting || noEdit}
                        />
                      </span>
                      <Button
                        color="primary"
                        onClick={() => submitForm()}
                        className="ml-2"
                        disabled={isSubmitting || noEdit}
                      >
                        Gửi
                      </Button>
                      <Button
                        color="success"
                        onClick={() => resetForm()}
                        className="ml-2"
                        disabled={isSubmitting || noEdit}
                      >
                        Làm lại
                      </Button>
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

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
// import Select from "react-select";
import moment from "moment";

// Assets
import "../styles.scss";

// Component(s)
import Loading from "../../Common/Loading";
import DatetimePicker from "../../Common/DatetimePicker";
import UserComponent from "../../Common/User";

// Util(s)
import {
  // mapDataOptions4Select,
  readFileAsBase64, fileToObj,
  MOMENT_FORMAT_DATETIME
} from "../../../utils/html";
// import * as utils from '../../utils';

// Model(s)
import CustomerDataLeadModel from "../../../models/CustomerDataLeadModel";
import DataLeadsMeetingModel from "../../../models/DataLeadsMeetingModel";

/**
 * @class CustomerDataLeadCareToolsMeeting
 */
export default class CustomerDataLeadCareToolsMeeting extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._dataLeadMeetingModel = new DataLeadsMeetingModel();

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
      /** @var {Object} */
      meetingFile: null,
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
    let values = Object.assign({}, this._dataLeadMeetingModel.fillable());
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
        window._$g._(`Kh???i t???o d??? li???u kh??ng th??nh c??ng (${err.message}).`),
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
    responsible_user_name: Yup.string().trim()
      .required("Nh??n vi??n th???c hi???n l?? b???t bu???c."),
    content_meeting: Yup.string().trim()
      .required("N???i dung l???ch h???n l?? b???t bu???c."),
    event_start_date_time: Yup.string().trim()
      .required("S??? ki???n b???t ?????u l?? b???t bu???c."),
    event_end_date_time: Yup.string().trim()
      .required("S??? ki???n k???t th??c l?? b???t bu???c."),
    location: Yup.string().trim()
      .required("?????a ch??? h???n l?? b???t bu???c."),
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
    let { customerDataLeadEnt, taskEnt } = this.props;
    let { meetingFile } = this.state;
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
    // +++ meeting
    apiCaller = this._dataLeadMeetingModel;
    meetingFile && file_attactments.push({
      attachment_name: meetingFile.name,
      attachment_path: meetingFile.dataBase64,
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
        window._$g.toastr.show('L??u l???ch h???n th??nh c??ng!', 'success');
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
      meetingFile: null,
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
              return `Dung l?????ng t???p tin t???i ??a l??: ${maxSize}mb.`;
            }
          }
        }
      })
        .then(dataBase64 => {
          let uploadFile = Object.assign(fileToObj(fileZero), { dataBase64 });
          this.setState({ meetingFile: uploadFile });
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
      ;
    }
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      meetingFile,
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
              } = (this.formikPropsMeeting = formikProps);
              // [Event]
              this.handleFormikBeforeRender({ initialValues });
              // Render
              return (
                <Form id="formCareToolMeeting" onSubmit={handleSubmit} onReset={handleReset}>
                  <FormGroup row>
                    <Label for="responsible_user_name" sm={3}>
                      Nh??n vi??n th???c hi???n<span className="font-weight-bold red-text">*</span>
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
                      S??? ki???n b???t ?????u<span className="font-weight-bold red-text">*</span>
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
                      S??? ki???n k???t th??c<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="event_end_date_time"
                        render={({ field, form: { setFieldValue } }) => <DatetimePicker
                          value={values[field.name] ? moment(values[field.name]) : undefined}
                          onChange={date => setFieldValue(field.name, date)}
                          inputProps={{
                            disabled: isSubmitting || noEdit,
                          }}
                        />}
                      />
                      <ErrorMessage name="event_end_date_time" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="content_meeting" sm={3}>
                      N???i dung l???ch h???n<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="content_meeting"
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
                      <ErrorMessage name="content_meeting" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Label for="location" sm={3}>
                      ?????a ch??? h???n<span className="font-weight-bold red-text">*</span>
                    </Label>
                    <Col sm={9}>
                      <Field
                        name="location"
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
                      <ErrorMessage name="location" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col sm={3}></Col>
                    <Col sm={9}>
                      {meetingFile ? (<ul><li>
                          {meetingFile.name} <Button color="danger" size="sm" onClick={() => this.setState({ meetingFile: null })}>x</Button>
                      </li></ul>) : null}
                      <span className="hidden ps-relative">
                        <span><i className="fa fa-link" /></span>
                        <Input
                          key={`meeting_file_${!!meetingFile}`}
                          type="file"
                          id="meeting_file"
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
                        G???i
                      </Button>
                      <Button
                        color="success"
                        onClick={() => resetForm()}
                        className="ml-2"
                        disabled={isSubmitting || noEdit}
                      >
                        L??m l???i
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

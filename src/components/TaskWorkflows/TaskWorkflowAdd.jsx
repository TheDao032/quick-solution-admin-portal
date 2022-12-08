import React, { PureComponent } from "react";
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  // FormText,
  // Media,
  // InputGroupText,
  // InputGroup,
  // InputGroupAddon,
  CustomInput,
} from "reactstrap";

// Assets
import "./styles.scss";

// Component(s)
import Loading from '../Common/Loading';

// Util(s)

// Model(s)
import TaskWorkflowModel from "../../models/TaskWorkflowModel";

/**
 * @class TaskWorkflowAdd
 */
export default class TaskWorkflowAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._taskWorkflowModel = new TaskWorkflowModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    // +++
    // let { taskWorkflowEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
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
    let { taskWorkflowEnt } = this.props;
    let values = Object.assign(
      {}, this._taskWorkflowModel.fillable(),
    );
    if (taskWorkflowEnt) {
      Object.assign(values, taskWorkflowEnt);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // if (key === '') {}
    });

    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    // let { taskWorkflowEnt } = this.props;
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
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    task_work_follow_name: Yup.string()
      // .min(2, 'Too Short!')
      // .max(70, 'Too Long!')
      .required("Tên bước xử lý công việc là bắt buộc."),
    // description: Yup.string()
    //  .required("Mô tả là bắt buộc."),
    order_index: Yup.number()
      .min(0, "Thứ tự bắt buộc lớn hơn hoặc bằng 0")
      .required("Thứ tự là bắt buộc."),
    is_active: Yup.string()
      .required("Kích hoạt là bắt buộc."),
    is_complete: Yup.string()
      .required("Là bước hoàn thành là bắt buộc."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    // +++
    Object.assign(values, {
      // +++
    });
  }

  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { taskWorkflowEnt, handleFormikSubmitSucceed } = this.props;
    // let {} = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // let {} = values;
    let formData = Object.assign({}, values, {
      order_index: '' + values.order_index,
      is_active: 1 * values.is_active,
      is_complete: 1 * values.is_complete,
    });
    // console.log('formData: ', formData);
    //
    let taskWorkflowId = (taskWorkflowEnt && taskWorkflowEnt.id());
    let apiCall = taskWorkflowId
      ? this._taskWorkflowModel.update(taskWorkflowId, formData)
      : this._taskWorkflowModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = Object.assign({ 'task_work_follow_id': data }, formData);
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/task-workflows');
        }
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
        //
        if (!taskWorkflowEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { taskWorkflowEnt } = this.props;
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
  }

  handleFormikValidate(values) {
    let errors = {};
    return errors;
  }

  render() {
    let {
      _id,
      ready,
      alerts,
    } = this.state;
    let { taskWorkflowEnt } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);4

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{taskWorkflowEnt ? 'Chỉnh sửa' : 'Thêm mới'} bước xử lý công việc {taskWorkflowEnt ? taskWorkflowEnt.task_work_follow_name : ''}</b>
              </CardHeader>
              <CardBody>
                {/* general alerts */}
                {alerts.map(({ color, msg }, idx) => {
                  return (
                    <Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
                      <span dangerouslySetInnerHTML={{ __html: msg }} />
                    </Alert>
                  );
                })}
                <Formik
                  initialValues={initialValues}
                  validationSchema={this.formikValidationSchema}
                  validate={this.handleFormikValidate}
                  validateOnBlur={false}
                  // validateOnChange={false}
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    // errors,
                    // status,
                    // touched, handleChange, handleBlur,
                    // submitForm,
                    // resetForm,
                    handleSubmit,
                    handleReset,
                    // isValidating,
                    isSubmitting,
                    /* and other goodies */
                  } = (this.formikProps = window._formikProps = formikProps);
                  // [Event]
                  this.handleFormikBeforeRender({ initialValues });
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="task_work_follow_name" sm={4}>
                              Tên bước<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="task_work_follow_name"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  placeholder=""
                                />}
                              />
                              <ErrorMessage name="task_work_follow_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="description" sm={4}>
                              Mô tả
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="description"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  id={field.name}
                                  placeholder=""
                                />}
                              />
                              <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="order_index" sm={4}>
                              Thứ tự<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="order_index"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="number"
                                  id={field.name}
                                  className="text-right"
                                  placeholder=""
                                  min={0}
                                />}
                              />
                              <ErrorMessage name="order_index" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="is_active" sm={4}></Label>
                            <Col sm={4}>
                              <Field
                                name="is_active"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_active}
                                  type="switch"
                                  id={field.name}
                                  label="Kích hoạt?"
                                />}
                              />
                              <div className="clearfix">
                                <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </div>
                            </Col>
                            <Col sm={4}>
                              <Field
                                name="is_complete"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_complete}
                                  type="switch"
                                  id={field.name}
                                  label="Là bước hoàn thành?"
                                />}
                              />
                              <div className="clearfix">
                                <ErrorMessage name="is_complete" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </div>
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} className="mt-2">
                          <Row>
                            <Col sm={12} className="text-right">
                              {(false !== this.props.handleActionSave) ? <Button type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                <i className="fa fa-save mr-2" />Lưu
                              </Button> : null}
                              {(false !== this.props.handleActionSaveAndClose) ? <Button type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                              </Button> : null}
                              <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr('/task-workflows'))} className="btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-times-circle mr-1" />Đóng
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Form>
                  );
                }}</Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

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
  Table
} from "reactstrap";
import Select from "react-select";

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
// +++
import TaskWorkflowAdd from '../TaskWorkflows/TaskWorkflowAdd';

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';
// import * as utils from '../../utils';

// Model(s)
import TaskTypeModel from "../../models/TaskTypeModel";
import TaskWorkflowModel from "../../models/TaskWorkflowModel";
import FunctionModel from "../../models/FunctionModel";

/**
 * @class TaskTypeAdd
 */
export default class TaskTypeAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._taskTypeModel = new TaskTypeModel();
    this._taskWorkflowModel = new TaskWorkflowModel();
    this._functionModel = new FunctionModel();

    // Bind method(s)
    this.handleToggleTWA = this.handleToggleTWA.bind(this);
    this.handleFormikSubmitSucceedTWA = this.handleFormikSubmitSucceedTWA.bind(this);
    this.handleSortTaskWorkflow = this.handleSortTaskWorkflow.bind(this);
    this.handleRemoveTaskWorkflow = this.handleRemoveTaskWorkflow.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    // +++
    // let { taskTypeEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      willShowTaskWorkflowAdd: false,
      /** @var {Array} */
      functions: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      taskTypeWflows: [],
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
    let { taskTypeEnt } = this.props;
    let { taskTypeWflows } = this.state;
    let values = Object.assign(
      {}, this._taskTypeModel.fillable(),
      {
        task_type_wflows: taskTypeWflows
      }
    );
    if (taskTypeEnt) {
      let { list_task_work_follow = [], ...dataEnt } = taskTypeEnt;
      Object.assign(values, dataEnt, {
        task_type_wflows: list_task_work_follow.map(({
          task_work_follow_id: id,
          task_work_follow_name: name,
          ...item
        }) => ({ id, name, ...item }))
      });
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
    let { taskTypeEnt } = this.props;
    let bundle = {};
    let all = [
      this._functionModel.getOptions({ is_active: 1 })
        .then(data => (bundle['functions'] = mapDataOptions4Select(data))),
    ];
    if (!taskTypeEnt) {
      all.push(
        this._taskWorkflowModel.getOptions({ is_active: 1 })
          .then(data => (bundle['taskTypeWflows'] = mapDataOptions4Select(data)))
      );
    }
    await Promise.all(all)
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
    task_type_name: Yup.string()
      // .min(2, 'Too Short!')
      // .max(70, 'Too Long!')
      .required("Tên loại công việc là bắt buộc."),
    is_active: Yup.string()
      .required("Kích hoạt là bắt buộc."),
    add_function_id: Yup.string()
     .required("Quyền thêm mới là bắt buộc."),
    edit_function_id: Yup.string()
     .required("Quyền chỉnh sửa là bắt buộc."),
    delete_function_id: Yup.string()
     .required("Quyền xóa là bắt buộc."),
  });

  handleToggleTWA() {
    let { willShowTaskWorkflowAdd } = this.state;
    // toggle
    willShowTaskWorkflowAdd = !willShowTaskWorkflowAdd;
    // +++
    this.setState({ willShowTaskWorkflowAdd });
  }

  handleFormikSubmitSucceedTWA(data) {
    //
    setTimeout(() => {
      let { values, setValues } = this.formikProps;
      let { task_type_wflows = [] } = values;
      this.setState({ willShowTaskWorkflowAdd: false }, () => {
        task_type_wflows.push(data);
        setValues(Object.assign(values, { task_type_wflows }));
      });
    });
    // Prevent default
    return false;
  }

  handleSortTaskWorkflow(type, item) {
    let { values, handleChange } = this.formikProps;
    let { task_type_wflows: value } = values;
    let nextIdx = null;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    if ('up' === type) {
      nextIdx = Math.max(0, foundIdx - 1);
    }
    if ('down' === type) {
      nextIdx = Math.min(value.length - 1, foundIdx + 1);
    }
    if ((foundIdx !== nextIdx) && (null !== nextIdx)) {
      let _tempItem = value[foundIdx];
      value[foundIdx] = value[nextIdx];
      value[nextIdx] = _tempItem;
      handleChange({ target: { name: "task_type_wflows", value }});
    }
  }

  handleFormikSubmitSucceedCTA() {
    //
    setTimeout(() => {
      this.setState({ willShowCampaignTypeAdd: false });
      // Refresh dropdownlist
      this._getBundleItemCampaignTypes()
        .then(campaignTypes => this.setState({ campaignTypes }))
      ;
    });
    // Prevent default
    return false;
  }

  handleRemoveTaskWorkflow(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { task_type_wflows: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    window._$g.dialogs.prompt(
      `Bạn muốn xóa bước xử lý công việc?`,
      (isYes) => {
        if (isYes) {
          value.splice(foundIdx, 1);
          handleChange({ target: { name: "task_type_wflows", value }});
        }
      }
    );
  }

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
    let { taskTypeEnt, handleFormikSubmitSucceed } = this.props;
    // let {} = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let { task_type_wflows } = values;
    let task_work_follow_list = task_type_wflows.map((item, order_index) => ({
      task_work_follow_id: '' + (item.id || item.task_work_follow_id),
      order_index
    }))
    // +++
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      task_work_follow_list
    });
    delete formData.task_type_wflows;
    // console.log('formData: ', formData);
    //
    let taskTypeId = (taskTypeEnt && taskTypeEnt.id()) || formData[this._taskTypeModel];
    let apiCall = taskTypeId
      ? this._taskTypeModel.update(taskTypeId, formData)
      : this._taskTypeModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = Object.assign({ task_type_id: data }, formData);
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/task-types/');
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
        if (!taskTypeEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { taskTypeEnt } = this.props;
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
    let { task_type_wflows } = values;
    //
    let errMsg = "Thông tin quy trình xử lý là bắt buộc.";
    if (!task_type_wflows.length) {
      errors.task_type_wflows = errMsg;
    } else {
      let isCompleteCnt = 0;
      let isLastIsComplete = !!(1 * task_type_wflows[
        task_type_wflows.length - 1
      ].is_complete);
      task_type_wflows.forEach((item) => {
        /* if (!errors.task_type_wflows) {
          if (utils.isVoid(item.id)) {
            errors.task_type_wflows = errMsg;
          }
        } */
        if (1 * item.is_complete) {
          isCompleteCnt++;
        }
      });
      if (!errors.task_type_wflows && isCompleteCnt > 1) {
        errors.task_type_wflows = (errMsg = "Loại công việc chỉ được phép có duy nhất 1 bước xử lý là bước hoàn thành.");
      }
      if (!errors.task_type_wflows && !isLastIsComplete) {
        errors.task_type_wflows = (errMsg = "Bước xử lý cuối cùng phải là bước hoàn thành.");
      }
    }
    return errors;
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      willShowTaskWorkflowAdd,
      functions,
    } = this.state;
    let { noEdit } = this.props;
    let { taskTypeEnt } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        {/** start#TaskWorkflowAdd */}{willShowTaskWorkflowAdd
          ? (
            <div className="task-workflow">
              <div className="task-workflow-box">
                <TaskWorkflowAdd
                  handleActionSave={false}
                  handleActionClose={this.handleToggleTWA}
                  handleFormikSubmitSucceed={this.handleFormikSubmitSucceedTWA}
                />
              </div>
            </div>
          ) : null
        }{/** end#TaskWorkflowAdd */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{taskTypeEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} loại công việc {taskTypeEnt ? taskTypeEnt.task_type_name : ''}</b>
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
                        <Col xs={12} sm={6}>
                          <Row>
                            <Col xs={12} className="mb-3">
                              <b className="underline">Thông tin loại công việc</b>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="task_type_name" sm={4}>
                                  Tên loại công việc<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="task_type_name"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id={field.name}
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="task_type_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
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
                                    render={({ field }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="textarea"
                                      id={field.name}
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="is_active" sm={4}></Label>
                                <Col sm={8}>
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
                                      disabled={noEdit}
                                    />}
                                  /><span className="font-weight-bold red-text">*</span>
                                  <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Row>
                            <Col xs={12} className="mb-3">
                              <b className="underline">Thông tin quyền</b>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="add_function_id" sm={4}>
                                  Quyền thêm mới<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="add_function_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = functions.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (functions[0] && functions[0].label) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={functions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="add_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="edit_function_id" sm={4}>
                                  Quyền chỉnh sửa<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="edit_function_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = functions.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (functions[0] && functions[0].label) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={functions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="edit_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="delete_function_id" sm={4}>
                                  Quyền xóa<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="delete_function_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = functions.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (functions[0] && functions[0].label) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={functions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="delete_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col xs={12}>
                          <b className="underline">Quy trình xử lý</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <FormGroup row id="task_type_wflows">
                            <Table size="sm" bordered striped hover responsive>
                              <thead>
                                <tr>
                                  <th style={{ width: '75px', minWidth: '75px' }}><i className="fa fa-list" /></th>
                                  <th style={{ width: '85px', minWidth: '75px'  }}>Thứ tự</th>
                                  <th style={{}}>Tên bước</th>
                                  {/* <th style={{}}>Mô tả</th> */}
                                  <th style={{ width: '170px'  }}>Là bước hoàn thành?</th>
                                  <th style={{ width: '1%' }}>Xóa</th>
                                </tr>
                              </thead>
                              <tbody>
                                {values.task_type_wflows.map((item, idx) => {
                                  return item ? (
                                    <tr key={`task_wflow-${idx}`}>
                                      <th scope="row" className="text-center _sort">
                                        <Button
                                          size="sm"
                                          color="primary"
                                          className="mr-1"
                                          disabled={(0 === idx) || noEdit}
                                          onClick={(evt) => this.handleSortTaskWorkflow('up', item, evt)}
                                        >
                                          <i className="fa fa-arrow-up" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          color="success"
                                          disabled={((values.task_type_wflows.length - 1) === idx) || noEdit}
                                          onClick={(evt) => this.handleSortTaskWorkflow('down', item, evt)}
                                        >
                                          <i className="fa fa-arrow-down" />
                                        </Button>
                                      </th>
                                      <td className="text-center">
                                        {idx + 1}{/*item.order_index*/}
                                      </td>
                                      <td className="">
                                        {item.name || item.task_work_follow_name}
                                      </td>
                                      {/* <td className="">
                                        {item.description}
                                      </td> */}
                                      <td className="text-center">
                                        <CustomInput
                                          id={`task_wflow_is_complete_${idx}`}
                                          readOnly
                                          checked={!!item.is_complete}
                                          type="switch"
                                          label=""
                                          disabled={noEdit}
                                        />
                                      </td>
                                      <td className="text-center">
                                        {noEdit ? null : <Button color="danger" size={"sm"} onClick={(event) => this.handleRemoveTaskWorkflow(item, event)}>
                                          <i className="fa fa-minus-circle" />
                                        </Button>}
                                      </td>
                                    </tr>
                                  ) : null;
                                })}
                                {!values.task_type_wflows.length ? (
                                  <tr><td colSpan={100}>&nbsp;</td></tr>
                                ) : null}
                              </tbody>
                            </Table>
                            <Col sm={12}>
                              <ErrorMessage name="task_type_wflows" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                            <CheckAccess permission="CRM_TASKWORKFLOW_ADD">
                              <Col sm={12}>
                                {noEdit ? null : <Button onClick={this.handleToggleTWA}>
                                  <i className="fa fa-plus-circle" /> Thêm mới bước
                                </Button>}
                              </Col>
                            </CheckAccess>
                          </FormGroup>
                        </Col>
                        <Col sm={12} className="mt-2">
                          <Row>
                            <Col sm={12} className="text-right">
                              {noEdit ? (
                                <CheckAccess permission="CRM_TASKTYPE_EDIT">
                                  <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/task-types/edit/${taskTypeEnt && taskTypeEnt.id()}`)}>
                                    <i className="fa fa-edit mr-1" />Chỉnh sửa
                                  </Button>
                                </CheckAccess>
                              ) : [
                                (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                  <i className="fa fa-save mr-2" />Lưu
                                </Button> : null,
                                (false !== this.props.handleActionSaveAndClose) ? <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                </Button> : null
                                ]
                              }
                              <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr('/task-types'))} className="btn-block-sm mt-md-0 mt-sm-2">
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

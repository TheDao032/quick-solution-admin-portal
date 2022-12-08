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
  Table,
  CustomInput
} from "reactstrap";
import Select from 'react-select';
import moment from 'moment';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css'
import { DateRangePicker } from 'react-dates'
import { START_DATE, END_DATE } from 'react-dates/constants'

// Component(s)
import Loading from "../Common/Loading";
import CustomerDataLeads from "./CustomerDataLeads";
import { CheckAccess } from "../../navigation/VerifyAccess";

// Model(s)
import TaskModel from "../../models/TaskModel";
import TaskTypeModel from '../../models/TaskTypeModel';
import CompanyModel from '../../models/CompanyModel';
import DepartmentModel from "../../models/DepartmentModel";
import UserModel from "../../models/UserModel";
import BusinessModel from '../../models/BusinessModel';

// Util(s)
import { mapDataOptions4Select, MOMENT_FORMAT_DATE } from '../../utils/html';

/**
 * @class TaskAdd
 */
export default class TaskAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._taskModel = new TaskModel();
    this._taskTypeModel = new TaskTypeModel();
    this._companyModel = new CompanyModel();
    this._departmentModel = new DepartmentModel();
    this._userModel = new UserModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleChangeCRLCompany = this.handleChangeCRLCompany.bind(this);
    this.handleChangeCRLDepartment = this.handleChangeCRLDepartment.bind(this);
    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onCloseDateRange = this.onCloseDateRange.bind(this);
    
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      taskTypes: [
        { name: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      taskParents: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      companies: [
        { label: "-- Công ty --", value: "" },
      ],
      /** @var {Object} */
      departmentsOf: [{ label: "-- Phòng ban --", value: "" }],
      /** @var {Array} */
      businessArr: [{ label: "-- Cơ sở --", value: "" }],
      /** @var {Object} */
      usersOf: [{ label: "-- Nhân viên --", value: "" }],
      /** @var {Object}: data to post */
      customers: null,
      /** @var {Array}: data to select */
      customersRender:[],
      /** @var {Boolean} */
      toggleCustomer: false,
      departmentSelected: null,
      businessSelected: null
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    
    this.props.CustomerEnts && this.handleAdd(this.props.CustomerEnts);
    //.end
  }

  formikValidationSchema = Yup.object().shape({
    task_type_id:Yup.string().required("Loại công việc là bắt buộc."),
    start_date: Yup.string().required("Thời gian bắt đầu là bắt buộc."),
    end_date: Yup.string().required("Thời gian kết thúc là bắt buộc."),
    task_name:Yup.string().required("Tên công việc là bắt buộc."),
    company_id: Yup.string().required("Công ty là bắt buộc."),
    department_id: Yup.string().required("Phòng ban là bắt buộc."),
    supervisor_name: Yup.string().required("Nhân viên giám sát là bắt buộc."),
    user_name: Yup.string().required("Nhân viên xử lý là bắt buộc."),
    list_task_dataleads: Yup.string().required("Khách hàng là bắt buộc."),
    business_id: Yup.string().required("Cơ sở là bắt buộc."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    Object.assign(values, {
    });
  }

  /** @var {String} */
  _btnType = null;

  getInitialValues() {

    let { TaskEnt, CustomerEnts } = this.props;
    let values = Object.assign(
      {}, this._taskModel.fillable()
    );
    
    if (TaskEnt) {
      Object.assign(values, TaskEnt);
    }

    if(CustomerEnts) {
      Object.assign(values,CustomerEnts, {"list_task_dataleads": "1"});
    }
    
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
    let { TaskEnt } = this.props;
    let bundle = {};
    let all = [
      // @TODO
      this._taskTypeModel.getOptionsForCreate()
        .then(data => (bundle['taskTypes'] = mapDataOptions4Select(data)) ),
      this._companyModel.getOptions({is_active:1})
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
    ];
    if(TaskEnt && TaskEnt.task_type_id){
      all.push(
        this._taskModel.getOptions({is_active:1, parent_id:TaskEnt.task_type_id })
        .then(data => (bundle['taskParents'] = mapDataOptions4Select(data))),
      );
    }

    if (TaskEnt && TaskEnt.company_id) {
      all.push(
        this._departmentModel.getOptions({ parent_id: TaskEnt.company_id, is_active: 1 })
          .then(data => (bundle['departmentsOf'] = mapDataOptions4Select(data))),
          this._businessModel.getOptions({ parent_id: TaskEnt.company_id, is_active: 1 })
          .then(data => (bundle['businessArr'] = mapDataOptions4Select(data))),
      );
      if(TaskEnt.department_id && TaskEnt.business_id){
        all.push(
          this._userModel.getOptionsFull({ department_id: TaskEnt.department_id, business_id: TaskEnt.business_id })
            .then(data => {
                // let { usersOf } = this.state;
                let dataCustomer = (data||[]).map(_item => {
                  let label = _item.name || _item.label;
                  let value = _item.user_name;
                  return({..._item,label, value});
                });
                // usersOf = [usersOf[0]].concat(dataCustomer);
                bundle['usersOf'] = dataCustomer;
            })
        );

      }
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
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    return bundle;
  }

  handleChangeCRLCompany(changeItem, field) {
    let { departmentsOf } = this.state;
    let { value: parent_id } = changeItem;
    if (parent_id) {
      this._departmentModel.getOptions({ parent_id, is_active: 1 })
        .then(data => {
          departmentsOf = [departmentsOf[0]].concat(mapDataOptions4Select(data));
          this.setState({ 
            departmentsOf,
            usersOf: [{ label: "-- Nhân viên --", value: "" }],
           });
          
        });
      this._businessModel.getOptions({ parent_id,is_active: 1 })
        .then(data => {
          let { businessArr } = this.state;
          businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
          this.setState({ businessArr});
        })
      ;
    }
    
    return field.onChange({
      target: {
        type: "select",
        name: "company_id",
        value: changeItem.value,
      }
    })
  }

  handleChangeCRLDepartment(changeItem, field) {
    let { usersOf, businessSelected } = this.state;
    let { value: department_id } = changeItem;
    if (department_id && businessSelected) {
      
      this._userModel.getOptionsFull({ department_id, business_id:businessSelected })
        .then(data => {
          let dataCustomer = (data||[]).map(_item => {
            let label = _item.name || _item.label;
            let value = _item.user_name;
            return({..._item,label, value});
          });
          usersOf = [usersOf[0]].concat(dataCustomer);
          this.setState({ usersOf });
        });
    }else{
      this.setState({ usersOf: [usersOf[0]] });
      field.onChange({
        target: {
          type: "select",
          name: "supervisor_name",
          value: '',
        }
      });
      field.onChange({
        target: {
          type: "select",
          name: "user_name",
          value: '',
        }
      });
    }
    
    this.setState({ departmentSelected: department_id});
    return field.onChange({
      target: {
        type: "select",
        name: "department_id",
        value: changeItem.value,
      }
    })
  }

  handleChangeCRLBusiness( changeItem, field ){
    let { usersOf, departmentSelected } = this.state;
    let { value: business_id } = changeItem;
    if (business_id && departmentSelected ) {
      this._userModel.getOptionsFull({ business_id, department_id: departmentSelected })
        .then(data => {
          let dataCustomer = (data||[]).map(_item => {
            let label = _item.name || _item.label;
            let value = _item.user_name;
            return({..._item,label, value});
          });
          usersOf = [usersOf[0]].concat(dataCustomer);
          this.setState({ usersOf });
        });
    }else{
      this.setState({ usersOf: [usersOf[0]] });
      field.onChange({
        target: {
          type: "select",
          name: "supervisor_name",
          value: '',
        }
      });
      field.onChange({
        target: {
          type: "select",
          name: "user_name",
          value: '',
        }
      });
    }

    this.setState({ businessSelected: business_id});
    return field.onChange({
      target: {
        type: "select",
        name: "business_id",
        value: changeItem.value,
      }
    })
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { TaskEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting, resetForm } = formProps;
    
    let willRedirect = false;
    let alerts = [];

    // get list_task_datalead
    let list_task_dataleads = [];
    for( var key in this.state.customers){
      list_task_dataleads.push({
        dataleads_id: key,
        user_name: values.user_name,
        supervisor_name: values.supervisor_name
      }); 
    }

    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      list_task_dataleads
    });
    delete formData['start_and_end_date'];

    let taskId = (TaskEnt && TaskEnt.task_id) || formData[this._taskModel];
    let apiCall = taskId
      ? this._taskModel.update(taskId, formData)
      : this._taskModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = Object.assign({ task_id: data }, formData);
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/task');
        }

        if (this._btnType === 'save' && !taskId) {
          resetForm();
          this.setState({
            area: null ,
            customers: {},
            customersRender:[],
            parent_id:null,

          });
        }

        // Chain
        return data;
      })
      .catch(apiData => { // NG
        let { errors, statusText } = apiData;
        let msg = [`<b>${statusText}</b>`].concat(errors || []).join('<br/>');
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        //
        if (!TaskEnt && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }
      })
    ;
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: true,
      alerts: [],
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  handleAdd = (customers) => {
    this.setState({
      toggleCustomer: false,
      customersRender: Object.entries(customers),
      customers,
    });

    if(this.formikProps){
      let { values, setValues } = this.formikProps;
      // attributes
      setValues(Object.assign(values, { "list_task_dataleads": customers }));
    }
  }

  toggleCustomer = () => this.setState({toggleCustomer: !this.state.toggleCustomer})

  handleRemoveCustomer = (item, event) => {
    let customers = Object.assign({},this.state.customers);
    delete customers[item[0]];
    this.setState({
      customersRender: Object.entries(customers),
      customers,
    })
    
    if(this.formikProps && Object.keys(customers).length === 0){
      let { values, setValues } = this.formikProps;
      // attributes
      setValues(Object.assign(values, { "list_task_dataleads": "" }));
    }
  }

  onChangeTaskType = (value, field) => {
    let { taskParents } = this.state;
    this._taskModel.getOptions({is_active:1, parent_id:value})
    .then(data => {
      taskParents = [taskParents[0]].concat(mapDataOptions4Select(data));
      this.setState({ taskParents });
    })

    field.onChange({
      target: { type: "select", name: "task_type_id", value }
    })
  };

  onDatesChange({ startDate, endDate }) {

    let { focusedInput } = this.state;
    if(focusedInput === END_DATE && endDate == null) {
      endDate = startDate;
    }
    if(focusedInput === START_DATE) {
      focusedInput = END_DATE;
      endDate = null;
    }

    this.setState({ focusedInput, startDate, endDate });

    let start_date = (startDate && startDate.format(MOMENT_FORMAT_DATE)) || "";
    let end_date = (endDate && endDate.format(MOMENT_FORMAT_DATE)) || "";

    let { values, setValues } = this.formikProps;
      // attributes
    setValues(Object.assign(values, {
      start_date,
      end_date,
      'start_and_end_date' : [startDate, endDate]
    }));
  }

  onFocusChange(focusedInput){ this.setState({ focusedInput }) }

  onCloseDateRange({startDate, endDate}){
    if((startDate || endDate) && (!startDate || !endDate)){
      startDate = startDate || endDate;
      endDate = startDate;
      let start_date = startDate.format(MOMENT_FORMAT_DATE);
      let end_date = endDate.format(MOMENT_FORMAT_DATE);

      let { values, setValues } = this.formikProps;
        // attributes
      setValues(Object.assign(values, {
        start_date,
        end_date,
        'start_and_end_date' : [startDate, endDate]
      }));
    }
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      taskTypes,
      taskParents,
      companies,
      departmentsOf,
      usersOf,
      customersRender,
      businessArr,
    } = this.state;
    
    let { TaskEnt, noEdit } = this.props;
    let initialValues = this.getInitialValues();
    // Ready?
    if (!ready) {
      return <Loading />;
    }
    
    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12}>
            <Card hidden={this.state.toggleCustomer}>
              <CardHeader>
                <b>{TaskEnt ? (noEdit ? `Chi tiết công việc ${TaskEnt.task_name}` : `Chỉnh sửa công việc ${TaskEnt.task_name}`) : 'Thêm mới công việc'}</b>
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
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    handleSubmit,
                    handleReset,
                    isSubmitting,
                  } = (this.formikProps = window._formikProps = formikProps);
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin công việc</b>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label for="task_type_id" sm={4}>
                              Loại công việc <span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="task_type_id"
                                render={({ field/*, form*/ }) => {
                                  let options = taskTypes.map(({ name: label, id: value }) => ({ value, label }));
                                  let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                  let placeholder = (taskTypes[0] && taskTypes[0].name) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={({ value }) => this.onChangeTaskType(value, field)}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      value={defaultValue}
                                      options={options}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="task_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Thời hạn từ <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="start_and_end_date"
                                  render={({ field, form }) => {
                                    return (
                                      <DateRangePicker

                                        startDate={values.start_date ? moment(values.start_date, MOMENT_FORMAT_DATE) : undefined}

                                        startDateId="start_date"
                                        endDate={values.end_date ? moment(values.end_date, MOMENT_FORMAT_DATE) : undefined}
                                        endDateId="end_date"
                                        onDatesChange={this.onDatesChange}
                                        onFocusChange={this.onFocusChange}
                                        focusedInput={this.state.focusedInput}
                                        onClose={this.onCloseDateRange}
                                        disabled={noEdit}
                                        displayFormat={MOMENT_FORMAT_DATE}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="start_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                                <ErrorMessage name="end_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />

                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label for="task_name" sm={4}>
                              Tên công việc <span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="task_name"
                                render={({ field }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                            <ErrorMessage name="task_name" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label for="parent_id" sm={4}>
                              Thuộc công việc
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="parent_id"
                                render={({ field/*, form*/ }) => {
                                  // let options = taskParents.map(({ task_name: label, task_id: value }) => ({ value, label }));
                                  let defaultValue = taskParents.find(({ value }) => (1 * value) === (1 * field.value));
                                  let placeholder = (taskParents[0] && taskParents[0].name) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={({ value }) => field.onChange({
                                        target: { type: "select", name: "parent_id", value }
                                      })}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      value={defaultValue}
                                      options={taskParents}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="parent_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={12}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="description" sm={2}>
                                  Mô tả
                                </Label>
                                <Col sm={10}>
                                  <Field
                                    name="description"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="textarea"
                                      id="description"
                                      disabled={noEdit}
                                    />}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin phân công</b>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Công ty <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="company_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = companies.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (companies[0] && companies[0].label) || '';
                                    return (
                                      <Select
                                        id={field.name}
                                        name={field.name}
                                        onChange={(changeValue) => this.handleChangeCRLCompany(changeValue, field)}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={companies}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                              <ErrorMessage name="company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Phòng ban <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="department_id"
                                  render={({ field}) => {
                                    let defaultValue = departmentsOf.find(({ value }) => (1 * value) === (1 * field.value)) || null;
                                    let placeholder = (departmentsOf[0] && departmentsOf[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={(changeValue) => this.handleChangeCRLDepartment(changeValue,field)}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={departmentsOf}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                              <ErrorMessage name="department_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Cơ sở <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="business_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = businessArr.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (businessArr[0] && businessArr[0].label) || '';
                                    return (
                                      <Select
                                        id={field.name}
                                        name={field.name}
                                        onChange={(changeValue) => this.handleChangeCRLBusiness(changeValue, field)}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={businessArr}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                              <ErrorMessage name="business_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                        <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Nhân viên giám sát <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="supervisor_name"
                                  render={({ field}) => {
                                    let defaultValue = usersOf.find(({ user_name }) => user_name === field.value ) || null;
                                    let placeholder = (usersOf[0] && usersOf[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={usersOf}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                              <ErrorMessage name="supervisor_name" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Nhân viên xử lý <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="user_name"
                                  render={({ field}) => {
                                    let defaultValue = usersOf.find(({ user_name }) => user_name === field.value) || null;
                                    let placeholder = (usersOf[0] && usersOf[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={usersOf}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="user_name" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="ward_id" sm={2}></Label>
                            <Col sm={10}>
                              <Field
                                name="is_active"
                                render={({ field }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_active}
                                  type="switch"
                                  id="is_active"
                                  label="Kích hoạt"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>

                      { !noEdit ?
                      <span>
                        <Row className="mb-4">
                          <Col xs={12}>
                            <b className="title_page_h1 text-primary">Thông tin khách hàng</b>
                            <ErrorMessage name="list_task_dataleads" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12} className="mb-2 d-flex justify-content-end">
                            <Button color="primary" onClick={() => { this.setState({ toggleCustomer:true }) } }>
                              Chọn khách hàng
                            </Button>
                          </Col> 
                          <Col sm={12}>
                            <Col sm={12}>
                              <FormGroup row hidden={values.is_auto_review} style={{overflowX:'scroll'}}>
                                <Table size="sm" bordered striped >
                                  <thead>
                                    <tr>
                                      <th style={{ width: '1%' }}>#</th>
                                      <th style={{ minWidth: '130px' }}>Mã khách hàng</th>
                                      <th style={{ minWidth: '130px' }}>Tên khách hàng</th>
                                      <th style={{ minWidth: '90px' }}>Giới tính</th>
                                      <th style={{ minWidth: '130px' }}>Ngày sinh</th>
                                      <th style={{ minWidth: '130px' }}>Số điện thoại</th>
                                      <th style={{ minWidth: '90px' }}>Email</th>
                                      <th style={{ width: '1%' }}>Xóa</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {customersRender.map((item, idx) => {
                                      let {
                                        data_leads_id,
                                        full_name,
                                        gender,
                                        birthday,
                                        phone_number,
                                        email
                                      } = item[1];
                                      //
                                      return item ? ([
                                        <tr key={`campaign_rlevel-0${idx}`}>
                                          <th scope="row" className="text-center align-middle">{idx + 1}</th>
                                          <td className="align-middle">
                                            <Label>{ data_leads_id }</Label>
                                          </td>
                                          <td className="align-middle">
                                            <Label>{ full_name }</Label>
                                          </td>
                                          <td className="align-middle">
                                            <Label>{ gender === 1 ? "Nam" : "Nữ" }</Label>
                                          </td>
                                          <td className="align-middle">
                                            <Label>{ birthday }</Label>
                                          </td>
                                          <td className="align-middle">
                                            <Label>{ phone_number }</Label>
                                          </td>
                                          <td className="align-middle">
                                            <Label>{ email }</Label>
                                          </td>
                                          <td className="text-center align-middle">
                                            <Button color="danger" disabled={noEdit} size={"sm"} onClick={(event) => this.handleRemoveCustomer(item, event)}>
                                              <i className="fa fa-minus-circle" />
                                            </Button>
                                          </td>
                                        </tr>
                                      ]) : null;
                                    })}
                                  </tbody>
                                </Table>
                                <Col sm={12}>
                                  <ErrorMessage name="campaign_type_relevels" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Col>
                        </Row>
                      </span>
                      : null
                      }

                      <Row>
                        <Col sm={12} className="text-right">
                          {
                            noEdit ? (
                              <span>
                                <Button color="primary" className="mr-2 btn-block-sm" onClick={()=>{window._$g.rdr(`/task/customers/${TaskEnt.task_id}`)} }>
                                  Thông tin khách hàng
                                </Button>
                                <CheckAccess permission="CRM_TASK_EDIT">
                                  <Button color="primary" className="mr-2 btn-block-sm mt-md-0 mt-sm-2" onClick={() => window._$g.rdr(`/task/edit/${TaskEnt.task_id}`)}>
                                    <i className="fa fa-edit mr-1" />Chỉnh sửa
                                  </Button>
                                </CheckAccess>
                              </span>
                            ):
                            [
                              (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                <i className="fa fa-save mr-2" />Lưu
                              </Button> : null,
                              (false !== this.props.handleActionSaveAndClose) ? <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                              </Button> : null
                            ]
                          }
                          <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr('/task'))} className="btn-block-sm mt-md-0 mt-sm-2">
                            <i className="fa fa-times-circle mr-1" />Đóng
                          </Button>
                          
                        </Col>
                      </Row>

                    </Form>
                  );
                }}</Formik>
              </CardBody>
            </Card>
            {
              this.state.toggleCustomer ? 
              <div className="modal-view">
                <div onClick={this.toggleCustomer}></div>
                <Col xs={12} style={{height:'90%'}} >
                  <CustomerDataLeads
                    handleAdd={this.handleAdd}
                    customersSelect={this.state.customers}
                    toggleCustomer={this.toggleCustomer}
                    taskID={TaskEnt && TaskEnt.task_id}
                  />
                </Col>
              </div>
            : null
            }

          </Col>
        </Row>
      </div>
    );
  }
}

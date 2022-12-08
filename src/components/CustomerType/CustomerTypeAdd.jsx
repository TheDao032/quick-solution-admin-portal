import React, { Component } from "react";
import { Formik, Field, ErrorMessage } from "formik";
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
  CustomInput
} from "reactstrap";
import Select from "react-select";

// Component(s)
import Loading from "../Common/Loading";
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)
import CustomerTypeModel from "../../models/CustomerTypeModel";
import CustomertypeGroupModel from "../../models/CustomerTypeGroupModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";
// Util(s)
import { mapDataOptions4Select, stringToAlias } from "../../utils/html";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class CustomerTypeAdd
 */
export default class CustomerTypeAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerTypeModel = new CustomerTypeModel();
    this._customerTypeGroupModel = new CustomertypeGroupModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this); 
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Number} */
      business_id: 1,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
       /** @var {Array} */
       customergroup:[{id: 0, name: "-- Chọn --", label: "-- Chọn --", value: ""}],
        /** @var {Array} */
       customertype: [
        { name: "Loại khách hàng là hội viên", id: 0 },//is_member
        { name: "Loại khách hàng là người mua hàng", id: 1 }, //is_sell
      ],
        /** @var {String} */
       // color: '',
       // color_text: '',
       // note_color:'',
       // note_color_text:'',
        /** @var {Array} */
      companies: [{ label: "-- Chọn --", value: "" }],
      /** @var {Array} */
      businessArr: [{ label: "-- Chọn --", value: "" }],
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

  formikValidationSchema = Yup.object().shape({
    customer_type_name: Yup.string().required("Tên loại khách hàng là bắt buộc."),
    customer_type_group_id: Yup.number()
    .nullable()  
    .required("Nhóm loại khách hàng là bắt buộc."), 
    order_index: Yup.number()
    .min(0, "Thứ tự bắt buộc lớn hơn hoặc bằng 0")
    .required("Thứ tự là bắt buộc."),
    company_id: Yup.string().required("Công ty áp dụng là bắt buộc."),
    business_id: Yup.string().required("Cơ sở áp dụng là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { CustomerTypeEnt } = this.props;
    let values = Object.assign({}, this._customerTypeModel.fillable());
    if (CustomerTypeEnt) {
      Object.assign(values, CustomerTypeEnt);
    } 
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      if(values['customer_type_group_id'] === "0")
      {
        values['customer_type_group_id'] = "";
      }
      
    });
    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { CustomerTypeEnt } = this.props;
    let bundle = {}
    let all = [
      // @TODO:
      this._customerTypeGroupModel.getOptions({ is_active: 1 })
        .then(data => (bundle['customergroup'] = mapDataOptions4Select(data))),
        this._companyModel
        .getOptions({ is_active: 1 })
        .then(data => (bundle["companies"] = mapDataOptions4Select(data)))
    ]
    if (CustomerTypeEnt && CustomerTypeEnt.company_id) {
      all.push(
        this._businessModel
          .getOptions({ parent_id: CustomerTypeEnt.company_id })
          .then(data => (bundle["businessArr"] = mapDataOptions4Select(data)))
      );
    }
    await Promise.all(all)
      .catch(err => {
        window._$g.dialogs.alert(
          window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
          () => {
            window.location.reload();
          }
        )
      });
      Object.keys(bundle).forEach((key) => {
        let data = bundle[key];
        let stateValue = this.state[key];
        if (data instanceof Array && stateValue instanceof Array) {
          data = [stateValue[0]].concat(data);
        }
        bundle[key] = data;
      });
    return bundle
  }

  handleChangeCustomerTypeGroup(changeValue) {
    let { values, setValues } = this.formikProps;
    let { value: customer_type_group_id } = changeValue;
    this.setState({ customertypegroup: changeValue });
    setValues(
      Object.assign(values, {
        customer_type_group_id,
        department_id: ""
      })
    );
  }
 
  handleChangeColor(event, field) {
    let alias = stringToAlias(event.target.value);
    field.onChange({ target: { type: "text", name: field.name, value: alias }})
    field.onChange({ target: { type: "text", name: "color_text", value: alias }})
  }

  handleChangeNoteColor(event, field) {
    let alias = stringToAlias(event.target.value);
    field.onChange({ target: { type: "text", name: field.name, value: alias }})
    field.onChange({ target: { type: "text", name: "note_color_text", value: alias }})
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikValidate(values) {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      (typeof values[prop] === "string") && (values[prop] = values[prop].trim());
    });
    //.end
  }
  handleChangeCompany(changeValue) {
    let { values, setValues } = this.formikProps;
    let { value: company_id } = changeValue;
    this._businessModel
      .getOptions({ parent_id: company_id || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr, company: changeValue });
        setValues(
          Object.assign(values, {
            company_id,
            department_id: ""
          })
        );
      });
  }

  handleFormikSubmit(values, formProps) {
    let { CustomerTypeEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting/*, resetForm*/ } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_system: (values.is_system != null) ? 1 * values.is_system : 0,
      is_member_type: (values.customertype == 0) ? 1: 0,
      is_sell:(values.customertype == 1) ? 1: 0,
      color: (values.color_text != "") ? values.color_text : values.color,
      note_color: (values.note_color_text != "") ? values.note_color_text : values.note_color,
    }); 
    let _customerTypeId = (CustomerTypeEnt && CustomerTypeEnt.customer_type_id) || formData[this._customerTypeModel];
    let apiCall = _customerTypeId
      ? this._customerTypeModel.update(_customerTypeId, formData)
      : this._customerTypeModel.create(formData)
    ;
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = await this._customerTypeModel.read(data, {});
          // let cbData = Object.assign({}, formData, { customer_type_id: data });
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/customer-type');
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
        if (!CustomerTypeEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      });
  }

  handleFormikReset() {
    this.setState(state => ({
      _id: 1 + state._id,
      ready: true,
      alerts: []
    }));
  }

  render() {
    let { _id, ready, alerts,customertype,customergroup,companies, businessArr, company , customertypegroup} = this.state;
    let { CustomerTypeEnt, noEdit } = this.props;
    let initialValues = this.getInitialValues();

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12} md={12}>
            <Card>
              <CardHeader>
                <b>{CustomerTypeEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} loại khách hàng {CustomerTypeEnt ? CustomerTypeEnt.status_name : ''}</b>
              </CardHeader>
              <CardBody>
                {/* general alerts */}
                {alerts.map(({ color, msg }, idx) => {
                  return (
                    <Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })} >
                      <span dangerouslySetInnerHTML={{ __html: msg }} />
                    </Alert>
                  );
                })}
                <Formik
                  initialValues={initialValues}
                  validationSchema={this.formikValidationSchema}
                  validate={this.handleFormikValidate}
                  onSubmit={this.handleFormikSubmit}
                >
                  {formikProps => {
                    let {
                      values,
                      handleSubmit,
                      handleReset,
                      isSubmitting
                    } = (this.formikProps = window._formikProps = formikProps);
                    // Render
                    return (
                      <Form
                        id="form1st"
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                      >
                        <Col xs={12}>
                          <Row>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="customer_type_name" sm={3}>
                                    Tên loại khách hàng {" "} <span className="font-weight-bold red-text"> * </span>
                                  </Label>
                                  <Col sm={9}>
                                    <Field name="customer_type_name"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={noEdit}
                                        />
                                      )}
                                    />
                                    <ErrorMessage
                                      name="customer_type_name" component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                              
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="customer_type_group_id" sm={3}> Thuộc nhóm loại khách hàng  <span className="font-weight-bold red-text"> * </span> </Label>
                                  <Col sm={9}>
                                    <Field
                                      name="customer_type_group_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = customergroup.find(
                                          ({ value }) =>
                                            1 * value === 1 * field.value
                                        );
                                        let placeholder = (customergroup[0] &&  customergroup[0].label) || "";
                                        return (
                                          <Select
                                            name={field.name}
                                            onChange={changeValue =>
                                              this.handleChangeCustomerTypeGroup(
                                                changeValue
                                              )
                                            }
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={customergroup}
                                            value={customertypegroup}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="customer_type_group_id" component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )}/>
                                  </Col>
                                </FormGroup>
                              </Col>

                              <Col xs={12}>
                                <FormGroup row>
                                  <Label sm={3}> Mã màu loại khách hàng </Label>
                                  <Col sm={2}>
                                    <Field
                                      name="color_text"
                                      key="color_text"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={noEdit}
                                        />
                                      )}
                                    /> 
                                  </Col> 
                                  
                                  <Col sm={1}>
                                    <Field
                                      name="color"
                                      key="color"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="color"
                                          placeholder=""
                                          disabled={noEdit}
                                          onChange={(data) => this.handleChangeColor(data, field) }
                                        />
                                      )}
                                    />
                                  </Col>

                                  <Label sm={3}> Mã màu ghi chú </Label>
                                  <Col sm={2}>
                                    <Field
                                      name="note_color_text"
                                      key="note_color_text"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={noEdit}
                                        />
                                      )}
                                    /> 
                                  </Col>
                                  <Col sm={1}>
                                    <Field
                                      name="note_color"
                                      key="note_color"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="color"
                                          placeholder=""
                                          disabled={noEdit}
                                          onChange={(data) => this.handleChangeNoteColor(data, field) }
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                              
                              <Col xs="12">
                              <FormGroup>
                                <Row>
                                  <Label sm={3}>
                                    Công ty áp dụng
                                    <span className="font-weight-bold red-text"> * </span>
                                  </Label>
                                  <Col sm={9}>
                                    <Field
                                      name="company_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = companies.find(
                                          ({ value }) =>
                                            1 * value === 1 * field.value
                                        );
                                        let placeholder =
                                          (companies[0] &&
                                            companies[0].label) ||
                                          "";
                                        let props = {
                                          name: field.name,
                                          onChange: changeValue => this.handleChangeCompany(changeValue),
                                          isSearchable: true,
                                          placeholder: placeholder,
                                          defaultValue: defaultValue,
                                          options: companies,
                                          value: company,
                                          isDisabled: noEdit
                                        };
                                        if (this.props.alterCompanySelectProps) {
                                          this.props.alterCompanySelectProps(props);
                                        }
                                        return (<Select {...props}/>);
                                      }}
                                    />
                                    <ErrorMessage
                                      name="company_id"
                                      component={({ children }) => (
                                        <Alert color="danger" className="field-validation-error">{children}</Alert>
                                      )}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={3}>
                                    Cơ sở áp dụng
                                    <span className="font-weight-bold red-text">
                                      *
                                    </span>
                                  </Label>
                                  <Col sm={9}>
                                    <Field
                                      key={`business_id_of_${values.company_id}`}
                                      name="business_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = businessArr.find(
                                          ({ value }) =>
                                            1 * value === 1 * field.value
                                        );
                                        let placeholder =
                                          (businessArr[0] &&
                                            businessArr[0].label) ||
                                          "";
                                        let props = {
                                          name: field.name,
                                          onChange: ({ value }) => field.onChange({
                                            target: { name: field.name, value }
                                          }),
                                          isSearchable: true,
                                          placeholder: placeholder,
                                          defaultValue: defaultValue,
                                          options: businessArr,
                                          isDisabled: noEdit,
                                        };
                                        if (this.props.alterBusinessSelectProps) {
                                          this.props.alterBusinessSelectProps(props);
                                        }
                                        return (<Select {...props} />);
                                      }}
                                    />
                                    <ErrorMessage
                                      name="business_id"
                                      component={({ children }) => (
                                        <Alert color="danger" className="field-validation-error">{children}</Alert>
                                      )}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="order_index" sm={3}> Thứ tự  <span className="font-weight-bold red-text">  * </span></Label>
                                  <Col sm={2}>
                                  <Field
                                    name="order_index"
                                    render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="number"
                                    id={field.name}
                                    className="text-right"
                                    placeholder=""
                                    disabled={noEdit}
                                    min={0}
                                    />}
                                    />
                                     <ErrorMessage name="order_index" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                  <Col sm={1}></Col>
                                  <Col sm={6}>
                                  <Row>
                                        {customertype.map(({ name, id }, idx) => {
                                          return (
                                            <Col xs={12} key={`customertype-${idx}`}>
                                              <FormGroup check>
                                                <Label check>
                                                  <Field
                                                    name="customertype"
                                                    render={({ field /* _form */ }) => <Input
                                                      {...field}
                                                      onBlur={null}
                                                      value={id}
                                                      type="radio"
                                                      checked={(1 * values.customertype) === (1 * id)}
                                                      id={`customertype_${id}`}
                                                      disabled={noEdit}
                                                    />}
                                                  /> {name}
                                                </Label>
                                              </FormGroup>
                                            </Col>
                                          );
                                        })}
                                  </Row>
                                  </Col>
                                </FormGroup>
                              </Col>

                              
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="description" sm={3}>  Mô tả </Label>
                                  <Col sm={9}>
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
                              
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="is_active" sm={3}></Label>
                                  <Col sm={4}>
                                    <Field
                                      name="is_active"
                                      render={({ field }) => (
                                        <CustomInput
                                          {...field}
                                          className="pull-left"
                                          onBlur={null}
                                          checked={values.is_active}
                                          type="switch"
                                          id="is_active"
                                          label="Kích hoạt"
                                          disabled={noEdit}
                                        />
                                      )}
                                    />
                                  </Col>
                                  <Col sm={4}>
                                    <Field
                                      name="is_system"
                                      render={({ field }) => (
                                        <CustomInput
                                          {...field}
                                          className="pull-left"
                                          onBlur={null}
                                          checked={values.is_system}
                                          type="switch"
                                          id="is_system"
                                          label="Hệ thống"
                                          disabled={noEdit}
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                          
                              <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="" sm={3}></Label>
                                    <Col sm={9}>
                                      <div className="d-flex button-list-default justify-content-end">
                                        {
                                          noEdit ? (
                                            <CheckAccess permission="CRM_CUSTOMERTYPE_EDIT">
                                              <Button color="primary" className="mr-2 btn-block-sm"
                                                onClick={() => window._$g.rdr(`/customer-type/update/${CustomerTypeEnt && CustomerTypeEnt.id()}`)}
                                                disabled={(!userAuth._isAdministrator() && CustomerTypeEnt.is_system !== 0)}
                                              >
                                                <i className="fa fa-edit mr-1" />Chỉnh sửa
                                                </Button>
                                            </CheckAccess>
                                          ) :
                                            [
                                              (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting}  onClick={() => this.handleSubmit("save") } className="ml-3"> 
                                                <i className="fa fa-save mr-2" /> <span className="ml-1">Lưu</span>
                                              </Button> : null,
                                              (false !== this.props.handleActionSaveAndClose) ? <Button  key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit("save_n_close") } className="ml-3">
                                                <i className="fa fa-save mr-2" /> <span className="ml-1"> Lưu &amp; Đóng </span>
                                              </Button> : null
                                            ]
                                        }
                                        <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr("/customer-type"))} className="ml-3" >
                                          <i className="fa fa-times-circle mr-1" /> <span className="ml-1">Đóng</span>
                                        </Button>
                                      </div>
                                    </Col>
                                  </FormGroup>
                                </Col>
                          </Row>
                        </Col>
                      </Form>
                    );
                  }}
                </Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

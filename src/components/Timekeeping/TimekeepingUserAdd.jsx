import React, { PureComponent } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
  Alert,
  CustomInput,
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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Table
} from 'reactstrap';
import Select from 'react-select';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';
// import Loading from '../Common/Loading';
import NumberFormat from '../Common/NumberFormat';
// import DatePicker from '../Common/DatePicker';
import Products from '../Products/Products';
import CustomerDataLeads from '../CustomerDataLeads/CustomerDataLeads';

// Util(s)
import {
  mapDataOptions4Select,
  MOMENT_FORMAT_DATE
} from "../../utils/html";
// import * as utils from '../../utils';

// Model(s)
import TimekeepingUserModel from '../../models/TimekeepingUserModel';
import TimekeepingUserTypeModel from '../../models/TimekeepingUserTypeModel';
import RelationshipModel from '../../models/RelationshipModel';
import CompanyModel from '../../models/CompanyModel';
import BusinessModel from '../../models/BusinessModel';
import CampaignModel from '../../models/CampaignModel';
import SegmentModel from '../../models/SegmentModel';
/**
 * @class TimekeepingUserAdd
 */
export default class TimekeepingUserAdd extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._timekeepingUserModel = new TimekeepingUserModel();
    this._timekeepingUserTypeModel = new TimekeepingUserTypeModel();
    this._relationshipModel = new RelationshipModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
    this._campaignModel = new CampaignModel();
    this._segmentModel = new SegmentModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    this.state = {
      /** @var {number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      willShowSelectProduct: false,
      /** @var {Boolean} */
      willShowSelectCDL: false,
      /** @var {Array} */
      timekeepingUserTypeArr: [
        { label: "-- Ch???n --", value: "" },
      ],
      /** @var {Array} */
      companies: [
        { label: "-- Ch???n --", value: "" },
      ],
      /** @var {Array} */
      businessArr: [
        { label: "-- Ch???n --", value: "" },
      ],
      /** @var {Object} */
      customerDataLead: null,
      /** @var {Array} */
      relationshipArr: [
        { label: "-- Ch???n --", value: "" },
      ],
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
    let { timekeepingUserEnt } = this.props;
    let values = Object.assign(
      {}, this._timekeepingUserModel.fillable(),
    );
    if (timekeepingUserEnt) {
      Object.assign(values, timekeepingUserEnt);
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
    let { timekeepingUserEnt } = this.props;
    let bundle = {};
    let all = [
      this._timekeepingUserTypeModel.getOptions({ is_active: 1 })
        .then(data => (bundle['timekeepingUserTypeArr'] = mapDataOptions4Select(data))),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
      this._relationshipModel.getOptions({ is_active: 1 })
        .then(data => (bundle['relationshipArr'] = mapDataOptions4Select(data))),
    ];
    if (timekeepingUserEnt && timekeepingUserEnt.company_id) {
      all.push(
        this._businessModel.getOptions({ parent_id: timekeepingUserEnt.company_id })
          .then(data => (bundle['businessArr'] = mapDataOptions4Select(data)))
      );
    }
    await Promise.all(all)
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
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    timekeepingUser_type_id: Yup.string()
      .required("Lo???i h???p ?????ng l?? b???t bu???c."),
    business_id: Yup.string()
      .required("C?? s??? ph??ng t???p l?? b???t bu???c."),
    order_detais: Yup.array()
      .required("Th??ng tin s???n ph???m l?? b???t bu???c."),
    total_value: Yup.number()
      // .min(0, "T???ng gi?? tr??? h???p ?????ng b???t bu???c l???n h??n ho???c b???ng 0")
      .required("T???ng gi?? tr??? h???p ?????ng l?? b???t bu???c."),
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
      business_id: values.company_id ? values.business_id : "",
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
    let { timekeepingUserEnt } = this.props;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let formData = Object.assign({}, values, {
      is_active: (1 * values.is_active),
    });
    delete formData.start_and_end_date;
    // console.log('formData: ', formData);
    //
    let timekeepingUserId = (timekeepingUserEnt && timekeepingUserEnt.id()) || formData[this._timekeepingUserModel.primaryKey];
    let apiCall = timekeepingUserId
      ? this._timekeepingUserModel.update(timekeepingUserId, formData)
      : this._timekeepingUserModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('L??u th??nh c??ng!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/timekeepingUsers');
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
        if (!timekeepingUserEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { timekeepingUserEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: []
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  handleFormikValidate = (values) => {
    let errors = {};
    let {
      customerDataLead
    } = this.state;
    let {
      data_leads_id,
      is_agree
    } = values;
    // Thong tin khach hang
    if (!data_leads_id && !customerDataLead) {
      errors.data_leads_id = "Th??ng tin kh??ch h??ng l?? b???t bu???c.";
    }
    // Thong tin nguoi giam ho
    if (is_agree) {
      if (!('' + values.full_name_guardian).trim()) {
        errors.full_name_guardian = "T??n ng?????i gi??m h??? l?? b???t bu???c.";
      }
      if (!('' + values.relation_ship_member_id).trim()) {
        errors.relation_ship_member_id = "M???i quan h??? v???i h???i vi??n l?? b???t bu???c.";
      }
      if (!('' + values.guardian_phone_number).trim()) {
        errors.relation_ship_member_id = "S??? ??i???n tho???i l?? b???t bu???c.";
      }
      if (!('' + values.guardian_email).trim()) {
        errors.guardian_email = "Email l?? b???t bu???c.";
      }
    }
    //
    return errors;
  }

  handleChangeCompany = (changeValue) => {
    let { values, setValues } = this.formikProps;
    let { value: company_id } = changeValue;
    this._businessModel.getOptions({ parent_id: company_id || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr });
        setValues(Object.assign(values, {
          company_id, "business_id": ""
        }))
      })
    ;
  }

  /**
   * @return {Boolean}
   */
  checkBusinessData() {
    return true;
  }

  handlePickProducts = (itemsObj) => {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("B???n vui l??ng ch???n s???n ph???m!");
    }
    let { values, handleChange } = this.formikProps;
    let { order_detais: value } = values;
    (value || []).forEach(item => {
      if (itemsObj[item.product_id]) {
        delete itemsObj[item.product_id];
      }
    });
    items = Object.values(itemsObj);
    value = (value || []).concat(items);
    this.setState({ willShowSelectProduct: false }, () => {
      handleChange({ target: { name: "order_detais", value }});
    });
  }

  handleDelProduct = (item, evt) => {
    let { values, handleChange } = this.formikProps;
    let { order_detais: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) { return; }
    window._$g.dialogs.prompt(`B???n mu???n x??a s???n ph???m?`, (isYes) => {
      if (isYes) {
        value.splice(foundIdx, 1);
        handleChange({ target: { name: "order_detais", value }});
      }
    });
  }

  handlePickCDL = (itemsObj) => {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("B???n vui l??ng ch???n kh??ch h??ng!");
    }
    let { handleChange } = this.formikProps;
    let customerDataLead = items[0];
    //
    this.setState({ customerDataLead, willShowSelectCDL: false }, () => {
      let {data_leads_id} = customerDataLead;
      handleChange({ target: { name: "data_leads_id", data_leads_id }});
    });
  }

  render() {
    let {
      _id,
      alerts,
      willShowSelectProduct,
      willShowSelectCDL,
      timekeepingUserTypeArr,
      companies,
      businessArr,
      relationshipArr,
      customerDataLead
    } = this.state;
    customerDataLead = customerDataLead || {};
    let { timekeepingUserEnt, noEdit: propNoEdit } = this.props;
    let noEdit = propNoEdit || (timekeepingUserEnt && (null !== timekeepingUserEnt.is_reviewed)); // If timekeepingUser is reviewed --> disable edit.
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    return (
      <div id="timekeepingUser-div" key={`view-${_id}`} className="animated fadeIn">
        {/** start#Products */}{willShowSelectProduct
          ? (
            <div className="overlay"><div className="overlay-box">
              <div className="overlay-toolbars">
                <Button
                  color="danger" size="sm"
                  onClick={() => this.setState({ willShowSelectProduct: false })}
                >
                  <i className="fa fa-window-close" />
                </Button>
              </div>
              <Products
                stateQuery={{
                  business_id: ((this.formikProps && this.formikProps.values.list_company) || [])
                    .map(item => item.business_id).filter(_i => !!_i).join('|')
                }}
                controlIsActiveProps={{ disabled: true }}
                filterProps={{
                  controlIsActiveProps: { isDisabled: true }
                }}
                handlePick={this.handlePickProducts}
              />
            </div></div>
          ) : null
        }{/** end#Products */}
        {/** start#CustomerDataLeads */}{willShowSelectCDL
          ? (
            <div className="overlay"><div className="overlay-box">
              <div className="overlay-toolbars">
                <Button
                  color="danger" size="sm"
                  onClick={() => this.setState({ willShowSelectCDL: false })}
                >
                  <i className="fa fa-window-close" />
                </Button>
              </div>
              <CustomerDataLeads
                // stateQuery={{}}
                controlIsActiveProps={{ disabled: true }}
                filterProps={{
                  controlIsActiveProps: { isDisabled: true }
                }}
                handlePick={this.handlePickCDL}
              />
            </div></div>
          ) : null
        }{/** end#CustomerDataLeads */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{timekeepingUserEnt ? (noEdit ? 'Chi ti???t' : 'Ch???nh s???a') : 'Th??m m???i'} h???p ?????ng {timekeepingUserEnt ? `"${timekeepingUserEnt.timekeepingUser_name}"` : ''}</b>
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
                  // Flag: can review?
                  let flagTimekeepingUserRLNoEdit = false;
                  // let startDate = values.start_date ? moment(values.start_date, MOMENT_FORMAT_DATE) : null;
                  let endDate = values.end_date ? moment(values.end_date, MOMENT_FORMAT_DATE) : null;
                  if (endDate && endDate <= moment()) {
                    flagTimekeepingUserRLNoEdit = true;
                  }

                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Th??ng tin h???p ?????ng</b>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4}>
                              Lo???i h???p ?????ng<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="timekeepingUser_type_id"
                                render={({ field/*, form */}) => {
                                  let defaultValue = timekeepingUserTypeArr.find(({ value }) => ('' + value) === ('' + field.value));
                                  let placeholder = (timekeepingUserTypeArr[0] && timekeepingUserTypeArr[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      // defaultValue={defaultValue}
                                      value={defaultValue}
                                      options={timekeepingUserTypeArr}
                                      isDisabled={!!timekeepingUserEnt || noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="timekeepingUser_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4} />
                              <Col sm={8}>
                                <Field
                                  name="is_renew"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_renew}
                                    type="switch"
                                    id={field.name}
                                    label="Gia h???n?"
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="is_renew" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                S??? h???p ?????ng h???i vi??n
                              </Label>
                              <Col sm={8}>
                                  <Field
                                    name="timekeepingUser_number"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id={field.name}
                                      placeholder=""
                                      disabled={noEdit}
                                      readOnly={true}
                                    />}
                                  />
                                  <ErrorMessage name="timekeepingUser_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                T???ng gi?? tr??? h???p ?????ng<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <InputGroup>
                                  <Field
                                    name="total_value"
                                    render={({ field /* _form */ }) => <NumberFormat
                                      name={field.name}
                                      onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                      defaultValue={values[field.name]}
                                      disabled={noEdit}
                                      readOnly={true}
                                    />}
                                  />
                                  <InputGroupAddon addonType="append">
                                    <InputGroupText>VND</InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <ErrorMessage name="total_value" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                C??ng ty<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="company_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = companies.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (companies[0] && companies[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={(changeValue) => this.handleChangeCompany(changeValue)}
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
                                C?? s??? ph??ng t???p<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  key={`business_id_of_${values.company_id}`}
                                  name="business_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = businessArr.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (businessArr[0] && businessArr[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
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
                                Hi???u l???c h???p ?????ng t???
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="start_and_end_date"
                                  render={({ field, form }) => {
                                    return (
                                      <DateRangePicker
                                        startDate={values.start_date ? moment(values.start_date, MOMENT_FORMAT_DATE) : undefined}
                                        startDateId="start_date" // PropTypes.string.isRequired,
                                        endDate={values.end_date ? moment(values.end_date, MOMENT_FORMAT_DATE) : undefined}
                                        endDateId="end_date" // PropTypes.string.isRequired,
                                        onDatesChange={({ startDate, endDate }) => {
                                          let start_date = (startDate && startDate.format(MOMENT_FORMAT_DATE)) || "";
                                          let end_date = (endDate && endDate.format(MOMENT_FORMAT_DATE)) || "";
                                          form.setValues(Object.assign(form.values, {
                                            start_date, end_date, [field.name]: [startDate, endDate]
                                          }));
                                        }} // PropTypes.func.isRequired,
                                        focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                        onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                                        disabled={noEdit}
                                        displayFormat={MOMENT_FORMAT_DATE}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="start_and_end_date" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                T???ng s??? ng??y
                              </Label>
                              <Col sm={8}>
                                <InputGroup>
                                  <Field
                                    name="tong_so_ngay"
                                    render={({ field /* _form */ }) => <NumberFormat
                                      name={field.name}
                                      onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                      defaultValue={values[field.name]}
                                      disabled={noEdit}
                                      readOnly={true}
                                    />}
                                  />
                                  <InputGroupAddon addonType="append">
                                    <InputGroupText>ng??y</InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <ErrorMessage name="tong_so_ngay" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Th??ng tin kh??ch h??ng</b>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12}>
                          <CheckAccess permission="CRM_CUSDATALEADS_VIEW">
                          {(hasAccess) => {
                            return (<FormGroup row>
                              <Col sm={12} className="text-right mb-2">
                                {!hasAccess ? (
                                  <Alert color="warning" className="text-left mt-2">
                                    B???n kh??ng c?? quy???n ch???n kh??ch h??ng cho t??nh n??ng n??y. Vui l??ng li??n h??? qu???n tr??? vi??n ????? bi???t th??m chi ti???t.
                                  </Alert>
                                ) : (
                                  noEdit ? null : (<Button disabled={noEdit} className="" onClick={() => {
                                    this.checkBusinessData() && this.setState({ willShowSelectCDL: true });
                                  }}>
                                    <i className="fa fa-plus-circle" /> Ch???n kh??ch h??ng
                                  </Button>)
                                )}
                              </Col>
                            </FormGroup>)}}
                          </CheckAccess>
                          <ErrorMessage name="data_leads_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_ma_khach_hang">M?? kh??ch h??ng</Label>
                            <Col sm={8}>
                              <Input
                                name="_ma_khach_hang"
                                type="text"
                                value={customerDataLead.data_leads_id || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_ten_khach_hang">T??n kh??ch h??ng</Label>
                            <Col sm={8}>
                              <Input
                                name="_ten_khach_hang"
                                type="text"
                                value={customerDataLead.full_name || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_ngay_sinh">Ng??y sinh</Label>
                            <Col sm={8}>
                              <Input
                                name="_ngay_sinh"
                                type="text"
                                value={customerDataLead.birthday || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_gioi_tinh">Gi???i t??nh</Label>
                            <Col sm={8}>
                              <Input
                                name="_gioi_tinh"
                                type="text"
                                value={(''+ customerDataLead.gender) === '1' ? 'Nam' : ((''+ customerDataLead.gender) === '0' ? 'N???' : '')}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_email">Email</Label>
                            <Col sm={8}>
                              <Input
                                name="_email"
                                type="text"
                                value={customerDataLead.email || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_so_dien_thoai">S??? ??i???n tho???i</Label>
                            <Col sm={8}>
                              <Input
                                name="_so_dien_thoai"
                                type="text"
                                value={customerDataLead.phone_number || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="_dia_chi" sm={2}>?????a ch???</Label>
                            <Col sm={10}>
                              <Input
                                name="_dia_chi"
                                type="text"
                                value={customerDataLead.address_full || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_thuoc_chien_dich">Thu???c chi???n d???ch</Label>
                            <Col sm={8}>
                              <Input
                                name="_thuoc_chien_dich"
                                type="text"
                                value={(customerDataLead.campaign_name || []).join()}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_phan_khuc_khach_hang">Ph??n kh??c kh??ch h??ng</Label>
                            <Col sm={8}>
                              <Input
                                name="_phan_khuc_khach_hang"
                                type="text"
                                value={(customerDataLead.segment_name || []).join()}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="note_healthy" sm={2}>T??nh tr???ng s???c kh???e</Label>
                            <Col sm={10}>
                              <Field
                                name="note_healthy"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="note_healthy" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label sm={2}>M???c ti??u s??? d???ng d???ch v???</Label>
                            <Col sm={10}>
                              <Field
                                name="purpose"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  id={field.name}
                                  placeholder=""
                                  maxLength={400}
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="purpose" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup>
                            <Row>
                              <Label sm={2} for="is_agree" />
                              <Col sm={10}>
                                <Field
                                  name="is_agree"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values[field.name]}
                                    type="switch"
                                    id={field.name}
                                    label="C???n ng?????i gi??m h????"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row id="guardian-info" hidden={!values.is_agree}>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="full_name_guardian">
                              T??n ng?????i gi??m h???<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="full_name_guardian"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="full_name_guardian" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="relation_ship_member_id">
                              M???i quan h??? v???i h???i vi??n<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="relation_ship_member_id"
                                render={({ field/*, form */}) => {
                                  let defaultValue = relationshipArr.find(({ value }) => ('' + value) === ('' + field.value));
                                  let placeholder = (relationshipArr[0] && timekeepingUserTypeArr[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      // defaultValue={defaultValue}
                                      value={defaultValue}
                                      options={relationshipArr}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="relation_ship_member_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="guardian_phone_number">
                              S??? ??i???n tho???i<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="guardian_phone_number"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="guardian_phone_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="guardian_email">
                              Email<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="guardian_email"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="guardian_email" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="guardian_id_card">
                              CMND/H??? chi???u
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="guardian_id_card"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="guardian_id_card" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="full_address_guardian">?????a ch???</Label>
                            <Col sm={8}>
                              <Field
                                name="full_address_guardian"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="full_address_guardian" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Th??ng tin s???n ph???m</b>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12}>
                          <CheckAccess permission="MD_PRODUCT_VIEW">
                          {(hasAccess) => {
                            return (<FormGroup row>
                              <Col sm={12} className="text-right mb-2">
                                {!hasAccess ? (
                                  <Alert color="warning" className="text-left mt-2">
                                    B???n kh??ng c?? quy???n ch???n s???n ph???m cho t??nh n??ng n??y. Vui l??ng li??n h??? qu???n tr??? vi??n ????? bi???t th??m chi ti???t.
                                  </Alert>
                                ) : (
                                  noEdit ? null : (<Button disabled={noEdit} className="" onClick={() => {
                                    this.checkBusinessData() && this.setState({ willShowSelectProduct: true });
                                  }}>
                                    <i className="fa fa-plus-circle" /> Ch???n s???n ph???m
                                  </Button>)
                                )}
                              </Col>
                              <Col sm={12}>
                                <ErrorMessage name="order_detais" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                <Table size="sm" bordered striped hover responsive>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '1%' }}>#</th>
                                      <th>{window._$g._('M?? s???n ph???m')}</th>
                                      <th>{window._$g._('T??n s???n ph???m')}</th>
                                      <th>{window._$g._('H??nh th???c xu???t')}</th>
                                      <th>{window._$g._('Danh m???c s???n ph???m')}</th>
                                      <th>{window._$g._('C?? gi?? tr??? theo ng??y')}</th>
                                      <th style={{ width: '1%' }}>{window._$g._('X??a')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>{(() => {
                                    return values.order_detais.map((item, idx) => {
                                      return item ? (
                                        <tr key={`order_detais-${idx}`}>
                                          <th scope="row" className="text-center">{idx + 1}</th>
                                          <td className="">{item.product_code}</td>
                                          <td className="">{item.product_name}</td>
                                          <td className="">{item.model_name}</td>
                                          <td className="">{item.manufacturer_name}</td>
                                          <td className="text-center">
                                            {hasAccess ? (
                                              noEdit ? null : (
                                                <Button color="danger" size={"sm"} onClick={(event) => this.handleDelProduct(item, event)}>
                                                  <i className="fa fa-minus-circle" />
                                                </Button>
                                              )
                                            ) : null}
                                          </td>
                                        </tr>
                                      ) : null;
                                    });
                                  })()}</tbody>
                                </Table>
                              </Col>
                            </FormGroup>)}}
                          </CheckAccess>
                        </Col>
                        <Col xs={12} className="text-right font-weight-bold">
                          <Row>
                            <Label sm={9}>C???ng t???ng ti???n:</Label>
                            <Col sm={3}>9.000.000 VND</Col>
                          </Row>
                          <Row>
                            <Label sm={9}>T???ng VAT:</Label>
                            <Col sm={3}>9.000.000 VND</Col>
                          </Row>
                          <Row>
                            <Label sm={9}>T???ng ti???n ???????c khuy???n m??i:</Label>
                            <Col sm={3}>2.000.000 VND</Col>
                          </Row>
                          <Row>
                            <Label sm={9}>T???ng thanh to??n:</Label>
                            <Col sm={3}>7.900.000 VND</Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col sm={12} className="text-right">
                          {propNoEdit ? (
                            <CheckAccess permission="CT_CONTRACT_EDIT">
                              <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/timekeepingUsers/edit/${timekeepingUserEnt.id()}`)}>
                                <i className="fa fa-edit mr-1" />Ch???nh s???a
                              </Button>
                            </CheckAccess>
                          ) : ([
                              <Button
                                key="buttonSave"
                                type="submit"
                                color="primary"
                                disabled={isSubmitting || noEdit}
                                onClick={() => this.handleSubmit('save')}
                                className="mr-2 btn-block-sm"
                              >
                                <i className="fa fa-save mr-2" />L??u
                              </Button>,
                              <Button
                                key="buttonSaveClose"
                                type="submit"
                                color="success"
                                disabled={isSubmitting || noEdit}
                                onClick={() => this.handleSubmit('save_n_close')}
                                className="mr-2 btn-block-sm mt-md-0 mt-sm-2"
                              >
                                <i className="fa fa-save mr-2" />L??u &amp; ????ng
                              </Button>
                            ])
                          }
                            <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/timekeepingUsers')} className="btn-block-sm mt-md-0 mt-sm-2">
                              <i className="fa fa-close" />
                              <span className="ml-1">????ng</span>
                            </Button>
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
    )
  }
}

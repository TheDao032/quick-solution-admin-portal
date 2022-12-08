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
import moment from 'moment';

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';
// import Loading from '../Common/Loading';
import NumberFormat from '../Common/NumberFormat';
import DatePicker from '../Common/DatePicker';
import Products from './Products';
import CustomerDataLeads from '../CustomerDataLeads/CustomerDataLeads';

// Util(s)
import {
  mapDataOptions4Select,
  MOMENT_FORMAT_DATE
} from "../../utils/html";
import {numberFormat} from "../../utils";
// import * as utils from '../../utils';

// Model(s)
import ContractModel from '../../models/ContractModel';
import ContractTypeModel from '../../models/ContractTypeModel';
import RelationshipModel from '../../models/RelationshipModel';
import CompanyModel from '../../models/CompanyModel';
import BusinessModel from '../../models/BusinessModel';
import CampaignModel from '../../models/CampaignModel';
import SegmentModel from '../../models/SegmentModel';

window._moment = moment;

/**
 * @class ContractAdd
 */
export default class ContractAdd extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._contractModel = new ContractModel();
    this._contractTypeModel = new ContractTypeModel();
    this._relationshipModel = new RelationshipModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
    this._campaignModel = new CampaignModel();
    this._segmentModel = new SegmentModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    // +++
    Object.assign(this.handlePickCDL, {
      single: true // pick only one a time
    });

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
      contractTypeArr: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      companies: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      businessArr: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Object} */
      customerDataLead: null,
      /** @var {Array} */
      relationshipArr: [
        { label: "-- Chọn --", value: "" },
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
    let { contractEnt } = this.props;
    let values = Object.assign(
      {}, this._contractModel.fillable(),
    );
    if (contractEnt) {
      Object.assign(values, contractEnt);
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
    let { contractEnt } = this.props;
    let bundle = {};
    let all = [
      this._contractTypeModel.getOptionsFull({ is_active: 1 })
        .then(data => (bundle['contractTypeArr'] = mapDataOptions4Select(data))),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
      this._relationshipModel.getOptions({ is_active: 1 })
        .then(data => (bundle['relationshipArr'] = mapDataOptions4Select(data))),
    ];
    if (contractEnt && contractEnt.company_id) {
      all.push(
        this._businessModel.getOptions({ parent_id: contractEnt.company_id })
          .then(data => (bundle['businessArr'] = mapDataOptions4Select(data)))
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
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    contract_type_id: Yup.string()
      .required("Loại hợp đồng là bắt buộc."),
    business_id: Yup.string()
      .required("Cơ sở phòng tập là bắt buộc."),
    order_detais: Yup.array()
      .required("Thông tin sản phẩm là bắt buộc."),
    // total_value: Yup.number()
      // .min(0, "Tổng giá trị hợp đồng bắt buộc lớn hơn hoặc bằng 0")
      // .required("Tổng giá trị hợp đồng là bắt buộc."),
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
    let { contractEnt } = this.props;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    let _ = '';
    let {order_detais: orderDetais, ...formData} = values;
    // +++ Thong tin san pham
    let order_detais = [];
    orderDetais.forEach(_i => {
      order_detais.push({
        [_ = "product_id"]: _i[_],
        [_ = "output_type_id"]: _i[_],
        [_ = "promotion_id"]: _i[_],
        [_ = "price"]: 1 * _i[_],
        [_ = "quantity"]: 1 * _i[_],
        [_ = "total_discount"]: 1 * _i[_],
        [_ = "vat_amount"]: 1 * _i[_],
        [_ = "total_amount"]: 1 * _i[_]
      });
    });
    // +++
    Object.assign(formData, {
      [_ = "is_renew"]: (1 * formData[_]),
      [_ = "is_agree"]: (1 * formData[_]),
      order_detais
    });
    // console.log('formData: ', formData);
    //
    let contractId = (contractEnt && contractEnt.id()) || formData[this._contractModel._entity.primaryKey];
    let apiCall = contractId
      ? this._contractModel.update(contractId, formData)
      : this._contractModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/contracts');
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
        if (!contractEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { contractEnt } = this.props;
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
      errors.data_leads_id = "Thông tin khách hàng là bắt buộc.";
    }
    // Thong tin nguoi giam ho
    if (is_agree) {
      if (!('' + values.full_name_guardian).trim()) {
        errors.full_name_guardian = "Tên người giám hộ là bắt buộc.";
      }
      if (!('' + values.relation_ship_member_id).trim()) {
        errors.relation_ship_member_id = "Mối quan hệ với hội viên là bắt buộc.";
      }
      if (!('' + values.guardian_phone_number).trim()) {
        errors.relation_ship_member_id = "Số điện thoại là bắt buộc.";
      }
      if (!('' + values.guardian_email).trim()) {
        errors.guardian_email = "Email là bắt buộc.";
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

  _calcPrices({ order_detais })
  {
    let { values, setValues } = this.formikProps;
    order_detais = (order_detais instanceof Array) ? order_detais : values.order_detais;

    // Sum total,..
    let sub_total = 0; // Cộng tổng tiền
    let total_vat = 0; // Tổng VAT
    let total_discount = 0; // Tổng tiền được khuyến mại
    let total_money = 0; // Tổng thanh toán
    // +++
    order_detais.forEach(_i => {
      sub_total += (1 * _i.price);
      total_vat += (1 * _i.vat_amount);
      total_discount += (1 * _i.total_discount);
      total_money += (1 * _i.total_amount);
    });
    let total_value = total_money;

    // Re-render
    setValues(Object.assign(values, {
      order_detais,
      sub_total,
      total_vat,
      total_discount,
      total_money,
      total_value
    }));
  }

  handlePickProducts = (itemsObj) => {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("Bạn vui lòng chọn sản phẩm!");
    }

    //
    let { values, handleChange } = this.formikProps;
    let { order_detais: value = [] } = values;

    // Get product info
    let list_product = [];
    items.forEach(product => {
      let {product_id, _price, /** hinh thuc xuat / price */ _promotions} = product;
      //
      _promotions.forEach(promotion => {
        let {promotion_id, _offer} = promotion;
        let {promotion_offer_apply_id} = _offer;
        list_product.push({
          product_id,
          output_type: _price.output_type_id,
          promotion_id,
          promotion_offer_apply_id
        });
      });
    });
    this._contractModel.productInfo(list_product)
      .then(data => {
        items.forEach(_i => {
          let {_price, _promotions, ...product} = _i;
          let {price, price_vat} = _price;
          //
          _promotions.forEach((_i2nd, idx) => {
            let {_offer, ...promotion} = _i2nd;
            let productInfo = data[idx];
            let vat_amount = (1 * price_vat) - (1 * price);
            let obj = {...product, ..._price, ...promotion, ..._offer, ...productInfo, ...{
              quantity: 1,
              vat_amount,
              total_amount: (1 * price_vat) - (1 * productInfo.total_discount)
            }};
            // console.log('obj: ', obj);
            value.push(obj);
          });
        });
    
        //
        this.setState(
          { willShowSelectProduct: false },
          this._calcPrices({ "order_detais": value })
        );
      })
      .catch(() => window._$g.dialogs.alert(`Chọn sản phẩm không thành công, bạn vui lòng thử lại!`))
    ;
  }

  handleDelProduct = (item, evt) => {
    let { values } = this.formikProps;
    let { order_detais: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) { return; }
    window._$g.dialogs.prompt(`Bạn muốn xóa sản phẩm?`, (isYes) => {
      if (isYes) {
        value.splice(foundIdx, 1);
        this._calcPrices({ "order_detais": value });
      }
    });
  }

  handlePickCDL = (itemsObj) => {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("Bạn vui lòng chọn khách hàng!");
    }
    let { handleChange } = this.formikProps;
    let customerDataLead = items[0];
    //
    this.setState({ customerDataLead, willShowSelectCDL: false }, () => {
      let {data_leads_id: value} = customerDataLead;
      handleChange({ target: { name: "data_leads_id", value }});
    });
  }

  render() {
    let {
      _id,
      alerts,
      willShowSelectProduct,
      willShowSelectCDL,
      contractTypeArr,
      companies,
      businessArr,
      relationshipArr,
      customerDataLead
    } = this.state;
    let { contractEnt, noEdit: propNoEdit } = this.props;
    let noEdit = propNoEdit /*|| (contractEnt && (null !== contractEnt.is_reviewed))*/; // If contract is reviewed --> disable edit.
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    return (
      <div id="contract-div" key={`view-${_id}`} className="animated fadeIn">
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
                  // is_serivce: 1
                }}
                controlIsActiveProps={{ disabled: true }}
                filterProps={{
                  controlIsActiveProps: { isDisabled: true }
                }}
                onPick={this.handlePickProducts}
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
                <b>{contractEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} hợp đồng {contractEnt ? `"${contractEnt.contract_name}"` : ''}</b>
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
                      <Row className="page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin hợp đồng</b>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4}>
                              Loại hợp đồng<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="contract_type_id"
                                render={({ field/*, form */}) => {
                                  let defaultValue = contractTypeArr.find(({ value }) => ('' + value) === ('' + field.value));
                                  let placeholder = (contractTypeArr[0] && contractTypeArr[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      // defaultValue={defaultValue}
                                      value={defaultValue}
                                      options={contractTypeArr}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="contract_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
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
                                    label="Gia hạn?"
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
                                Số hợp đồng hội viên
                              </Label>
                              <Col sm={8}>
                                  <Field
                                    name="contract_number"
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
                                  <ErrorMessage name="contract_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Tổng giá trị hợp đồng
                              </Label>
                              <Col sm={8}>
                                <InputGroup>
                                  <Field
                                    name="total_value"
                                    render={({ field /* _form */ }) => <NumberFormat
                                      name={field.name}
                                      onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                      value={values[field.name]}
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
                                Công ty<span className="font-weight-bold red-text">*</span>
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
                                Cơ sở phòng tập<span className="font-weight-bold red-text">*</span>
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
                          <FormGroup row>
                            <Label for="active_date" sm={4}>
                              Hiệu lực hợp đồng<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="active_date"
                                render={({
                                  date,
                                  form: { setFieldValue, values },
                                  field,
                                  ...props
                                }) => {
                                  return (
                                    <DatePicker
                                      id={field.name}
                                      date={values[field.name] ? moment(values[field.name]) : null}
                                      onDateChange={date => setFieldValue(field.name, date)}
                                      disabled={noEdit}
                                      maxToday
                                    />
                                  )
                                }}
                              />
                              <ErrorMessage name="active_date" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Tổng số ngày
                              </Label>
                              <Col sm={8}>
                                <InputGroup>
                                  <Field
                                    name="total_day"
                                    render={({ field /* _form */ }) => <NumberFormat
                                      name={field.name}
                                      onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                      value={values[field.name]}
                                      disabled={noEdit}
                                      readOnly={true}
                                    />}
                                  />
                                  <InputGroupAddon addonType="append">
                                    <InputGroupText>ngày</InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <ErrorMessage name="total_day" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin khách hàng</b>
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
                                    Bạn không có quyền chọn khách hàng cho tính năng này. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                                  </Alert>
                                ) : (
                                  noEdit ? null : (<Button disabled={noEdit} className="" onClick={() => {
                                    this.checkBusinessData() && this.setState({ willShowSelectCDL: true });
                                  }}>
                                    <i className="fa fa-plus-circle" /> Chọn khách hàng
                                  </Button>)
                                )}
                              </Col>
                            </FormGroup>)}}
                          </CheckAccess>
                          <ErrorMessage name="data_leads_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_ma_khach_hang">Mã khách hàng</Label>
                            <Col sm={8}>
                              <Input
                                name="_ma_khach_hang"
                                type="text"
                                value={(customerDataLead || values)['data_leads_id'] || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_ten_khach_hang">Tên khách hàng</Label>
                            <Col sm={8}>
                              <Input
                                name="_ten_khach_hang"
                                type="text"
                                value={(customerDataLead || values)['full_name'] || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_ngay_sinh">Ngày sinh</Label>
                            <Col sm={8}>
                              <Input
                                name="_ngay_sinh"
                                type="text"
                                value={(customerDataLead || values)['birthday'] || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_gioi_tinh">Giới tính</Label>
                            <Col sm={8}>
                              {(() => {
                                let gender= (customerDataLead || values)['gender'] || "";
                                return <Input
                                  name="_gioi_tinh"
                                  type="text"
                                  value={(''+ gender) === '1' ? 'Nam' : ((''+ gender) === '0' ? 'Nữ' : '')}
                                  placeholder=""
                                  disabled={noEdit}
                                  readOnly={true}
                                />
                              })()}
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
                                value={(customerDataLead || values)['email'] || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_so_dien_thoai">Số điện thoại</Label>
                            <Col sm={8}>
                              <Input
                                name="_so_dien_thoai"
                                type="text"
                                value={(customerDataLead || values)['phone_number'] || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="_dia_chi" sm={2}>Địa chỉ</Label>
                            <Col sm={10}>
                              <Input
                                name="_dia_chi"
                                type="text"
                                value={(customerDataLead || values)['address_full'] || ""}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_thuoc_chien_dich">Thuộc chiến dịch</Label>
                            <Col sm={8}>
                              <Input
                                name="_thuoc_chien_dich"
                                type="text"
                                value={(values.campaign_name || [(customerDataLead && customerDataLead.campaign_name) || ""].join())}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label sm={4} for="_phan_khuc_khach_hang">Phân khúc khách hàng</Label>
                            <Col sm={8}>
                              <Input
                                name="_phan_khuc_khach_hang"
                                type="text"
                                value={(values.segment_name || [(customerDataLead && customerDataLead.segment_name) || ""].join())}
                                placeholder=""
                                disabled={noEdit}
                                readOnly={true}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="note_healthy" sm={2}>Tình trạng sức khỏe</Label>
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
                            <Label sm={2}>Mục tiêu sử dụng dịch vụ</Label>
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
                                    label="Cần người giám hộ?"
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
                              Tên người giám hộ<span className="font-weight-bold red-text">*</span>
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
                              Mối quan hệ với hội viên<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="relation_ship_member_id"
                                render={({ field/*, form */}) => {
                                  let defaultValue = relationshipArr.find(({ value }) => ('' + value) === ('' + field.value));
                                  let placeholder = (relationshipArr[0] && contractTypeArr[0].label) || '';
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
                              Số điện thoại<span className="font-weight-bold red-text">*</span>
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
                              CMND/Hộ chiếu
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
                            <Label sm={4} for="full_address_guardian">Địa chỉ</Label>
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
                          <b className="title_page_h1 text-primary">Thông tin sản phẩm</b>
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
                                    Bạn không có quyền chọn sản phẩm cho tính năng này. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                                  </Alert>
                                ) : (
                                  noEdit ? null : (<Button disabled={noEdit} className="" onClick={() => {
                                    this.checkBusinessData() && this.setState({ willShowSelectProduct: true });
                                  }}>
                                    <i className="fa fa-plus-circle" /> Chọn sản phẩm
                                  </Button>)
                                )}
                              </Col>
                              <Col sm={12}>
                                <ErrorMessage name="order_detais" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                <Table size="sm" bordered striped hover responsive>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '1%' }}>#</th>
                                      <th>{window._$g._('Mã sản phẩm')}</th>
                                      <th>{window._$g._('Tên sản phẩm')}</th>
                                      <th>{window._$g._('Hình thức xuất')}</th>
                                      <th>{window._$g._('Chương trình khuyến mại')}</th>
                                      <th>{window._$g._('Giảm giá khuyến mại')}</th>
                                      <th>{window._$g._('Đơn giá')}</th>
                                      <th>{window._$g._('Tổng VAT')}</th>
                                      <th>{window._$g._('Thành tiền')}</th>
                                      <th style={{ width: '1%' }}>{window._$g._('Xóa')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>{(() => {
                                    return values.order_detais.map((item, idx) => {
                                      return item ? (
                                        <tr key={`order_detais-${idx}`}>
                                          <th scope="row" className="text-center">{idx + 1}</th>
                                          <td className="">{item.product_code}</td>
                                          <td className="">{item.product_name}</td>
                                          <td className="">{item.output_type_name}</td>
                                          <td className="">{item.promotion_name}</td>
                                          <td className="">{item.promotion_offer_name}</td>
                                          <td className="text-right">{numberFormat(1 * item.price)}</td>
                                          <td className="text-right">{numberFormat(1 * item.vat_amount)}</td>
                                          <td className="text-right">{numberFormat((1 * item.total_amount))}</td>
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
                            <Label sm={9}>Cộng tổng tiền:</Label>
                            <Col sm={3}>{numberFormat(values.sub_total)}</Col>
                          </Row>
                          <Row>
                            <Label sm={9}>Tổng VAT:</Label>
                            <Col sm={3}>{numberFormat(values.total_vat)}</Col>
                          </Row>
                          <Row>
                            <Label sm={9}>Tổng tiền được khuyến mãi:</Label>
                            <Col sm={3}>{numberFormat(values.total_discount)}</Col>
                          </Row>
                          <Row>
                            <Label sm={9}>Tổng thanh toán:</Label>
                            <Col sm={3}>{numberFormat(values.total_money)}</Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col sm={12} className="text-right">
                          {propNoEdit ? (
                            <CheckAccess permission="CT_CONTRACT_EDIT">
                              <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/contracts/edit/${contractEnt.id()}`)}>
                                <i className="fa fa-edit mr-1" />Chỉnh sửa
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
                                <i className="fa fa-save mr-2" />Lưu
                              </Button>,
                              <Button
                                key="buttonSaveClose"
                                type="submit"
                                color="success"
                                disabled={isSubmitting || noEdit}
                                onClick={() => this.handleSubmit('save_n_close')}
                                className="mr-2 btn-block-sm mt-md-0 mt-sm-2"
                              >
                                <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                              </Button>
                            ])
                          }
                            <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/contracts')} className="btn-block-sm mt-md-0 mt-sm-2">
                              <i className="fa fa-close" />
                              <span className="ml-1">Đóng</span>
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

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
  InputGroupText,
  InputGroup,
  InputGroupAddon,
  CustomInput,
  Table
} from "reactstrap";
import Select from "react-select";

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import NumberFormat from '../Common/NumberFormat';
// +++
import Products from '../Products/Products';

// Util(s)
import { mapDataOptions4Select, formatFormData } from '../../utils/html';
// import * as utils from '../../utils';

// Model(s)
import PromotionOfferModel from "../../models/PromotionOfferModel";
import ProductModel from "../../models/ProductModel";
import BusinessModel from "../../models/BusinessModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class PromotionOfferAdd
 */
export default class PromotionOfferAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._promotionOfferModel = new PromotionOfferModel();
    this._productModel = new ProductModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.handleShowProducts = this.handleShowProducts.bind(this);
    this.handlePickProducts = this.handlePickProducts.bind(this);
    this.handleRemoveProduct = this.handleRemoveProduct.bind(this);
    this.handleSwitchDiscount = this.handleSwitchDiscount.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    // +++
    // let { promotionOfferEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      willShowSelectProduct: false,
      /** @var {Array} */
      businessArr: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      // list_offer_gifts: [],
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
    let { promotionOfferEnt } = this.props;
    let values = Object.assign(
      {}, this._promotionOfferModel.fillable(),
      promotionOfferEnt || {}
    );
    if (promotionOfferEnt) {
      /* let { list_task_work_follow = [], ...dataEnt } = promotionOfferEnt;
      Object.assign(values, dataEnt, {
        list_offer_gifts: list_task_work_follow.map(({
          task_work_follow_id: id,
          task_work_follow_name: name,
          ...item
        }) => ({ id, name, ...item }))
      }); */
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
    let { promotionOfferEnt } = this.props;
    let bundle = {};
    let all = [
      this._businessModel.getOptions({ is_active: 1 })
        .then(data => (bundle['businessArr'] = mapDataOptions4Select(data))),
    ];
    if (!promotionOfferEnt) {
      /* all.push(
        this._productModel.getOptions({ is_active: 1 })
          .then(data => (bundle['list_offer_gifts'] = mapDataOptions4Select(data)))
      ); */
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
    promotion_offer_name: Yup.string().trim()
      // .min(2, 'Too Short!')
      // .max(70, 'Too Long!')
      .required("Tên ưu đãi khuyến mại là bắt buộc."),
    business_id: Yup.string().trim()
      .required("Cơ sở phòng tập là bắt buộc."),
    order_index: Yup.string().trim()
      .required("Thứ tự hiển thị là bắt buộc."),
    is_active: Yup.string().trim()
      .required("Kích hoạt là bắt buộc."),
    is_system: Yup.string().trim()
      .required("Hệ thống là bắt buộc."),
    // list_offer_gifts: Yup.array()
    // .required("Sản phẩm là bắt buộc."),
  });

  handleShowProducts() {
    let { willShowSelectProduct } = this.state;
    // toggle
    willShowSelectProduct = !willShowSelectProduct;
    // +++
    this.setState({ willShowSelectProduct });
  }

  handlePickProducts(itemsObj) {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("Bạn vui lòng chọn sản phẩm!");
    }
    let { values, handleChange } = this.formikProps;
    let { list_offer_gifts: value } = values;
    (value || []).forEach(item => {
      if (itemsObj[item.product_id]) {
        delete itemsObj[item.product_id];
      }
    });
    items = Object.values(itemsObj);
    value = (value || []).concat(items);
    this.setState({ willShowSelectProduct: false }, () => {
      handleChange({ target: { name: "list_offer_gifts", value }});
    });
  }

  handleRemoveProduct(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { list_offer_gifts: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) { return; }
    window._$g.dialogs.prompt(`Bạn muốn xóa sản phẩm?`, (isYes) => {
      if (isYes) {
        value.splice(foundIdx, 1);
        handleChange({ target: { name: "list_offer_gifts", value }});
      }
    });
  }

  handleSwitchDiscount({ name, value }) {
    let { values, setValues } = this.formikProps;
    Object.assign(values, value ? {
      is_discount_by_set_price: 0,
      is_fix_price: 0,
      is_fixed_gift: 0,
      is_percent_discount: 0,
    } : {}, {
      [name]: value
    });
    setValues(values);
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
    let { promotionOfferEnt, handleFormikSubmitSucceed } = this.props;
    // let {} = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    /* let { list_offer_gifts } = values;
    let task_work_follow_list = list_offer_gifts.map((item, order_index) => ({
      task_work_follow_id: '' + (item.id || item.task_work_follow_id),
      order_index
    })) */
    // +++
    let formData = Object.assign({}, formatFormData(values), {
      // is_active: 1 * values.is_active,
    });
    // console.log('formData: ', formData);
    //
    let promotionOfferId = (promotionOfferEnt && promotionOfferEnt.id()) || formData[this._promotionOfferModel];
    let apiCall = promotionOfferId
      ? this._promotionOfferModel.update(promotionOfferId, formData)
      : this._promotionOfferModel.create(formData)
    ;
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          // let cbData = Object.assign({ promotion_offer_id: data }, formData);
          let cbData = await this._promotionOfferModel.read(data, {});
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/promotion-offers');
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
        if (!promotionOfferEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { promotionOfferEnt } = this.props;
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
    // Bat buoc "uu dai khuyen mai"
    if (!values.is_percent_discount
      && !values.is_discount_by_set_price
      && !values.is_fix_price
      && !values.is_fixed_gift
    ) {
      errors.discountvalue = "Ưu đãi khuyến mại là bắt buộc!";
    }
    // Bat buoc nhap "gia tri uu dai"
    if ((values.is_percent_discount
        || values.is_discount_by_set_price
        || values.is_fix_price
      ) && ((1 * values.discountvalue) <= 0)
    ) {
      errors.discountvalue = "Giá trị ưu đãi khuyến mại là bắt buộc!";
    }
    return errors;
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      willShowSelectProduct,
      businessArr,
    } = this.state;
    let { noEdit, promotionOfferEnt } = this.props;
    // Check edit for case "is_system"
    if (promotionOfferEnt && !!promotionOfferEnt.is_system) {
      noEdit = !userAuth._isAdministrator();
    }

    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} id={`promotion-offer`} className="animated fadeIn">
        {/** start#Products */}{willShowSelectProduct
          ? (
            <div className="overlay">
              <div className="overlay-box">
                <div className="overlay-toolbars">
                  <Button
                    color="danger" size="sm"
                    onClick={() => this.setState({ willShowSelectProduct: false })}
                  >
                    <i className="fa fa-window-close" />
                  </Button>
                </div>
                <Products
                  controlIsActiveProps={{
                    disabled: true
                  }}
                  filterProps={{
                    controlIsActiveProps: {
                      isDisabled: true
                    }
                  }}
                  handlePick={this.handlePickProducts}
                />
              </div>
            </div>
          ) : null
        }{/** end#Products */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{promotionOfferEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} ưu đãi khuyến mại {promotionOfferEnt ? promotionOfferEnt.promotion_offer_name : ''}</b>
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
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Thông tin ưu đãi khuyến mại</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="promotion_offer_name" sm={2}>
                              Tên ưu đãi khuyến mại<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="promotion_offer_name"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  placeholder=""
                                  disabled={noEdit}
                                  maxLength={350}
                                />}
                              />
                              <ErrorMessage name="promotion_offer_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="business_id" sm={4}>
                                  Cơ sở phòng tập<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="business_id"
                                    render={({ field/*, form*/ }) => {
                                      let value = businessArr.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (businessArr[0] && businessArr[0].label) || '';
                                      let props = {
                                        name: field.name,
                                        onChange: ({ value }) => field.onChange({
                                          target: { name: field.name, value }
                                        }),
                                        isSearchable: true,
                                        placeholder: placeholder,
                                        value: value,
                                        options: businessArr,
                                        isDisabled: noEdit
                                      };
                                      if (this.props.alterBusinessSelectProps) {
                                        this.props.alterBusinessSelectProps(props);
                                      }
                                      return (<Select {...props} />);
                                    }}
                                  />
                                  <ErrorMessage name="business_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="order_index" sm={4}>
                                  Thứ tự hiển thị<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="order_index"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="number"
                                      className="text-right"
                                      min={0}
                                      placeholder="0"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="order_index" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="description" sm={2}>
                              Nội dung điều kiện
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="condition_content"
                                render={({ field }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  disabled={noEdit}
                                  maxLength={350}
                                />}
                              />
                              <ErrorMessage name="condition_content" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="description" sm={2}>
                              Mô tả
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="description"
                                render={({ field }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  disabled={noEdit}
                                  maxLength={1800}
                                />}
                              />
                              <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Ưu đãi khuyến mại</b><span className="font-weight-bold red-text">*</span>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Col xs={6} sm={3}>
                              <Field
                                name="is_percent_discount"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  onChange={({ target }) => this.handleSwitchDiscount({
                                    name: field.name,
                                    value: target.checked
                                  })}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Khuyến mại theo %"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col xs={6} sm={3}>
                              <Field
                                name="is_discount_by_set_price"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  onChange={({ target }) => this.handleSwitchDiscount({
                                    name: field.name,
                                    value: target.checked
                                  })}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Giảm giá trực tiếp"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col xs={6} sm={3}>
                              <Field
                                name="is_fix_price"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  onChange={({ target }) => this.handleSwitchDiscount({
                                    name: field.name,
                                    value: target.checked
                                  })}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Giảm giá cứng"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col xs={6} sm={3}>
                              <Field
                                name="is_fixed_gift"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  onChange={({ target }) => this.handleSwitchDiscount({
                                    name: field.name,
                                    value: target.checked
                                  })}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Quà tặng"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row hidden={!(
                            values.is_percent_discount
                              || values.is_discount_by_set_price
                              || values.is_fix_price
                          )}>
                            <Col sm={6} className="ml-auto mr-auto">
                              <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>Giá trị</InputGroupText>
                                </InputGroupAddon>
                                <Field
                                  name="discountvalue"
                                  render={({ field /* _form */ }) => <NumberFormat
                                    name={field.name}
                                    onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                    value={1 * values[field.name]}
                                    max={values.is_percent_discount ? 99 : undefined}
                                    min={0}
                                    decimalScale={values.is_percent_discount ? 2 : 0}
                                    disabled={noEdit}
                                  />}
                                />
                                <InputGroupAddon addonType="append">
                                  <InputGroupText>{values.is_percent_discount ? '%' : 'VNĐ'}</InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                            </Col>
                          </FormGroup>
                          <ErrorMessage name="discountvalue" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                        </Col>
                        <Col sm={12} hidden={!values.is_fixed_gift}>
                          <FormGroup row id="list_offer_gifts">
                            <CheckAccess permission="MD_PRODUCT_VIEW">
                              <Col sm={12} className="text-right mb-2">
                                {noEdit ? null : <Button onClick={this.handleShowProducts}>Chọn sản phẩm</Button>}
                              </Col>
                            </CheckAccess>
                            <Table size="sm" bordered striped hover responsive>
                              <thead>
                                <tr>
                                  <th style={{ width: '1%' }}>#</th>
                                  <th>Tên sản phẩm</th>
                                  <th>Model</th>
                                  <th>Nhà sản suất</th>
                                  <th style={{ width: '145px' }}>Sản phẩm dịch vụ</th>
                                  <th style={{ width: '1%' }}>Xóa</th>
                                </tr>
                              </thead>
                              <tbody>
                                {values.list_offer_gifts.map((item, idx) => {
                                  return item ? (
                                    <tr key={`list_offer_gift-${idx}`}>
                                      <th scope="row" className="text-center">{idx + 1}</th>
                                      <td className="">{item.product_name}</td>
                                      <td className="">{item.model_name}</td>
                                      <td className="">{item.manufacturer_name}</td>
                                      <td className="text-center">
                                        <CustomInput
                                          id={`list_offer_gift_is_service_product_${idx}`}
                                          checked={!!item.is_service}
                                          type="switch"
                                          label=""
                                          readOnly
                                          disabled
                                        />
                                      </td>
                                      <td className="text-center">
                                        {noEdit ? null : <Button color="danger" size={"sm"} onClick={(event) => this.handleRemoveProduct(item, event)}>
                                          <i className="fa fa-minus-circle" />
                                        </Button>}
                                      </td>
                                    </tr>
                                  ) : null;
                                })}
                                {!values.list_offer_gifts.length ? (
                                  <tr><td colSpan={100}>&nbsp;</td></tr>
                                ) : null}
                              </tbody>
                            </Table>
                            <Col sm={12}>
                              <ErrorMessage name="list_offer_gifts" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="is_active" sm={2}></Label>
                            <Col sm={5}>
                              <Field
                                name="is_active"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Kích hoạt?"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                            <Col sm={5}>
                              <Field
                                name="is_system"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Hệ thống?"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="is_system" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="is_system" sm={2}></Label>
                            
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} className="mt-2">
                          <Row>
                            <Col sm={12} className="text-right">
                              {noEdit ? (
                                promotionOfferEnt ? <CheckAccess permission="SM_PROMOTIONOFFER_EDIT">
                                  <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/promotion-offers/edit/${promotionOfferEnt.id()}`)}
                                    disabled={(!userAuth._isAdministrator() && !!promotionOfferEnt.is_system)}
                                  >
                                    <i className="fa fa-edit mr-1" />Chỉnh sửa
                                  </Button>
                                </CheckAccess> : null
                              ) : [
                                (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                  <i className="fa fa-save mr-2" />Lưu
                                </Button> : null,
                                (false !== this.props.handleActionSaveAndClose) ? <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                </Button> : null
                                ]
                              }
                              <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr('/promotion-offers'))} className="btn-block-sm mt-md-0 mt-sm-2">
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

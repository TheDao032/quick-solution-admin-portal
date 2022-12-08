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
  Media,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  CustomInput,
  Table
} from "reactstrap";
import Select,  { components as selectComps } from "react-select";
import moment from 'moment';

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import NumberFormat from '../Common/NumberFormat';
import DatePicker from '../Common/DatePicker';
// +++
import Products from '../Products/Products';
import PromotionOffers from '../PromotionOffers/PromotionOffers';
import PromotionOfferAdd from '../PromotionOffers/PromotionOfferAdd';
import CustomerType from '../CustomerType/CustomerType';
import CustomerTypeAdd from '../CustomerType/CustomerTypeAdd';

// Util(s)
import {
  mapDataOptions4Select,
  formatFormData,
  readFileAsBase64,
  MOMENT_FORMAT_DATE
} from '../../utils/html';

// Model(s)
import UserModel from "../../models/UserModel";
import DepartmentModel from "../../models/DepartmentModel";
import PromotionModel from "../../models/PromotionModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";

/** @var {UserEntity} */
const userAuth = window._$g.userAuth;

/**
 * @class PromotionAdd
 */
export default class PromotionAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._userModel = new UserModel();
    this._departmentModel = new DepartmentModel();
    this._promotionModel = new PromotionModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    // +++
    this.handleImageChange = this.handleImageChange.bind(this);
    // +++
    this.handleToggleIsApply = this.handleToggleIsApply.bind(this);
    // +++
    this.triggerAlterBusiness = this.triggerAlterBusiness.bind(this);
    this._alterCompanySelectProps = this._alterCompanySelectProps.bind(this);
    this._alterBusinessSelectProps = this._alterBusinessSelectProps.bind(this);
    // +++
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleAddBusiness = this.handleAddBusiness.bind(this);
    this.handleDelBusiness = this.handleDelBusiness.bind(this);
    this.checkBusinessData = this.checkBusinessData.bind(this);
    // +++
    this.handlePickProducts = this.handlePickProducts.bind(this);
    this.handleDelProduct = this.handleDelProduct.bind(this);
    // +++
    this.handlePickPromotionOffers = this.handlePickPromotionOffers.bind(this);
    this.handleDelPromotionOffer = this.handleDelPromotionOffer.bind(this);
    this.handleAddedPromotionOffer = this.handleAddedPromotionOffer.bind(this);
    // +++
    this.handlePickCustomerType = this.handlePickCustomerType.bind(this);
    this.handleDelCustomerType = this.handleDelCustomerType.bind(this);
    this.handleAddedCustomerType = this.handleAddedCustomerType.bind(this);
    // +++
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    // +++
    let { promotionEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {String|null} */
      bannerBase64: (promotionEnt && promotionEnt.promotionBanner()) || null,
      /** @var {String|null} */
      iconUrlBase64: (promotionEnt && promotionEnt.promotionIconUrl()) || null,
      /** @var {Boolean} */
      ready: false,
      /** @var {Object|null} */
      departmentEnt: null,
      /** @var {Array} */
      companies: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      businessArr: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      userOpts: [
        { label: "-- Chọn --", value: "", user_name: "" },
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
    let { promotionEnt } = this.props;
    let { departmentEnt } = this.state;
    let values = Object.assign(
      this._promotionModel.fillable(),
      promotionEnt || {},
      {
        __company_id: (promotionEnt && promotionEnt.company_id)
          || (departmentEnt && departmentEnt.company_id) || "",
        __business_id: "",
        __is_apply_all: false
      }
    );
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // values[key] += '';
      // ...
    });
    // Return;
    return values;
  }

  // +++ 
  getBundleBusinessArr(company_id) {
    return this._businessModel.getOptionsFull({ company_id: company_id || -1 })
      .then(data => (data = mapDataOptions4Select(data)))
    ;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { promotionEnt } = this.props;
    let bundle = {};
    let all = [
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
      this._userModel.getOptionsFull({
        function_alias: "SM_PROMOTION_REVIEW"
      })
        .then(data => (bundle["userOpts"] = mapDataOptions4Select(data))),
    ];
    let __company_id = (promotionEnt && promotionEnt.company_id);
    if (__company_id) {
      all.push(
        this.getBundleBusinessArr(__company_id)
          .then(data => (bundle["businessArr"] = data))
      );
    } else if (userAuth.department_id) {
      all.push(
        this._departmentModel.read(userAuth.department_id)
          .then(data => (bundle['departmentEnt'] = data)
            && this.getBundleBusinessArr(data.company_id)
              .then(data2rd => (bundle["businessArr"] = data2rd))
          )
      );
    }
    if (promotionEnt) {
      // all.push();
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

  handleImageChange(type, event) {
    let { target } = event;
    if (target.files[0]) {
      readFileAsBase64(target, {
        // option: validate input
        validate: (file) => {
          // Check file's type
          if ('type' in file) {
            if (file.type.indexOf('image/') !== 0) {
              return 'Chỉ được phép sử dụng tập tin ảnh.';
            }
          }
          // Check file's size in bytes
          if ('size' in file) {
            let maxSize = 4; /*4mb*/
            if ((file.size / 1024 / 1024) > maxSize) {
              return `Dung lượng tập tin tối đa là: ${maxSize}mb.`;
            }
          }
        }
      })
        .then(imgBase64 => {
          if ('banner' === type) {
            this.setState({ bannerBase64: imgBase64 });
          }
          if ('icon' === type) {
            this.setState({ iconUrlBase64: imgBase64 });
          }
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
      ;
    }
  }

  formikValidationSchema = (() => {
    let msg1 = "Dữ liệu không hợp lệ.";
    let msg2 = "Giá trị phải >= 0.";
    return Yup.object().shape({
      promotion_name: Yup.string().trim()
        .required("Tên chương trình khuyến mại là bắt buộc."),
      list_company: Yup.array()
        .required("Cơ sở áp dụng là bắt buộc."),
      begin_date: Yup.string().trim()
        .required("Ngày áp dụng từ là bắt buộc."),
      end_date: Yup.string().trim()
        .required("Ngày áp dụng đến là bắt buộc."),
      start_hours: Yup.string().nullable()
        .matches(/\d{2}:\d{2}/, msg1),
      end_hours: Yup.string().nullable()
        .matches(/\d{2}:\d{2}/, msg1),
      from_price: Yup.number().nullable()
        .min(0, msg2),
      to_price: Yup.number().nullable()
        .min(0, msg2),
      min_promotion_total_money: Yup.number().nullable()
        .min(0, msg2),
      max_promotion_total_money: Yup.number().nullable()
        .min(0, msg2),
      min_promotion_total_quantity: Yup.number().nullable()
        .min(0, msg2),
      max_promotion_total_quantity: Yup.number().nullable()
        .min(0, msg2),
      list_apply_product: Yup.array()
        .required("Sản phẩm được khuyến mại là bắt buộc."),
      list_offer_apply: Yup.array()
        .required("Ưu đãi được áp dụng là bắt buộc."),
    });
  })();

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    Object.assign(values, {
      // +++ address
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
    let { promotionEnt } = this.props;
    let { bannerBase64, iconUrlBase64 } = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let formData = Object.assign({}, formatFormData(values), {
      url_banner: bannerBase64,
      url_image_promotion: iconUrlBase64
    });
    // console.log('formData: ', formData);
    //
    let promotionId = (promotionEnt && promotionEnt.id()) || formData[this._promotionModel];
    let apiCall = promotionId
      ? this._promotionModel.update(promotionId, formData)
      : this._promotionModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/promotions');
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
        if (!promotionEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { promotionEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
      bannerBase64: null,
      iconUrlBase64: null,
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
    // Ap dung theo gio
    if (values.is_apply_hours && values.start_hours && values.end_hours) {
      let startHours = values.start_hours.split(':');
      let startHoursH = (1 * startHours[0]), startHoursM = (1 * startHours[1]);
      let endHours = values.end_hours.split(':');
      let endHoursH = (1 * endHours[0]), endHoursM = (1 * endHours[1]);
      //
      if ((startHoursH < 0 || startHoursH > 23 || endHoursH < 0 || endHoursH > 23)
        || (startHoursM < 0 || startHoursM > 59 || endHoursH < 0 || endHoursM > 59)
      ) {
        errors.is_apply_hours = "Thời gian áp dụng không hợp lệ.";
      }
      //
      if ((startHoursH * 100 + startHoursM) >= (endHoursH * 100 + endHoursM)) {
        errors.is_apply_hours = "Thời gian áp dụng 'từ' phải < 'đến'.";
      }
    }
    // Ngay ap dung trong tuan
    if (!values.is_apply_mon
      && !values.is_apply_tue
      && !values.is_apply_we
      && !values.is_apply_th
      && !values.is_apply_fr
      && !values.is_apply_sa
      && !values.is_apply_sun
    ) {
      errors.__is_apply_all = "Ngày áp dụng trong tuần là bắt buộc.";
    }
    // Validate: dieu kien khuyen mai
    if (!values.is_promotion_by_price
      && !values.is_promotion_by_total_money
      && !values.is_promorion_by_total_quantity
    ) {
      errors.is_promorion_by_total_quantity = "Bắt buộc phải chọn ít nhất 1 điều kiện khuyến mại.";
    }
    // Check: dieu kien khuyen mai theo muc gia
    if (values.is_promotion_by_price
      && ((1 * values.from_price) >= (1 *values.to_price))
    ) {
      errors.is_promotion_by_price = "Giá trị khuyến mại theo mức giá không hợp lệ";
    }
    // Check: dieu kien khuyen mai tren tong tien
    if (values.is_promotion_by_total_money
      && ((1 * values.min_promotion_total_money) >= (1 *values.max_promotion_total_money))
    ) {
      errors.is_promotion_by_total_money = "Giá trị khuyến mại trên tổng tiền không hợp lệ.";
    }
    // Check: dieu kien khuyen mai theo so luong mua
    if (values.is_promorion_by_total_quantity
      && ((1 * values.min_promotion_total_quantity) >= (1 *values.max_promotion_total_quantity))
    ) {
      errors.is_promorion_by_total_quantity = "Giá trị khuyến mại theo số lượng mua không hợp lệ.";
    }
    // Check "gioi han so lan khuyen mai"
    if (values.is_limit_promotion_times
      && ((1 * values.max_promotion_times) <= 0)
    ) {
      errors.max_promotion_times = "Giá trị giới hạn số lần khuyến mại không hợp lệ.";
    }
    // Check "KM theo loai khach hang"
    if (values.is_promotion_customer_type && !values.list_customer_type.length) {
      errors.list_customer_type = "Đối tượng khách hàng là bắt buộc.";
    }

    return errors;
  }

  handleChangeCompany({ value: __company_id }) {
    let { values, setValues } = this.formikProps;
    if (('' + values.__company_id) !== ('' + __company_id)) {
      this.getBundleBusinessArr(__company_id)
        .then(data => {
          let { businessArr } = this.state;
          businessArr = [businessArr[0]].concat(data);
          this.setState({ businessArr });
          setValues(Object.assign(values, {
            __company_id, __business_id: "",
            list_company: []
          }));
          setTimeout(this.triggerAlterBusiness);
        })
      ;
    }
  }

  handleAddBusiness({ value: __business_id }) {
    let { businessArr } = this.state;
    let { values, setValues } = this.formikProps;
    let { list_company = [] } = values;
    let item = businessArr.find(item => ('' + __business_id) === ('' + item.value));
    let fIdx = list_company.findIndex(item => ('' + __business_id) === ('' + item.value));
    if (item && (fIdx < 0)) {
      let { list_company = [] } = values;
      list_company.push(item);
      setValues(Object.assign(values, { list_company }));
    }
  }

  handleDelBusiness(_item) {
    let { values, setValues } = this.formikProps;
    let { list_company = [] } = values;
    let fIdx = list_company.findIndex(item => item === _item);
    if (fIdx >= 0) {
      window._$g.dialogs.prompt(`Bạn muốn xóa cơ sở?`, (isYes) => {
        if (isYes) {
          list_company.splice(fIdx, 1);
          setValues(Object.assign(values, { list_company }));
          setTimeout(this.triggerAlterBusiness);
        }
      });
    }
  }

  /**
   * @return {Boolean}
   */
  checkBusinessData() {
    let { values: { list_company = [] } } = this.formikProps;
    let result = (list_company.length > 0);
    if (!result) {
      window._$g.dialogs.alert(window._$g._(`Bạn vui lòng chọn 'Cơ sở áp dụng'.`));
    }
    return result;
  }

  triggerAlterBusiness() {
    let { values, setValues } = this.formikProps;
    let { list_company = [] } = values;
    let businessIdStr = ',' + list_company.map(_i => _i.business_id).filter(_i => !!_i).join(',') + ',';
    // San pham khuyen mai
    if (values.list_apply_product.length) {
      let list_apply_product = [];
      if (list_company.length) {
        values.list_apply_product.forEach(item => {
          let { businesses = [] } = item;
          for (let i = 0; i < businesses.length; i++) {
            let bItem = businesses[i];
            if (businessIdStr.indexOf('' + bItem.business_id) >= 0) {
              list_apply_product.push(item);
              break;
            }
          }
        });
      }
      Object.assign(values, { list_apply_product });
    } //.end
    // Uu dai khuyen mai
    if (values.list_offer_apply.length) {
      let list_offer_apply = [];
      if (list_company.length) {
        values.list_offer_apply.forEach(item => {
          if (businessIdStr.indexOf('' + item.business_id) >= 0) {
            list_offer_apply.push(item);
          }
        });
      }
      Object.assign(values, { list_offer_apply });
    } //.end
    // Loai khach hang
    if (values.list_customer_type.length) {
      let list_customer_type = [];
      if (list_company.length) {
        values.list_customer_type.forEach(item => {
          if (businessIdStr.indexOf('' + item.business_id) >= 0) {
            list_customer_type.push(item);
          }
        });
      }
      Object.assign(values, { list_customer_type });
    } //.end
    // Set state
    setValues(values);
  }

  handleToggleIsApply({ target }) {
    let { values, setValues } = this.formikProps;
    let name = target.name;
    let value = target.checked;
    let props = [
      "is_apply_mon",
      "is_apply_tu",
      "is_apply_we",
      "is_apply_th",
      "is_apply_fr",
      "is_apply_sa",
      "is_apply_sun"
    ];
    let newVals = { [name]: value };
    let trueCnt = 0;
    // Case: check/uncheck all
    props.forEach(prop => {
      newVals[prop] = ('__is_apply_all' === name || (prop === name)) ? value : values[prop];
      newVals[prop] && ++trueCnt;
    });
    setValues(Object.assign(values, newVals, {
      __is_apply_all: (props.length === trueCnt)
    }));
  }

  handlePickProducts(itemsObj) {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("Bạn vui lòng chọn sản phẩm!");
    }
    let { values, handleChange } = this.formikProps;
    let { list_apply_product: value } = values;
    (value || []).forEach(item => {
      if (itemsObj[item.product_id]) {
        delete itemsObj[item.product_id];
      }
    });
    items = Object.values(itemsObj);
    value = (value || []).concat(items);
    this.setState({ willShowSelectProduct: false }, () => {
      handleChange({ target: { name: "list_apply_product", value }});
    });
  }

  handleDelProduct(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { list_apply_product: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) { return; }
    window._$g.dialogs.prompt(`Bạn muốn xóa sản phẩm?`, (isYes) => {
      if (isYes) {
        value.splice(foundIdx, 1);
        handleChange({ target: { name: "list_apply_product", value }});
      }
    });
  }

  handlePickPromotionOffers(itemsObj) {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("Bạn vui lòng chọn ưu đãi khuyến mại!");
    }
    let { values, handleChange } = this.formikProps;
    let { list_offer_apply: value } = values;
    (value || []).forEach(item => {
      if (itemsObj[item.promotion_offer_id]) {
        delete itemsObj[item.promotion_offer_id];
      }
    });
    items = Object.values(itemsObj);
    value = (value || []).concat(items);
    this.setState({
      willShowSelectPromotionOffer: false,
      willShowAddPromotionOffer: false
    }, () => {
      handleChange({ target: { name: "list_offer_apply", value }});
    });
  }

  handleDelPromotionOffer(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { list_offer_apply: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) { return; }
    window._$g.dialogs.prompt(`Bạn muốn xóa ưu đãi khuyến mại?`, (isYes) => {
      if (isYes) {
        value.splice(foundIdx, 1);
        handleChange({ target: { name: "list_offer_apply", value }});
      }
    });
  }

  handleAddedPromotionOffer(data) {
    setTimeout(() => {
      this.handlePickPromotionOffers({
        [data.promotion_offer_id]: data
      });
    });
    // Prevent default
    return false;
  }

  handlePickCustomerType(itemsObj) {
    let items = Object.values(itemsObj || {});
    if (!items.length) {
      return window._$g.dialogs.alert("Bạn vui lòng chọn loại khách hàng!");
    }
    let { values, handleChange } = this.formikProps;
    let { list_customer_type: value } = values;
    (value || []).forEach(item => {
      if (itemsObj[item.customer_type_id]) {
        delete itemsObj[item.customer_type_id];
      }
    });
    items = Object.values(itemsObj);
    value = (value || []).concat(items);
    this.setState({
      willShowSelectCustomerType: false,
      willShowAddCustomerType: false
    }, () => {
      handleChange({ target: { name: "list_customer_type", value }});
    });
  }

  handleDelCustomerType(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { list_customer_type: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) { return; }
    window._$g.dialogs.prompt(`Bạn muốn xóa loại khách hàng?`, (isYes) => {
      if (isYes) {
        value.splice(foundIdx, 1);
        handleChange({ target: { name: "list_customer_type", value }});
      }
    });
  }

  handleAddedCustomerType(data) {
    setTimeout(() => {
      this.handlePickCustomerType({
        [data.customer_type_id]: data
      });
    });
    // Prevent default
    return false;
  }

  _alterCompanySelectProps(props) {
    let { companies = [] } = this.state;
    let { values: { __company_id = "" } } = this.formikProps;
    let options = [];
    let value  = companies.find(item => '' + item.value === '' + __company_id);
    value && options.push(value);
    Object.assign(props, {
      options, value, isDisabled: true
    });
  }

  _alterBusinessSelectProps(props) {
    let { businessArr = [] } = this.state;
    let { values: { list_company = [] } } = this.formikProps;
    let options = [];
    businessArr.forEach((_item) => {
      let fIdx = list_company.findIndex(item => ('' === _item.value) || ('' + _item.value === '' + item.business_id));
      (fIdx >= 0) && options.push(_item); // IN the list
    });
    Object.assign(props, { options });
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      bannerBase64,
      iconUrlBase64,
      willShowSelectProduct,
      willShowAddPromotionOffer,
      willShowSelectPromotionOffer,
      willShowAddCustomerType,
      willShowSelectCustomerType,
      companies,
      businessArr,
      userOpts,
    } = this.state;
    let { promotionEnt, noEdit } = this.props;
    let isReviewedYes = null;
    let isReviewedNo = null;
    let isNotYetReviewed = null;
    if (promotionEnt) {
      let _promotionEntity = this._promotionModel._entity;
      isReviewedYes = _promotionEntity.isReviewedYesStatic(promotionEnt.is_review);
      isReviewedNo = _promotionEntity.isReviewedNoStatic(promotionEnt.is_review);
      isNotYetReviewed = _promotionEntity.isNotYetReviewedStatic(promotionEnt.is_review);
      noEdit = noEdit || !isNotYetReviewed;
    }
    // Check edit for case "is_system"
    if (promotionEnt && !!promotionEnt.is_system) {
      if (!noEdit && !userAuth._isAdministrator()) {
        noEdit = true;
      }
    }
    
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} id="promotion-div" className="animated fadeIn">
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
        {/** start#PromotionOffers */}{willShowAddPromotionOffer
          ? (
            <div className="overlay"><div className="overlay-box">
              <PromotionOfferAdd
                handleActionSave={false}
                alterBusinessSelectProps={this._alterBusinessSelectProps}
                handleActionClose={() => this.setState({ willShowAddPromotionOffer: false })}
                handleFormikSubmitSucceed={this.handleAddedPromotionOffer}
              />
            </div></div>
          ) : null
        }{/** end#PromotionOffers */}
        {/** start#PromotionOffers */}{willShowSelectPromotionOffer
          ? (
            <div className="overlay"><div className="overlay-box">
              <div className="overlay-toolbars">
                <Button
                  color="danger" size="sm"
                  onClick={() => this.setState({ willShowSelectPromotionOffer: false })}
                >
                  <i className="fa fa-window-close" />
                </Button>
              </div>
              <PromotionOffers
                stateQuery={{
                  company_id: (this.formikProps && this.formikProps.values.__company_id)
                }}
                controlIsActiveProps={{ disabled: true }}
                filterProps={{
                  controlIsActiveProps: { isDisabled: true },
                  // company_id: (this.formikProps && this.formikProps.values.__company_id),
                  alterCompanySelectProps: this._alterCompanySelectProps,
                  alterBusinessSelectProps: this._alterBusinessSelectProps
                }}
                handlePick={this.handlePickPromotionOffers}
              />
            </div></div>
          ) : null
        }{/** end#PromotionOffers */}
        {/** start#CustomerType */}{willShowAddCustomerType
          ? (
            <div className="overlay"><div className="overlay-box">
              <CustomerTypeAdd
                handleActionSave={false}
                alterCompanySelectProps={this._alterCompanySelectProps}
                alterBusinessSelectProps={this._alterBusinessSelectProps}
                handleActionClose={() => this.setState({ willShowAddCustomerType: false })}
                handleFormikSubmitSucceed={this.handleAddedCustomerType}
              />
            </div></div>
          ) : null
        }{/** end#CustomerType */}
        {/** start#CustomerType */}{willShowSelectCustomerType
          ? (
            <div className="overlay"><div className="overlay-box">
              <div className="overlay-toolbars">
                <Button
                  color="danger" size="sm"
                  onClick={() => this.setState({ willShowSelectCustomerType: false })}
                >
                  <i className="fa fa-window-close" />
                </Button>
              </div>
              <CustomerType
                stateQuery={{
                  company_id: (this.formikProps && this.formikProps.values.__company_id)
                }}
                controlIsActiveProps={{ disabled: true }}
                filterProps={{
                  controlIsActiveProps: { isDisabled: true },
                  // company_id: (this.formikProps && this.formikProps.values.__company_id),
                  alterCompanySelectProps: this._alterCompanySelectProps,
                  alterBusinessSelectProps: this._alterBusinessSelectProps
                }}
                handlePick={this.handlePickCustomerType}
              />
            </div></div>
          ) : null
        }{/** end#CustomerType */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{promotionEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} chương trình khuyến mại {promotionEnt ? promotionEnt.promotion_name : ''}</b>
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
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin chương trình khuyến mại</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={8} xs={12}>
                          <FormGroup row>
                            <Label for="promotion_name" sm={3} className="font-weight-bold">
                              Tên CT khuyến mại <span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="promotion_name"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id="promotion_name"
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="promotion_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="short_description" sm={3} className="font-weight-bold">
                              Mô tả ngắn
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="short_description"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="short_description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={2} xs={12}>
                          <div className="ps-relative text-center p-1 promotion-img-box promotion-img-banner">
                            {bannerBase64 ? <Media
                              object
                              src={bannerBase64}
                              alt="Banner"
                              className="user-imgage"
                            /> : <span><i className="fa fa-image " /> Chọn banner CT khuyến mại</span>}
                            {(bannerBase64 && !noEdit) ? <Button
                              color="danger"
                              size="sm"
                              onClick={() => this.setState({ bannerBase64: null })}
                            >
                              <i className="fa fa-minus-circle" />
                            </Button> : null}
                            <Input
                              key={`url_banner_${!!bannerBase64}`}
                              type="file"
                              id="url_banner"
                              className="input-overlay"
                              onChange={evt => this.handleImageChange('banner', evt)}
                              disabled={noEdit}
                            />
                          </div>
                        </Col>
                        <Col sm={2} xs={12}>
                          <div className="ps-relative text-center p-1 promotion-img-box promotion-img-icon">
                            {iconUrlBase64 ? <Media
                              object
                              src={iconUrlBase64}
                              alt="Icon"
                              className="user-imgage"
                            /> : <span><i className="fa fa-image " /> Chọn ảnh CT khuyến mại</span>}
                            {(iconUrlBase64 && !noEdit) ? <Button
                              color="danger"
                              size="sm"
                              onClick={() => this.setState({ iconUrlBase64: null })}
                            >
                              <i className="fa fa-minus-circle" />
                            </Button> : null}
                            <Input
                              key={`url_banner_${!!iconUrlBase64}`}
                              type="file"
                              id="url_image_promotion"
                              className="input-overlay"
                              onChange={evt => this.handleImageChange('icon', evt)}
                              disabled={noEdit}
                            />
                          </div>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="description" sm={2} className="font-weight-bold">
                              Mô tả
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="description"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Cơ sở áp dụng</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="__company_id" sm={2} className="font-weight-bold">
                              Công ty áp dụng<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="__company_id"
                                render={({ field/*, form */ }) => {
                                  let defaultValue = companies.find(({ value }) => ('' + value) === ('' + field.value));
                                  let placeholder = (companies[0] && companies[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={(changeValue) => this.handleChangeCompany(changeValue)}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      defaultValue={defaultValue}
                                      options={companies}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="__company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                          <FormGroup row hidden={!values.__company_id}>
                            <Label for="__business_id" sm={2} className="font-weight-bold">
                              Cơ sở
                            </Label>
                            <Col sm={10}>
                              <Field
                                key={`__business_id-${values.__company_id}`}
                                name="__business_id"
                                render={({ field/*, form */ }) => {
                                  let defaultValue = "" ; // businessArr.find(({ value }) => ('' + value) === ('' + field.value));
                                  let placeholder = (businessArr[0] && businessArr[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      components={{
                                        Option: (props) => {
                                          let { data } = props;
                                          return <selectComps.Option {...props}>
                                            {`${data.label}${data.value ? (' (ĐC: ' + (data.business_address_full || '') + ')') : ''}`}
                                          </selectComps.Option>;
                                        }
                                      }}
                                      onChange={changeValue => this.handleAddBusiness(changeValue)}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      value={defaultValue}
                                      options={businessArr}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="__business_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for="list_company" sm={2} className="font-weight-bold">
                              Cơ sở áp dụng<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={10}>
                              <Table size="sm" bordered striped hover responsive>
                                <thead>
                                  <tr>
                                    <th style={{ width: '1%' }}>#</th>
                                    <th>{window._$g._('Cơ sở')}</th>
                                    <th>{window._$g._('Địa chỉ')}</th>
                                    <th style={{ width: '1%' }}>{window._$g._('Xóa')}</th>
                                  </tr>
                                </thead>
                                <tbody>{(() => {
                                  return values.list_company.map((item, idx) => {
                                    return (
                                      <tr key={`list_company-${idx}`}>
                                        <th scope="row" className="text-center">{idx + 1}</th>
                                        <td>{item.business_name}</td>
                                        <td>{item.business_address_full}</td>
                                        <td className="text-center">
                                          {noEdit ? null : (<Field
                                            render={(/*{ field, form }*/) => {
                                              return (
                                                <Button color="danger" disabled={noEdit} size={"sm"} className="" onClick={() => this.handleDelBusiness(item)}>
                                                  <i className="fa fa-minus-circle" />
                                                </Button>
                                              );
                                            }}
                                          />)}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}</tbody>
                              </Table>
                              <ErrorMessage name="list_company" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Thời gian khuyến mại</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="" sm={2} className="font-weight-bold">
                              Ngày áp dụng từ<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={10}>
                              <div className="pull-left">
                                <Field
                                  name="__start_and_end_date"
                                  render={({ field, form }) => {
                                    return (
                                      <DatePicker
                                        isMultiple
                                        startDate={values.begin_date ? moment(values.begin_date, MOMENT_FORMAT_DATE) : undefined}
                                        startDateId="begin_date" // PropTypes.string.isRequired,
                                        endDate={values.end_date ? moment(values.end_date, MOMENT_FORMAT_DATE) : undefined}
                                        endDateId="end_date" // PropTypes.string.isRequired,
                                        onDatesChange={({ startDate, endDate }) => {
                                          let begin_date = (startDate && startDate.format(MOMENT_FORMAT_DATE)) || "";
                                          let end_date = (endDate && endDate.format(MOMENT_FORMAT_DATE)) || "";
                                          form.setValues(Object.assign(form.values, {
                                            begin_date, end_date, [field.name]: [startDate, endDate]
                                          }));
                                        }} // PropTypes.func.isRequired,
                                        focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                        onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                                        disabled={noEdit}
                                        displayFormat={MOMENT_FORMAT_DATE}
                                        minToday
                                      />
                                    );
                                  }}
                                />
                              </div>
                              <div className="pull-left w-100">
                                <ErrorMessage name="begin_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                                <ErrorMessage name="end_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                              </div>
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="is_apply_hours" sm={2} className="font-weight-bold">
                              <Field
                                name="is_apply_hours"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Áp dụng theo giờ"
                                  disabled={noEdit}
                                />}
                              />
                            </Label>
                            <Col sm={10}>
                              <Row>
                                <Col sm={4} xs={12}>
                                  <div>
                                    <InputGroup>
                                      <InputGroupAddon addonType="prepend">
                                        <InputGroupText>Từ</InputGroupText>
                                      </InputGroupAddon>
                                      <Field
                                        name="start_hours"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder="hh:mm (vd: 08:00)"
                                          disabled={noEdit || !values.is_apply_hours}
                                        />}
                                      />
                                      {/* <InputGroupAddon addonType="append">
                                        <InputGroupText><i className="fa fa-clock-o" /></InputGroupText>
                                      </InputGroupAddon> */}
                                    </InputGroup>
                                  </div>
                                  <ErrorMessage name="start_hours" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                                <Col sm={4} xs={12}>
                                  <div>
                                    <InputGroup>
                                      <InputGroupAddon addonType="prepend">
                                        <InputGroupText>Đến</InputGroupText>
                                      </InputGroupAddon>
                                      <Field
                                        name="end_hours"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder="hh:mm (vd: 08:00)"
                                          disabled={noEdit || !values.is_apply_hours}
                                        />}
                                      />
                                      {/* <InputGroupAddon addonType="append">
                                        <InputGroupText><i className="fa fa-clock-o" /></InputGroupText>
                                      </InputGroupAddon> */}
                                    </InputGroup>
                                  </div>
                                  <ErrorMessage name="end_hours" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </Row>
                              <ErrorMessage name="is_apply_hours" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="" sm={2} className="font-weight-bold">
                              Áp dụng trong tuần<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="__is_apply_all"
                                render={({ field, form: { setValues } }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Chọn tất cả: "
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_mon"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Thứ 2"
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_tu"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Thứ 3"
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_we"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Thứ 4"
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_th"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Thứ 5"
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_fr"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Thứ 6"
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_sa"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Thứ 7"
                                  disabled={noEdit}
                                />}
                              />
                              <Field
                                name="is_apply_sun"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left mr-2"
                                  onBlur={null}
                                  onChange={this.handleToggleIsApply}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Chủ nhật"
                                  disabled={noEdit}
                                />}
                              />
                              <div className="pull-left w-100">
                                <ErrorMessage name="__is_apply_all" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </div>
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Điều kiện khuyến mại<span className="font-weight-bold red-text">*</span></b>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="is_promotion_by_price" sm={2} className="font-weight-bold">
                              <Field
                                name="is_promotion_by_price"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Khuyến mại theo mức giá"
                                  disabled={noEdit}
                                />}
                              />
                            </Label>
                            <Col sm={10}>
                              <Row>
                                <Col sm={6} xs={12}>
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Từ</InputGroupText>
                                    </InputGroupAddon>
                                    <Field
                                      name="from_price"
                                      render={({ field /* _form */ }) => <NumberFormat
                                        name={field.name}
                                        onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                        value={1 * values[field.name]}
                                        min={0}
                                        readOnly={!values.is_promotion_by_price}
                                        disabled={noEdit}
                                      />}
                                    />
                                    <InputGroupAddon addonType="append">
                                      <InputGroupText>VNĐ</InputGroupText>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  <ErrorMessage name="from_price" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                                <Col sm={6} xs={12}>
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Đến</InputGroupText>
                                    </InputGroupAddon>
                                    <Field
                                      name="to_price"
                                      render={({ field /* _form */ }) => <NumberFormat
                                        name={field.name}
                                        onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                        value={1 * values[field.name]}
                                        min={0}
                                        readOnly={!values.is_promotion_by_price}
                                        disabled={noEdit}
                                      />}
                                    />
                                    <InputGroupAddon addonType="append">
                                      <InputGroupText>VNĐ</InputGroupText>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  <ErrorMessage name="to_price" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </Row>
                              <ErrorMessage name="is_promotion_by_price" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="is_promotion_by_total_money" sm={2} className="font-weight-bold">
                              <Field
                                name="is_promotion_by_total_money"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Khuyến mại trên tổng tiền"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                            </Label>
                            <Col sm={10}>
                              <Row>
                                <Col sm={6} xs={12}>
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Từ</InputGroupText>
                                    </InputGroupAddon>
                                    <Field
                                      name="min_promotion_total_money"
                                      render={({ field /* _form */ }) => <NumberFormat
                                        name={field.name}
                                        onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                        value={1 * values[field.name]}
                                        min={0}
                                        readOnly={!values.is_promotion_by_total_money}
                                        disabled={noEdit}
                                      />}
                                    />
                                    <InputGroupAddon addonType="append">
                                      <InputGroupText>VNĐ</InputGroupText>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  <ErrorMessage name="min_promotion_total_money" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                                <Col sm={6} xs={12}>
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Đến</InputGroupText>
                                    </InputGroupAddon>
                                    <Field
                                      name="max_promotion_total_money"
                                      render={({ field /* _form */ }) => <NumberFormat
                                        name={field.name}
                                        onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                        value={1 * values[field.name]}
                                        min={0}
                                        readOnly={!values.is_promotion_by_total_money}
                                        disabled={noEdit}
                                      />}
                                    />
                                    <InputGroupAddon addonType="append">
                                      <InputGroupText>VNĐ</InputGroupText>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  <ErrorMessage name="max_promotion_total_money" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </Row>
                              <ErrorMessage name="is_promotion_by_total_money" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="is_promorion_by_total_quantity" sm={2} className="font-weight-bold">
                              <Field
                                name="is_promorion_by_total_quantity"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  label="Khuyến mại theo số lượng mua"
                                  id={field.name}
                                  disabled={noEdit}
                                />}
                              />
                            </Label>
                            <Col sm={10}>
                              <Row>
                                <Col sm={6} xs={12}>
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Từ</InputGroupText>
                                    </InputGroupAddon>
                                    <Field
                                      name="min_promotion_total_quantity"
                                      render={({ field /* _form */ }) => <NumberFormat
                                        name={field.name}
                                        onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                        value={1 * values[field.name]}
                                        min={0}
                                        readOnly={!values.is_promorion_by_total_quantity}
                                        disabled={noEdit}
                                      />}
                                    />
                                  </InputGroup>
                                  <ErrorMessage name="min_promotion_total_quantity" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                                <Col sm={6} xs={12}>
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Đến</InputGroupText>
                                    </InputGroupAddon>
                                    <Field
                                      name="max_promotion_total_quantity"
                                      render={({ field /* _form */ }) => <NumberFormat
                                        name={field.name}
                                        onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                        value={1 * values[field.name]}
                                        min={0}
                                        readOnly={!values.is_promorion_by_total_quantity}
                                        disabled={noEdit}
                                      />}
                                    />
                                  </InputGroup>
                                  <ErrorMessage name="max_promotion_total_quantity" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </Row>
                              <ErrorMessage name="is_promorion_by_total_quantity" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Danh sách sản phẩm được khuyến mại</b>
                        </Col>
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
                                <Table size="sm" bordered striped hover responsive>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '1%' }}>#</th>
                                      <th>{window._$g._('Mã sản phẩm')}</th>
                                      <th>{window._$g._('Tên sản phẩm')}</th>
                                      <th>{window._$g._('Model')}</th>
                                      <th>{window._$g._('Nhà sản xuất')}</th>
                                      <th style={{ width: '1%' }}>{window._$g._('Xóa')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>{(() => {
                                    return values.list_apply_product.map((item, idx) => {
                                      return item ? (
                                        <tr key={`list_apply_product-${idx}`}>
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
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Danh sách ưu đãi được áp dụng</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Col sm={12} className="text-right mb-2">
                              {noEdit ? null : (<Button color="primary" disabled={noEdit} className="mr-2" onClick={() => {
                                  this.checkBusinessData() && this.setState({ willShowAddPromotionOffer: true })
                                }}>
                                <i className="fa fa-plus-circle" /> Thêm mới ưu đãi
                              </Button>)}
                              {noEdit ? null : (<Button  disabled={noEdit} className="" onClick={() => {
                                this.checkBusinessData() && this.setState({ willShowSelectPromotionOffer: true });
                              }}>
                                <i className="fa fa-plus-circle" /> Chọn ưu đãi
                              </Button>)}
                            </Col>
                            <Col sm={12}>
                              <Table size="sm" bordered striped hover responsive>
                                <thead>
                                  <tr>
                                    <th style={{ width: '1%' }}>#</th>
                                    <th>{window._$g._('Tên ưu đãi')}</th>
                                    <th>{window._$g._('Cơ sở áp dụng')}</th>
                                    <th>{window._$g._('Ưu đãi khuyến mại')}</th>
                                    <th>{window._$g._('Ngày tạo')}</th>
                                    <th style={{ width: '1%' }}>{window._$g._('Xóa')}</th>
                                  </tr>
                                </thead>
                                <tbody>{(() => {
                                  return values.list_offer_apply.map((item, idx) => {
                                    return item ? (
                                      <tr key={`list_offer_apply-${idx}`}>
                                        <th scope="row" className="text-center">{idx + 1}</th>
                                        <td>{item.promotion_offer_name}</td>
                                        <td>{item.business_name}</td>
                                        <td>{item.offer}</td>
                                        <td className="text-center">{item.create_date || item.created_date || ""}</td>
                                        <td className="text-center">
                                          {noEdit ? null : <Button color="danger" size={"sm"} onClick={(event) => this.handleDelPromotionOffer(item, event)}>
                                            <i className="fa fa-minus-circle" />
                                          </Button>}
                                        </td>
                                      </tr>
                                    ) : null;
                                  });
                                })()}</tbody>
                              </Table>
                              <ErrorMessage name="list_offer_apply" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Loại khách hàng được hưởng khuyến mại</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Col sm={12}>
                              <Field
                                name="is_promotion_customer_type"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Khuyến mại theo đối tượng khách hàng"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col sm={12} hidden={!values.is_promotion_customer_type}>
                              <div className="text-right mb-2">
                                {noEdit ? null : (<Button color="primary" disabled={noEdit} className="mr-2" onClick={() => {
                                    this.checkBusinessData() && this.setState({ willShowAddCustomerType: true });
                                  }}>
                                  <i className="fa fa-plus-circle" /> Thêm mới loại khách hàng
                                </Button>)}
                                {noEdit ? null : (<Button disabled={noEdit} className="" onClick={() => {
                                  this.checkBusinessData() && this.setState({ willShowSelectCustomerType: true });
                                }}>
                                  <i className="fa fa-plus-circle" /> Chọn loại khách hàng
                                </Button>)}
                              </div>
                              <Table size="sm" bordered striped hover responsive>
                                <thead>
                                  <tr>
                                    <th style={{ width: '1%' }}>#</th>
                                    <th>{window._$g._('Loại khách hàng')}</th>
                                    <th>{window._$g._('Thuộc nhóm loại khách hàng')}</th>
                                    <th>{window._$g._('Ngày tạo')}</th>
                                    <th style={{ width: '1%' }}>{window._$g._('Xóa')}</th>
                                  </tr>
                                </thead>
                                <tbody>{(() => {
                                  return values.list_customer_type.map((item, idx) => {
                                    return item ? (
                                      <tr key={`list_customer_type-${idx}`}>
                                        <th scope="row" className="text-center">{idx + 1}</th>
                                        <td>{item.customer_type_name}</td>
                                        <td>{item.customer_type_group_name}</td>
                                        <td>{item.create_date || item.created_date}</td>
                                        <td className="text-center">
                                          <Field
                                            render={({ /*field, */ form }) => {
                                              return (
                                                <Button color="danger" disabled={noEdit} size={"sm"} className="" onClick={(event) => this.handleDelCustomerType(item)}>
                                                  <i className="fa fa-minus-circle" />
                                                </Button>
                                              );
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    ) : null;
                                  });
                                })()}</tbody>
                              </Table>
                              <ErrorMessage name="list_customer_type" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Thiết lập khác</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Col sm={4}>
                              <Field
                                name="is_apply_with_order_promotion"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Được áp dụng với chương trình khuyến mại khác"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col sm={4}>
                              <Field
                                name="is_combo_promotion"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Là khuyến mại theo combo"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col sm={4}>
                              <Field
                                name="is_active"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Kích hoạt"
                                  disabled={noEdit || true}
                                />}
                              />
                            </Col>
                            <Col sm={4}>
                              <Field
                                name="is_limit_promotion_times"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Giới hạn số lần khuyến mại"
                                  disabled={noEdit}
                                />}
                              />&nbsp;
                              <InputGroup className="pl-2 w-auto">
                                <Field
                                  name="max_promotion_times"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    className="text-right"
                                    min={0}
                                    type="number"
                                    placeholder="0"
                                    disabled={noEdit || !values.is_limit_promotion_times}
                                  />}
                                />
                                <InputGroupAddon addonType="append">
                                  <InputGroupText>lần</InputGroupText>
                                </InputGroupAddon>
                                <ErrorMessage name="max_promotion_times" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </InputGroup>
                            </Col>
                            <Col sm={4}>
                              <Field
                                name="is_reward_point"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Có nhận điểm thưởng"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                            <Col sm={4}>
                              <Field
                                name="is_system"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values[field.name]}
                                  type="switch"
                                  id={field.name}
                                  label="Hệ thống"
                                  disabled={noEdit}
                                />}
                              />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mb-4 page_title">
                        <Col sm={12}>
                          <b className="title_page_h1 text-primary">Duyệt chương trình khuyến mại</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="user_review" sm={3}>
                              Người duyệt
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="user_review"
                                render={({ field }) => {
                                  let value = (userOpts || []).find(item => ('' + item.user_name) === ('' + values[field.name]));
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={(item) => field.onChange({
                                        target: { name: field.name, value: item.user_name }
                                      })}
                                      value={value}
                                      isSearchable={true}
                                      options={userOpts}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="user_review" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                          {promotionEnt ? (<FormGroup row>
                            <Label for="note_review" sm={3}>
                              Ghi chú duyệt
                            </Label>
                            <Col sm={9}>
                              {(true === isReviewedYes) ? (
                                <p><span className="alert alert-primary p-2">Đã duyệt (ngày: {promotionEnt.review_date})</span></p>
                              ) : null}
                              {(true === isReviewedNo) ? (
                                <p><span className="alert alert-success p-2">Không duyệt (ngày: {promotionEnt.review_date})</span></p>
                              ) : null}
                              <Field
                                name="note_review"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  value={promotionEnt.note_review || ''}
                                  disabled
                                  readOnly
                                />}
                              />
                              <ErrorMessage name="note_review" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>) : null}
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} className="text-right">
                          {
                            this.props.noEdit ? (
                              promotionEnt ? <CheckAccess permission="SM_PROMOTION_EDIT">
                                <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/promotions/edit/${promotionEnt.id()}`)}
                                  disabled={(!userAuth._isAdministrator() && !!promotionEnt.is_system)}
                                >
                                  <i className="fa fa-edit mr-1" />Chỉnh sửa
                                </Button>
                              </CheckAccess> : null
                            ) : (noEdit ? [] : [
                              <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                <i className="fa fa-save mr-2" />Lưu
                              </Button>,
                              <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                              </Button>
                            ])
                          }
                          <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/promotions')} className="btn-block-sm mt-md-0 mt-sm-2">
                            <i className="fa fa-times-circle mr-1" />Đóng
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
    );
  }
}

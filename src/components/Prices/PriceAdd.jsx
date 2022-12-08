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
  CustomInput,
  Table,
} from "reactstrap";
import Select from 'react-select';
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import moment from 'moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css'
import { DateRangePicker } from 'react-dates'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import NumberFormat from '../Common/NumberFormat';
import ErrorMessageCustom from '../Common/ErrorMessageCustom';

// Model(s)
import PriceModel from "../../models/PriceModel";
import ProductModel from '../../models/ProductModel';
import AreaModel from "../../models/AreaModel";
import CompanyModel from '../../models/CompanyModel';
import BusinessModel from '../../models/BusinessModel';
import OutputTypeModel from "../../models/OutputTypeModel";

// Util(s)
import { mapDataOptions4Select, MOMENT_FORMAT_DATE } from '../../utils/html';

/**
 * @class PriceAdd
 */
export default class PriceAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._priceModel = new PriceModel();
    this._productModel = new ProductModel();
    this._areaModel = new AreaModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
    this._outputTypeModel = new OutputTypeModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Number} */
      _productId: this.props.match.params.productId,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      gridData: [
        this.initLineGridData()
      ],
      /** @var {Array} */
      areaArr: [[{ label: "--- Chọn ---", value: 0 }]],
      businessArr: [[{ label: "--- Chọn ---", value: 0 }]],
      /** @var {Array} */
      outputType: [{ label: "--- Chọn ---", value: 0 }],
      outputTypeArr: [],
      /** @var {Array} */
      companies: [
        { label: "-- Công ty --", id: "" },
      ],
      companySelect: null,
      supportListBusiness: {},
      company_id: null,
    };
    this.idDelete = [];
    this.userAuth = window._$g;
    this.isChangeOutPutWeb = false;
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    this.props.AttributeEnts && this.handleAdd(this.props.AttributeEnts);
  }

  initLineGridData = (data = {}) => ({
    output_type_id: { label: "--- Chọn ---", value: 0, error: true },
    area_ids: this.initSelectData(),
    business_ids: this.initSelectData(),
    price: this.initPriceData(),
    priceVAT: this.initPriceData(),
    price_review: [],
    // supportListBusiness: {},
    price_id: "",
    noEditLine: false,
    is_output_for_web: 0
  });

  initSelectData = (data) => ({
    error: !data,
    data: data || []
  });

  initPriceData = (price) => ({
    error: !price,
    data: price || 0
  })

  formikValidationSchema = Yup.object().shape({
    start_date: Yup.string().required("Thời gian bắt đầu là bắt buộc."),
    end_date: Yup.string().required("Thời gian kết thúc là bắt buộc."),
    company_id: Yup.string().required("Công ty là bắt buộc."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
  }

  /** @var {String} */
  _btnType = null;

  getInitialValues() {

    let { PriceEnt } = this.props;
    let values = Object.assign(
      {}, this._priceModel.fillable(),
    );
    
    if (PriceEnt) {
      Object.assign(values, PriceEnt);
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

  mapFunction = (data) => {
    let functions = (data || []).map(_item => {
      let label = _item.function_name;
      let value = _item.function_alias;
      return ({ label, value });
    });
    return functions;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let bundle = {};

    let productId = this.props.match.params.productId;

    let { PriceEnt } = this.props;

    if (PriceEnt && PriceEnt.product_id) {
      productId = PriceEnt.product_id;
    }
    let all = [
      // @TODO
      this._productModel.read(productId)//({parent_id:0})
        .then(data => (bundle['productEnt'] = data)),
      this._companyModel.getOptions({ is_active: 1, is_delete: 0 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
    ];

    if (PriceEnt && PriceEnt !== -1) {
      all.push(this._priceModel.getOutputType({ is_active: 1, company_id: PriceEnt.company_id })
        .then(data => bundle['outputType'] = mapDataOptions4Select(data.items, "output_type_id", "output_type_name")));
    }

    await Promise.all(all)
      .catch(err => setTimeout(() => window._$g.rdr('/404')))
      ;

    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    if (PriceEnt && PriceEnt !== -1) {
      // prepair company country
      const listItem = PriceEnt.price_apply_outputtype;

      // get all area and business need
      const callApi = [];
      const areaArr = [];
      const businessArr = [];
      const supportListBusiness = [];
      const gridData = [];
      // loop each price row
      listItem.forEach((item, idx) => {
        let output_type_id = {};
        // output_type_id
        
        bundle["outputType"] && bundle["outputType"].forEach((outputItem) => {
          if(outputItem.output_type_id ===  item.output_type_id) {
            output_type_id = outputItem;
          }
        });
        output_type_id = { ...output_type_id, label: item.output_type_name, value: item.output_type_id };
        callApi.push(this._priceModel.getAreaByOutputType({ output_type_id: item.output_type_id }).then(data =>
          areaArr[idx] = mapDataOptions4Select(data.items, "area_id", "area_name")));
        supportListBusiness[idx] = {};
        businessArr[idx] = [];
        const area_ids = [];
        let business_ids = [];
        let price_review = [];

        // loop to area
        item.list_area_apply.forEach((areaItem) => {
          area_ids.push({
            value: 1*areaItem.area_id,
            label: areaItem.area_name,
          });
          // call api get businessArray
          if (item.list_area_apply.length > 1) {
            callApi.push(this._priceModel.getBusinessByArea({ area_id: areaItem.area_id }).then(data =>
              supportListBusiness[idx][item.value] = mapDataOptions4Select(data.items, "business_id", "business_name")
            ));
          } else {
            callApi.push(this._priceModel.getBusinessByArea({ area_id: areaItem.area_id }).then(data =>
              businessArr[idx] = mapDataOptions4Select(data.items, "business_id", "business_name")
            ));
            business_ids = mapDataOptions4Select(item.list_business_apply, "business_id", "business_name");
          }
        });

        // loop apply review
        let checkReviewDisable = false;
        output_type_id.price_review_lv_users && output_type_id.price_review_lv_users.forEach((outputReview) => {

          // find price_review_level_id (tìm mức duyệt tương ứng với api trả về, vì thứ tự api output_type và data price không giống nhau)
          const reviewItem = item.list_price_apply_reviewlevel.find((dataReview) => dataReview.price_review_level_id == outputReview.price_review_level_id) || {};
          
          let objectLabel = outputReview.users.find((userItem) => 1*userItem.user_name === 1*reviewItem.review_user) || {};
          if(!objectLabel) objectLabel = {};
          price_review.push({
            data: {
              label: objectLabel.user_full_name,
              value: reviewItem.review_user
            },
            error: false,
            auto_review: reviewItem.auto_review,
            disable:
              reviewItem.auto_review !== null
              || reviewItem.is_review !== null
              || reviewItem.review_user !== this.userAuth.userAuth.user_name
              || checkReviewDisable,
            price_apply_review_level_id: reviewItem.price_apply_review_level_id,
            is_review: reviewItem.is_review
          });

          // check lv duyet
          if (reviewItem.is_review !== 1) checkReviewDisable = true;
        });

        gridData[idx] = {
          is_output_for_web: 1*item.is_output_for_web,
          output_type_id,
          area_ids: this.initSelectData(area_ids),
          business_ids: this.initSelectData(business_ids),
          price: this.initPriceData(item.price),
          priceVAT: this.initPriceData(item.price_vat),
          price_id: item.price_id,
          noEditLine: item.is_review !== null,
          price_review: price_review,
        }
      });

      await Promise.all(callApi)
        .catch(err => {
          setTimeout(() => window._$g.rdr('/404'));
        });

      bundle["gridData"] = gridData;
      bundle["areaArr"] = areaArr;
      bundle["businessArr"] = businessArr;
      bundle["supportListBusiness"] = supportListBusiness;
      bundle["company_id"] = PriceEnt.company_id;
    }

    return bundle;
  }

  handleAdd = (attributes) => {

    this.setState({
      toggleAttribute: false,
      attributesRender: Object.entries(attributes),
      attributes,
    });

    if (this.formikProps) {
      let { values, setValues } = this.formikProps;
      // attributes
      setValues(Object.assign(values, { "list_attribute": attributes }));
    }
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;

    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { PriceEnt, match } = this.props;
    let { setSubmitting } = formProps;
    const { gridData } = this.state;

    let willRedirect = false;
    let alerts = [];

    // Build form data
    let formData = Object.assign({}, values, {
      product_id: match.params.productId || PriceEnt.product_id,
      is_active: 1 * values.is_active,
      is_review: 1 * values.is_review,
    });
    delete formData.price_apply_outputtype;

    const { validate, all } = this.getAllData(formData, values);
    // CHECK VALIDATE ALL FORM
    if (validate) {
      this.setState({ gridData: [...gridData] });
      setSubmitting(false);
      return;
    }
    const callApi = [];
    all.forEach((dataItem) => {
      dataItem.price_id ? callApi.push(this._priceModel.update(dataItem.price_id, dataItem)) : callApi.push(this._priceModel.create(dataItem));
    });

    // call delete price
    this.idDelete.forEach((idDel) => {
      callApi.push(this._priceModel.delete(idDel));
    })

    Promise.all(callApi)
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/prices');
        }

        this.idDelete = [];
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
        if (!PriceEnt && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }

        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
      ;
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: true,
      alerts: [],
      clearImage: true,
      businessArr: [],
      areaArr: [],
      gridData: [this.initLineGridData()],
      outputType: [{ label: "--- Chọn ---", value: 0 }],
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({
        ...bundle,
        ready: true,
        clearImage: false,
      });
    })();
    //.end
  }

  getAllData(formData, values) {
    const { gridData, supportListBusiness } = this.state;

    let validate = false;
    let all = [];

    const checkexist = {
      output_type: {},
      area: {},
      business: {}
    };

    gridData.forEach((item, idx) => {
      
      /* VALIDATE */
      item.output_type_id.error = !item.output_type_id.value;
      item.area_ids.error = item.output_type_id.error || item.area_ids.data.length < 1;
      // IF AREA SELECT MORE THAN 1, NOT CHECK NULL BUSINESS VALUE
      item.business_ids.error = item.area_ids.error || (item.area_ids.data.length === 1 && item.business_ids.length < 1);
      item.price.error = !item.price.data;
      let lineValidate = item.output_type_id.error
        || item.area_ids.error
        || item.business_ids.error
        || item.price.error
      ;
      // check validate price review
      if ( !item.output_type_id.error && item.output_type_id.price_review_lv_users && item.output_type_id.price_review_lv_users.length > 0 ) {
        item.output_type_id.price_review_lv_users.forEach((reviewItem, reviewIdx) => {
          item.price_review[reviewIdx].error = !item.price_review[reviewIdx].data;
          lineValidate = lineValidate || item.price_review[reviewIdx].error;
        });
      }
      
      // IF LINE VALIDATE IS TRUE, IGNORE THIS LINE, SET VALIDATE IS TRUE, AND CONTINUE OTHER LINE
      if (lineValidate) { validate = true; return true; }
      /* END CHECK VALIDATE */
      const param = {
        formData,
        item,
        values,
        areas: item.area_ids,
        idx
      };
      let businessObject = {};
      if (item.area_ids.data.length === 1) {
        businessObject[idx] = {};
        businessObject[idx][item.area_ids.data[0].value] = item.business_ids;
      } else {
        businessObject = supportListBusiness;
      }
     
      const { data, validateExist } = this.formatDataAPI({ ...param, businessObject, checkexist });

      // CHECK FOR EXIST VALIDATE
      if (validateExist) { validate = true; return true; }
      // CHECK TO CALL API UPDATE
      if (!item.noEditLine || this.isChangeOutPutWeb){
        all.push(data);
      }

    });

    return {
      validate,
      all
    }
  }
  
  formatDataAPI(params) {
    const { formData, item, values, businessObject, areas, idx, checkexist } = params;
    let validateExist = false;
    const list_business_apply = [];
    areas.data.forEach((areaItem) => {
      businessObject[idx][areaItem.value].data.forEach((businessItem) => {
        if (
          checkexist.output_type[item.output_type_id.value]
          && checkexist.area[areaItem.value]
          && checkexist.business[businessItem.value]
        ) {
          validateExist = true;
          item.business_ids.error = "Bị trùng dữ liệu giá, vui lòng kiểm tra lại";
        } else {
          checkexist.output_type[item.output_type_id.value] = true;
          checkexist.area[areaItem.value] = true;
          checkexist.business[businessItem.value] = true;
        }

        list_business_apply.push({
          "company_id": values.company_id,
          "output_type_id": item.output_type_id.value,
          "area_id": areaItem.value,
          "business_id": businessItem.value
        });
      });
    });

    const data = Object.assign({}, formData, {
      is_output_for_web: 1*item.is_output_for_web,
      price_id: item.price_id,
      price: item.price.data,
      price_vat: item.priceVAT.data,
      output_type_id: item.output_type_id.value,
      review_date: item.review_date || "",
      list_business_apply,
      list_price_apply_reviewlevel:
        item.price_review.map((reviewItem, reviewIDx) => ({
          output_type_id: item.output_type_id.value,
          price_review_level_id: item.output_type_id.price_review_lv_users[reviewIDx].price_review_level_id,
          user_name: reviewItem.data.value,
          auto_review: null
        })),
    }
    );
    return { validateExist, data };
  }

  getOutputSelect = (data) => {
    return (data || []).map((_item) => {
      let item = { ..._item };
      let { output_type_id, output_type_name, label, value } = item;
      label = output_type_name || label;
      value = output_type_id || value;
      return ({ ..._item, label, value });
    });
  }

  onChangeCompany = (item, field) => {
    field.onChange({
      target: { type: "select", name: field.name, value: item.value }
    });
    this._priceModel.getOutputType({ /*is_active: 1,*/ company_id: item.id })
      .then(data => {
        const { outputType, gridData, areaArr, businessArr } = this.state;
        // reset output type field
        gridData.forEach((item, key) => {
          if (!item.noEditLine) {
            gridData[key] = { ...this.initLineGridData() };
            areaArr[key] = [];
            businessArr[key] = [];
          }
        });

        this.setState({
          outputType: [outputType[0]].concat(mapDataOptions4Select(data.items, "output_type_id", "output_type_name")),
          gridData: [...gridData],
          areaArr: [...areaArr],
          businessArr: [...businessArr],
          company_id: item.id
        });
      });
  }

  onChangeOutPutType(item, idx) {
    let { gridData, areaArr, businessArr, supportListBusiness } = this.state;
    if (gridData[idx].output_type_id === item) {
      return;
    }

    gridData[idx].output_type_id = { ...item, error: item.value === 0 };

    const vat = item.vat_value || 0;
    // update price VAT
    gridData[idx].priceVAT.data = (gridData[idx].price.data * vat) / 100 + 1 * gridData[idx].price.data;

    // reset data business
    businessArr[idx] = [];
    gridData[idx].business_ids = this.initSelectData();
    supportListBusiness[idx] = [];

    // reset data area and business
    areaArr[idx] = [];
    gridData[idx].area_ids = this.initSelectData();

    // reset price review
    gridData[idx].price_review = item.price_review_lv_users ? item.price_review_lv_users.map((item) => (this.initPriceData())) : this.initPriceData();

    if (item.value === 0) {
      this.setState({
        areaArr: [...areaArr],
        businessArr: [...businessArr],
        gridData: [...gridData],
      })
    } else {
      this._priceModel.getAreaByOutputType({ output_type_id: item.value }).then(data => {
        areaArr[idx] = mapDataOptions4Select(data.items, "area_id", "area_name");
        this.setState({
          areaArr: [...areaArr],
          businessArr: [...businessArr],
          gridData: [...gridData],
          supportListBusiness: { ...supportListBusiness }
        })
      })
    }
  }

  onChangeArea(items, idx) {
    
    let { businessArr, gridData, supportListBusiness, company_id } = this.state;
    if (gridData[idx].area_ids.data === items) {
      return;
    }

    gridData[idx].area_ids = {
      data: items,
      error: !items || items.length < 1
    }
    if (!items || items.length !== 1) {
      // reset business
      businessArr[idx] = [];
      gridData[idx].business_ids = this.initSelectData();

      if (items && items.length > 1) {
        (async () => {
          const multiBusiness = {};
          const all = [];
          items.forEach((item) => {
            all.push(this._priceModel.getBusinessByArea({ area_id: item.value, company_id })
              .then(data => multiBusiness[item.value] = mapDataOptions4Select(data.items, "business_id", "business_name")
              ));
          })

          await Promise.all(all);
          supportListBusiness[idx] = multiBusiness;
          this.setState({
            gridData: [...gridData],
            businessArr: [...businessArr],
            supportListBusiness: { ...supportListBusiness }
          })
        })();
      } else {
        this.setState({
          gridData: [...gridData],
          businessArr: [...businessArr],
          supportListBusiness: { ...supportListBusiness }
        })
      }
    } else {

      (async () => {
        const multiBusiness = {};
        const all = [];
        items.forEach((item) => {
          all.push(this._priceModel.getBusinessByArea({ area_id: item.value, company_id })
            .then(data => multiBusiness[item.value] = mapDataOptions4Select(data.items, "business_id", "business_name")
            ));
        })

        await Promise.all(all);
        businessArr[idx] = [...multiBusiness[items[0].value]];
        supportListBusiness[idx] = multiBusiness;
        this.setState({
          gridData: [...gridData],
          businessArr: [...businessArr],
          supportListBusiness: { ...supportListBusiness }
        })
      })();

      // this._priceModel.getBusinessByArea({area_id:items.id}).then(data => {
      //   businessArr[idx] = mapDataOptions4Select(data.items, "business_id", "business_name");
      //   supportListBusiness[idx] = [];
      //   this.setState({
      //     gridData: [...gridData],
      //     businessArr : [...businessArr],
      //     supportListBusiness: {...supportListBusiness}
      //   })
      // })
    }
  }

  onChangeBusiness(items, idx) {
    const { gridData } = this.state;
    gridData[idx].business_ids = {
      data: items,
      error: !items || items.length < 1
    }
    this.setState({ gridData: [...gridData] });
  }

  onChangePriceReview(items, idx, reviewIdx) {
    const { gridData } = this.state;
    if (!gridData[idx].price_review[reviewIdx] || gridData[idx].price_review[reviewIdx].data !== items) {
      gridData[idx].price_review[reviewIdx] = {
        data: items,
        error: false
      }
      this.setState({ gridData: [...gridData] });
    }
  }

  handleRemoveLine(idx) {
    let { gridData, businessArr, areaArr } = this.state;

    // save id price delete 
    if (gridData[idx].price_id) {
      this.idDelete.push(gridData[idx].price_id);
    }

    gridData.splice(idx, 1);
    businessArr.splice(idx, 1);
    areaArr.splice(idx, 1);

    this.setState({
      gridData: [...gridData],
      businessArr: [...businessArr],
      areaArr: [...areaArr]
    });
  }

  handleAddLine = () => {
    let { gridData } = this.state;
    gridData.push(this.initLineGridData());
    this.setState({ gridData: [...gridData] });
  }

  updatePriceVAT = (item, idx) => {
    let { gridData } = this.state;

    gridData[idx].price.data = 1 * item.target.value.replace(/,/g, '');
    gridData[idx].price.error = gridData[idx].price.data === 0;
    const vat = gridData[idx].output_type_id.vat_value ? 1 * gridData[idx].output_type_id.vat_value : 0;
    // calculate vat
    gridData[idx].priceVAT.data = (gridData[idx].price.data * vat) / 100 + gridData[idx].price.data;
    this.setState({ gridData: [...gridData] });
  }

  updateIsReview = (confirm, id, idx) => {
    const { gridData } = this.state;
    let postData = {
      "price_apply_review_level_id": gridData[id].price_review[idx].price_apply_review_level_id,
      "is_review": confirm,
      "note": gridData[id].price_review[idx].note,
    };
    this._priceModel.updateApproveReview(gridData[id].price_id, postData)
      .then(() => {
        gridData[id].price_review[idx].disable = true;
        gridData[id].price_review[idx].is_review = confirm;
        this.setState({
          gridData: [...gridData],
        }, () => {
          window._$g.toastr.show('Cập nhật mức duyệt thành công.', 'success');
        });
      })
      .catch(() => {
        window._$g.toastr.show('Cập nhật mức duyệt không thành công.', 'error');
      });
  }

  onBlurReviewNote = (event, id, idx) => {
    const { gridData } = this.state;
    gridData[id].price_review[idx].note = event.target.value;
    this.setState({ gridData: [...gridData] });
  }

  onChangeOutWeb = (event, value, idx) => {
    let checked = ((1 * event.target.value) === 1 ? 0 : 1);
    const { gridData } = this.state;
    gridData.forEach(item => item.is_output_for_web = false);
    gridData[idx].is_output_for_web = checked;
    this.setState({ gridData: [...gridData]});
    this.isChangeOutPutWeb = true;
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      companies,
      productEnt,
      gridData,
      areaArr,
      outputType,
      businessArr,
    } = this.state;
    let { PriceEnt, noEdit, isReview } = this.props;
    if (!ready) {
      return <Loading />;
    }
    console.log('this.state', this.state);
    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12} hidden={this.state.toggleAttribute}>
            <Card >
              <CardHeader>
                <b>Làm giá sản phẩm {PriceEnt ? PriceEnt.product_category_name : ''}</b>
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
                  initialValues={this.getInitialValues()}
                  validationSchema={this.formikValidationSchema}
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    handleSubmit,
                    handleReset,
                    isSubmitting,
                    submitCount
                  } = (this.formikProps = window._formikProps = formikProps);
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin sản phẩm</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={4} className="price-product-image justify-content-end">
                          <img src={productEnt && productEnt.pictures[0] ? productEnt.pictures[0].picture_url : null} alt="product" />
                        </Col>
                        <Col xs={12} sm={8}>
                          <Row>
                            <Label xs={12}> {productEnt && productEnt.product_name} </Label>
                            <Label xs={12}> {productEnt && productEnt.product_code} </Label>
                          </Row>
                        </Col>
                      </Row>

                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Làm giá</b>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label for="seo_name" className="text-right" sm={4}>
                              Công ty <span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={8}>
                              <Field
                                name="company_id"
                                render={({ field/*, form*/ }) => {
                                  let defaultValue = companies.find(value => value.value === field.value) || null;
                                  let placeholder = (companies[0] && companies[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      options={companies}
                                      value={defaultValue}
                                      isDisabled={noEdit}
                                      onChange={(item) => this.onChangeCompany(item, field)}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="company_id" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label className="text-right" for="seo_name" sm={4}>
                              Thời gian áp dụng giá <span className="font-weight-bold red-text">*</span>
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
                              <ErrorMessage name="start_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                              <ErrorMessage name="end_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={12} className="mb-3">
                          <FormGroup>
                            <Table size="sm" bordered striped >
                              <thead>
                                <tr>
                                  <th className="text-center align-middle" style={{ maxWidth: '130px' }}>STT</th>
                                  <th className="text-center align-middle">Hình thức xuất</th>
                                  <th className="text-center align-middle">Khu vực</th>
                                  <th className="text-center align-middle">Cơ sở phòng tập</th>
                                  <th className="text-center align-middle" style={{ width: '150px' }}>Giá</th>
                                  <th className="text-center align-middle" style={{ width: '50px' }}>Hiển thị web</th>
                                  <th className="text-center align-middle">Thông tin duyệt</th>
                                  <th className="text-center align-middle" style={{ width: '1%' }}>Xóa</th>
                                </tr>
                              </thead>
                              <tbody>
                                {gridData.map((item, idx) => {
                                  let {
                                    output_type_id,
                                    area_ids,
                                    business_ids,
                                    price,
                                    priceVAT,
                                    price_review,
                                    noEditLine,
                                    is_output_for_web
                                  } = item;
                                  return item ? ([
                                    <tr key={`campaign_rlevel-0${idx}`}>
                                      <td className="text-center align-middle">
                                        <Label>{idx + 1}</Label>
                                      </td>

                                      <td className="align-middle">
                                        <Select
                                          isSearchable={true}
                                          options={outputType}
                                          value={output_type_id}
                                          isDisabled={noEditLine || isReview}
                                          onChange={item => this.onChangeOutPutType(item, idx)}
                                        />
                                        {submitCount > 0 && output_type_id.error && <ErrorMessageCustom message="Hình thức xuất là bắt buộc" />}
                                      </td>

                                      <td className="align-middle">
                                        <Select
                                          isSearchable={true}
                                          options={areaArr[idx]}
                                          value={area_ids.data}
                                          isDisabled={noEditLine || isReview}
                                          onChange={item => this.onChangeArea(item, idx)}
                                          isMulti
                                        />
                                        {submitCount > 0 && area_ids.error && <ErrorMessageCustom message="Khu vực là bắt buộc" />}
                                      </td>
                                      <td className="align-middle">
                                        <Select
                                          isSearchable
                                          options={businessArr[idx]}
                                          value={business_ids.data}
                                          multiple
                                          isDisabled={noEditLine || isReview}
                                          onChange={item => this.onChangeBusiness(item, idx)}
                                          isMulti
                                        />
                                        {submitCount > 0 && business_ids.error && <ErrorMessageCustom message={typeof business_ids.error === "string" ? business_ids.error : "Cơ sở là bắt buộc"} />}
                                      </td>
                                      <td className="align-middle">
                                        <Col xs={12} className="pb-2">
                                          <Row className="flex-column text-left pb-2">
                                            <Label className="mb-0">Chưa VAT</Label>
                                            <Field
                                              render={({ field }) => <NumberFormat
                                                name={field.name}
                                                value={price.data}
                                                disabled={noEditLine || isReview}
                                                onBlur={(item) => this.updatePriceVAT(item, idx)}
                                                style={{ width: 'auto', maxWidth: 150 }}
                                              />}
                                            />
                                            {submitCount > 0 && price.error && <ErrorMessageCustom message="Giá là bắt buộc" />}
                                          </Row>
                                        </Col>
                                        {
                                          output_type_id.is_vat ? (
                                            <Col xs={12}>
                                              <Row className="flex-column text-left pb-2">
                                                <Label className="mb-0">Có VAT</Label>
                                                <NumberFormat
                                                  value={priceVAT.data}
                                                  disabled
                                                  style={{ width: 'auto', maxWidth: 150 }}
                                                />
                                              </Row>
                                            </Col>) : null
                                        }

                                      </td>
                                      <td className="text-center align-middle">
                                        <FormControlLabel
                                          value={is_output_for_web}
                                          disabled={noEditLine || isReview}
                                          control={
                                          <Switch
                                            color="primary"
                                            checked={!!is_output_for_web}
                                            value={is_output_for_web}
                                          />
                                          }
                                          onChange={(event, value) => this.onChangeOutWeb(event, value, idx)}
                                        />
                                      </td>
                                      <td className="text-center align-middle">
                                        {
                                          (output_type_id && Array.isArray(output_type_id.price_review_lv_users) && output_type_id.price_review_lv_users.length > 0) && output_type_id.price_review_lv_users.map((item, reviewIdx) => {
                                            if(!price_review[reviewIdx]) return null;
                                            return (
                                              <Col xs={12} key={"reviewIdx" + reviewIdx}>
                                                <Row className="flex-column text-left pb-2">
                                                  <Label className="mb-0">{item.price_review_level_name}</Label>
                                                  <Select
                                                    isSearchable
                                                    options={mapDataOptions4Select(item.users, "user_name", "user_full_name")}
                                                    value={price_review[reviewIdx] && price_review[reviewIdx].data}
                                                    isDisabled={price_review[reviewIdx].disable || isReview}
                                                    onChange={item => this.onChangePriceReview(item, idx, reviewIdx)}
                                                  />
                                                  {
                                                    isReview && <CheckAccess permission="SL_PRICE_REVIEW" any>
                                                      {
                                                        !price_review[reviewIdx].disable && <Input onBlur={(event) => this.onBlurReviewNote(event, idx, reviewIdx)} placeholder="Ghi chú" />
                                                      }
                                                      <Col xs={12}>
                                                        <Row className="flex-row justify-content-around">
                                                          {price_review[reviewIdx].is_review !== 0 &&
                                                            <Button color="success" disabled={price_review[reviewIdx].disable} onClick={() => this.updateIsReview(1, idx, reviewIdx)} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                                              <i className="fa fa-save mr-2" />Duyệt
                                                            </Button>
                                                          }

                                                          {price_review[reviewIdx].is_review !== 1 &&
                                                            <Button color="primary" disabled={price_review[reviewIdx].disable} onClick={() => this.updateIsReview(0, idx, reviewIdx)} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                                              <i className="fa fa-save mr-2" />Không duyệt
                                                            </Button>
                                                          }
                                                        </Row>
                                                      </Col>
                                                    </CheckAccess>
                                                  }
                                                  {submitCount > 0 && price_review[reviewIdx] && price_review[reviewIdx].error && <ErrorMessageCustom message="Thông tin duyệt là bắt buộc" />}
                                                </Row>
                                              </Col>)
                                          })
                                        }
                                      </td>
                                      <td className="text-center align-middle">
                                        <Button color="danger" disabled={noEditLine || isReview} size={"sm"} onClick={(event) => this.handleRemoveLine(idx)}>
                                          <i className="fa fa-minus-circle" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ]) : null;
                                })}
                              </tbody>
                            </Table>
                            <div style={{ width: "100%" }} >
                              <ErrorMessage name="list_attribute" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </div>
                          </FormGroup>
                          <div>
                            {!isReview &&
                              <Button onClick={this.handleAddLine}>
                                <i className="fa fa-plus-circle" /> Thêm dòng
                            </Button>}
                          </div>
                        </Col>

                        <Col xs={12}>
                          <FormGroup row>
                            <Label className="text-right" sm={2}>Ghi chú</Label>
                            <Col sm={10}>
                              <Field
                                name="notes"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="notes" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={4}>
                          <FormGroup row>
                            <Label for="is_active" sm={2}></Label>
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
                      <Row>
                        <Col sm={12} className="text-right">
                          {
                            !isReview &&
                            [

                              <CheckAccess permission={[
                                "SL_PRICES_EDIT",
                                "SL_PRICES_ADD",
                              ]} any key={1}
                              >
                                <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                  <i className="fa fa-save mr-2" />Lưu
                                </Button>
                              </CheckAccess>,
                              <CheckAccess permission={[
                                "SL_PRICES_EDIT",
                                "SL_PRICES_ADD",
                              ]} any key={2}
                              >
                                <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                </Button>
                              </CheckAccess>
                            ]
                          }
                          <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/prices')} className="btn-block-sm mt-md-0 mt-sm-2">
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

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
import Select from "react-select";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Util(s)
import { mapDataOptions4Select, mappingDisabled } from '../../utils/html';

// Model(s)
import OutputTypeModel from "../../models/OutputTypeModel";
import CompanyModel from "../../models/CompanyModel";
import AreaModel from "../../models/AreaModel";
import ProductCategoryModel from '../../models/ProductCategoryModel'
import PriceReviewModel from '../../models/PriceReviewModel'
import DepartmentModel from '../../models/DepartmentModel'
import UserModel from '../../models/UserModel'
import VATModel from '../../models/VATModel'

/**
 * @class OutputTypeAdd
 */
export default class OutputTypeAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._outputTypeModel = new OutputTypeModel();
    this._companyModel = new CompanyModel();
    this._areaModel = new AreaModel();
    this._productCategoryModel = new ProductCategoryModel();
    this._priceReviewModel = new PriceReviewModel();
    this._departmentModel = new DepartmentModel();
    this._userModel = new UserModel();
    this._vatModel = new VATModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);
    this.handleAddLevel = this.handleAddLevel.bind(this);
    this.handleRemoveLevel = this.handleRemoveLevel.bind(this);
    this.handleChangeCRLDepartment = this.handleChangeCRLDepartment.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      areas: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      company: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      productOptions: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      priceReview: [
        { name: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      departments: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      vats: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Object} */
      usersOf: {
        _: { label: "-- Người duyệt --", value: "" },
      },
      isEditDepartment: false,
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();

    this.handleGetUserReviewWhenEdit()
    //.end
  }

  handleGetUserReviewWhenEdit() {
    let { outputTypeEnt } = this.props;
    let values = Object.assign(
      {}, this._outputTypeModel.fillable(),
    );
    if (outputTypeEnt) {
      Object.assign(values, outputTypeEnt)
      for (let l = 0; l < outputTypeEnt.price_review_lv_users.length; l++) {
        this.handleChangeCRLDepartment({
          value: values.price_review_lv_users[l].department_id,
        }, null, l)
      }
    }
  }

  getInitialValues() {
    let { outputTypeEnt } = this.props;
    let values = Object.assign(
      {}, this._outputTypeModel.fillable(),
    );

    if (outputTypeEnt) {
      Object.assign(values, outputTypeEnt, {
        product_categorie_ids: outputTypeEnt.product_categories.map(({ product_category_name: label, product_category_id: value }) => ({ value, label })),
        area_id: outputTypeEnt.areas.map(({ area_name: label, area_id: value }) => ({ value, label }))
      });
    }

    let priceReviewRLV = this.state.priceReview.filter(item => (1 * item.is_compele_review) === (1 * true));
    if (priceReviewRLV.length) {
      for (let ii = 0; ii < values.price_review_lv_users.length; ii++) {
        for (let i = 0; i < priceReviewRLV.length; i++) {
          let index = values.price_review_lv_users[ii].price_review_level_id === priceReviewRLV[i].id;
          values.price_review_lv_users[ii].is_compele_review = index;
        }
      }
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
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    // let { businessEnt } = this.props;
    let bundle = {};
    let all = [
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['company'] = mapDataOptions4Select(data))),
      this._areaModel.getOptions()
        .then(data => (bundle['areas'] = mapDataOptions4Select(data))),
      this._productCategoryModel.getOptionsForCreate({ is_active: 1 })
        .then(data => (bundle['productOptions'] = mapDataOptions4Select(data))),
      this._priceReviewModel.getOptions()
        .then(data => (bundle['priceReview'] = mapDataOptions4Select(data))),
      this._vatModel.getOptions()
        .then(data => (bundle['vats'] = mapDataOptions4Select(data))),
    ];

    let { outputTypeEnt } = this.props;
    if (outputTypeEnt) {
      all.push(
        this._departmentModel.getOptions({ parent_id: outputTypeEnt.company_id })
          .then(data => (bundle['departments'] = mapDataOptions4Select(data)))
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
    output_type_name: Yup.string().required("Tên hình thức xuất là bắt buộc."),
    company_id: Yup.string().required("Công ty áp dụng là bắt buộc"),
    area_id: Yup.string().required("Khu vực áp dụng là bắt buộc"),
    price_review_lv_users: Yup.string().required("Áp dụng mức duyệt giá là bắt buộc"),
    product_categorie_ids: Yup.array().required("Danh mục sản phẩm là bắt buộc"),
  });

  handleAddLevel(evt) {
    let { values, handleChange } = this.formikProps;
    let { price_review_lv_users: value } = values;
    let item = {
      price_review_level_id: undefined,
      department_id: undefined,
      is_auto_review: 1,
      is_compele_review: 0,
      users: [],
    };
    value.push(item);
    handleChange({ target: { name: "price_review_lv_users", value }});
  }

  handleRemoveLevel(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { price_review_lv_users: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    value.splice(foundIdx, 1);
    handleChange({ target: { name: "price_review_lv_users", value }});
  }

  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikValidate(values) {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      (typeof values[prop] === "string") && (values[prop] = values[prop].trim());
    });
    //.end

    let errors = {};
    let { priceReview } = this.state;
    let { price_review_lv_users, is_vat, vat_id } = values;
    let errMsg = "";

    if (1 * values.is_vat && values.vat_id === 0) {
      errors.vat_id = (errMsg = `Mức VAT là bắt buộc!`);
    }

    if (price_review_lv_users.length) {
      let arrayCheck = ['price_review_level_id', 'department_id', 'users']
      let arrayCheckName = ['Tên mức duyệt', 'Phòng ban', 'Người duyệt']
      for (let i = 0; i < price_review_lv_users.length; i++) {
        for (let j = 0; j < arrayCheck.length; j++) {
          let value = price_review_lv_users[i][arrayCheck[j]];
          if ((!value && typeof value !== 'object') || (value.length === 0 && typeof value === 'object')) {
            errors.price_review_lv_users = (errMsg = `${arrayCheckName[j]} là bắt buộc!`);
            return errors;
          }
        }
      }

      let priceReviewRLV = priceReview.filter(item => (1 * item.is_compele_review) === (1 * true));
      if (priceReviewRLV.length) {
        for (let i = 0; i < priceReviewRLV.length; i++) {
          let checkAutoCompleteReview = price_review_lv_users.find(({ price_review_level_id }) => price_review_level_id === priceReviewRLV[i].id);
          if (!checkAutoCompleteReview) {
            errors.price_review_lv_users = (errMsg = `Không có mức duyệt cuối!`);
            return errors;
          }
        }
      }

      let isCompleteReviewCnt = 0;
      let isLastCompleteReviewYes = price_review_lv_users.length
        && (1 * price_review_lv_users[price_review_lv_users.length - 1].is_compele_review)
      ;
      price_review_lv_users.forEach((item) => {
        if (!errors.price_review_lv_users) {
          if (1 * item.is_compele_review) {
            isCompleteReviewCnt += 1;
          }
        }
      });
      if (!errors.price_review_lv_users) {
        if (isCompleteReviewCnt !== 1 || !isLastCompleteReviewYes) {
          errors.price_review_lv_users = (errMsg = `Bắt buộc phải có một mức duyệt là "Mức duyệt cuối" nằm ở ví trí cuối cùng trong danh sách mức duyệt.`);
        }
      }
    }

    return errors;
  }

  handleFormikSubmit(values, formProps) {
    let { outputTypeEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;
    let willRedirect = false;
    let alerts = [];

    let area_id = ''
    for (let k = 0; k < values.area_id.length; k++){
      if (area_id) {
        area_id += `|${values.area_id[k].value}`
      } else {
        area_id += values.area_id[k].value
      }
    }

    let product_categorie_ids = ''
    for (let k = 0; k < values.product_categorie_ids.length; k++){
      if (product_categorie_ids) {
        product_categorie_ids += `|${values.product_categorie_ids[k].value}`
      } else {
        product_categorie_ids += values.product_categorie_ids[k].value
      }
    }

    for (let l = 0; l < values.price_review_lv_users.length; l++) {
      let users =''
      for (let m = 0; m < values.price_review_lv_users[l].users.length; m++) {
        let data = values.price_review_lv_users[l].users[m]
        if (m === values.price_review_lv_users[l].users.length - 1) {
          users += data.user_name || data.value
        } else {
          users += `${data.user_name || data.value}|`
        }
      }
      values.price_review_lv_users[l].user_names = users
    }

    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_vat: 1 * values.is_vat,
      product_categorie_ids: product_categorie_ids,
      area_id: area_id,
    });

    let outputTypeID = (outputTypeEnt && outputTypeEnt.output_type_id) || formData[this._outputTypeModel];
    let apiCall = outputTypeID
      ? this._outputTypeModel.edit(outputTypeID, formData)
      : this._outputTypeModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/output-type');
        }

        if (this._btnType === 'save' && !outputTypeID) {
          resetForm();
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
        if (!outputTypeEnt && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    this.setState(state => ({
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

  handleChangeCRLDepartment(changeItem, reviewItem, index) {
    let { usersOf } = this.state;
    const callback = () => this.setState({ usersOf: {...usersOf} });

    let { value: department_id } = changeItem;
    this._userModel.getOptionsFull({ department_id })
      .then(data => {
        let users = mapDataOptions4Select(data);
        Object.assign(usersOf, { [index]: users });
        callback()
      });

    callback()
  }

  handleChangeCRLCompany(parent_id) {
    let { departments } = this.state;
    this._departmentModel.getOptions({ parent_id })
      .then(data => {
        let departmentsArr = [departments[0]].concat(mapDataOptions4Select(data));
        this.setState({ departments: departmentsArr });
      });
  }

  render() {
    let {
      _id,
      ready,
      alerts,
    } = this.state;
    let { outputTypeEnt, noEdit } = this.props;
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
                <b>{outputTypeEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} hình thức xuất</b>
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
                      <Col xs={12}>
                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="output_type_name"  sm={3}>
                                Tên hình thức xuất<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="output_type_name"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="output_type_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup>
                              <Row>
                                <Label sm={3} />
                                <Col sm={8} className="d-flex">
                                  <Field
                                    name="is_vat"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-is_vat"
                                      onBlur={null}
                                      checked={values.is_vat}
                                      type="switch"
                                      id={field.name}
                                      label="Có VAT"
                                      disabled={outputTypeEnt}
                                    />}
                                  />
                                </Col>
                              </Row>
                            </FormGroup>
                          </Col>
                          {values.is_vat ? (
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="vat_id" sm={3}>
                                  Mức VAT<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="vat_id"
                                    render={({ field/*, form*/ }) => {
                                      let { vats } = this.state
                                      let defaultValue = vats.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (vats[0] && vats[0].label) || '';
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
                                          options={vats}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="vat_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          ) : null}
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="company_id" sm={3}>
                                Công ty áp dụng<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="company_id"
                                  render={({ field/*, form*/ }) => {
                                    let { company } = this.state
                                    let defaultValue = company.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (company[0] && company[0].label) || '';
                                    return (
                                      <Select
                                        id={field.name}
                                        name={field.name}
                                        onChange={({ value }) => {
                                          this.handleChangeCRLCompany(value);
                                          field.onChange({ target: { type: "select", name: field.name, value: value } });
                                        }}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={defaultValue}
                                        options={company}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="area_id" sm={3}>
                                Khu vực áp dụng<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="area_id"
                                  render={({ field/*, form*/ }) => {
                                    let { areas } = this.state
                                    let placeholder = (areas[0] && areas[0].label) || '';
                                    return (
                                      <Select
                                        isMulti
                                        id={field.name}
                                        name={field.name}
                                        onChange={(changeItem) => field.onChange({
                                          target: { type: "select", name: field.name, value: changeItem }
                                        })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={field.value}
                                        options={areas}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="area_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="product_categorie_ids" sm={3}>
                                Danh mục sản phẩm<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="product_categorie_ids"
                                  render={({ field/*, form*/ }) => {
                                    let { productOptions } = this.state
                                    let placeholder = (productOptions[0] && productOptions[0].label) || '';
                                    return (
                                      <Select
                                        isMulti
                                        id={field.name}
                                        name={field.name}
                                        onChange={(changeItem) => field.onChange({
                                          target: { type: "select", name: field.name, value: changeItem }
                                        })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={field.value}
                                        options={productOptions}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="product_categorie_ids" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="" sm={3}>
                                Mô tả
                              </Label>
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
                                <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="mt-4">
                          <Col xs={12}>
                            <b className="underline">Áp dụng mức duyệt giá<span className="font-weight-bold red-text">*</span></b>
                          </Col>
                        </Row>
                        <Row className="mt-3">
                          <Col xs={12}>
                            <FormGroup>
                              <Table size="sm" bordered striped hover>
                                <thead>
                                  <tr>
                                    <th style={{ width: '1%', textAlign: 'center' }}>#</th>
                                    <th style={{ width: '200px', textAlign: 'center' }}>Tên mức duyệt</th>
                                    <th style={{ width: '200px', textAlign: 'center' }}>Phòng ban</th>
                                    <th style={{ textAlign: 'center' }}>Người duyệt</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Mức duyệt cuối</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Tự động duyệt</th>
                                    <th style={{ width: '1%', textAlign: 'center' }}>Xóa</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {values.price_review_lv_users.map((item, idx) => {
                                    let { priceReview } = this.state
                                    let {
                                      price_review_level_id,
                                      department_id,
                                      is_auto_review,
                                      is_compele_review,
                                      users = [],
                                    } = item;
                                    let priceReviewRLV = priceReview.find(({ value }) => (1 * value) === (1 * price_review_level_id));

                                    return item ? ([
                                      <tr key={`priceReview_rlevel-0${idx}`}>
                                        <td className="text-center align-middle">{idx + 1}</td>
                                        <td className="align-middle">
                                          <Field
                                            name={`price_review_level_id_${idx}`}
                                            render={({ field/*, form*/ }) => {
                                              let cloneData = mappingDisabled(values.price_review_lv_users, priceReview, "price_review_level_id");
                                              let options = cloneData.map(({ name: label, id: value, isDisabled, is_compele_review }) => ({ value, label, isDisabled, is_compele_review }));
                                              let defaultValue = options.find(({ value }) => (1 * value) === (1 * price_review_level_id));
                                              let placeholder = (priceReview[0] && priceReview[0].label) || '';

                                              return (
                                                <Select
                                                  id={field.name}
                                                  name={field.name}
                                                  onChange={(changeItem) => {
                                                    let name = "price_review_level_id";
                                                    Object.assign(item, {
                                                      price_review_level_id: changeItem.value,
                                                      is_compele_review: (1 * changeItem.is_compele_review),
                                                    });
                                                    field.onChange({ target: { name, value: values[name] } });
                                                  }}
                                                  isSearchable={true}
                                                  placeholder={placeholder}
                                                  defaultValue={defaultValue}
                                                  options={options}
                                                  isDisabled={noEdit}
                                                />
                                              );
                                            }}
                                          />
                                        </td>
                                        <td className="align-middle">
                                          <Field
                                            name={`department_id_${idx}`}
                                            render={({ field/*, form*/ }) => {
                                              let { departments } = this.state
                                              let defaultValue = departments.find(({ value }) => (1 * value) === (1 * department_id));
                                              let placeholder = (departments[0] && departments[0].label) || '';
                                              return (
                                                <Select
                                                  id={field.name}
                                                  name={field.name}
                                                  onChange={(changeItem) => {
                                                    this.handleChangeCRLDepartment(changeItem, item, idx);
                                                    this.setState({ isEditDepartment: true })
                                                    Object.assign(item, { department_id: changeItem.value });
                                                    let name = "department_id";
                                                    field.onChange({ target: { name, value: values[name] } });
                                                  }}
                                                  isSearchable={true}
                                                  placeholder={placeholder}
                                                  defaultValue={defaultValue}
                                                  options={departments}
                                                  isDisabled={noEdit}
                                                />
                                              );
                                            }}
                                          />
                                        </td>
                                        <td className="align-middle">
                                          <Field
                                            name={`users_rlevel_id_${idx}`}
                                            render={({ field/*, form*/ }) => {
                                              let { isEditDepartment, usersOf } = this.state
                                              let options = [].concat(usersOf[idx] || []);
                                              // let defaultValue = [];
                                              // options.forEach((_optItem) => {
                                              //   defaultValue.push({
                                              //     value: _optItem.value,
                                              //     label: _optItem.label,
                                              //   });
                                              // });
                                              let defaultValue = users.map(({ user_full_name: label, user_name: value }) => ({ value, label }))
                                              let placeholder = (usersOf._ && usersOf._.label) || '';
                                              return options.length > 0 && (
                                                <Select
                                                  id={field.name}
                                                  name={field.name}
                                                  isMulti
                                                  className="basic-multi-select"
                                                  classNamePrefix="select"
                                                  onChange={(changeItems) => {
                                                    changeItems = ((changeItems instanceof Array) ? changeItems: [changeItems]).filter(_i => !!(_i && _i.value));
                                                    Object.assign(item, { users: changeItems });
                                                    let name = "users";
                                                    field.onChange({ target: { name, value: values[name] } });
                                                  }}
                                                  isSearchable={true}
                                                  placeholder={placeholder}
                                                  defaultValue={!isEditDepartment ? defaultValue : null}
                                                  options={options}
                                                  isDisabled={noEdit}
                                                />
                                              );
                                            }}
                                          />
                                        </td>
                                        <td className="text-center">
                                          <CustomInput
                                            id={`is_compele_review_rlevel_order_index_${idx}`}
                                            readOnly
                                            checked={!!(priceReviewRLV && (1 * is_compele_review))}
                                            type="switch"
                                            label=""
                                            disabled={noEdit}
                                          />
                                        </td>
                                        <td className="text-center">
                                          <Field
                                            name={`is_auto_review_rlevel_id_${idx}`}
                                            render={({ field/*, form*/ }) => {
                                              return (
                                                <CustomInput
                                                  {...field}
                                                  id={field.name}
                                                  name={field.name}
                                                  onBlur={null}
                                                  checked={is_auto_review}
                                                  onChange={(event) => {
                                                    const { target } = event;
                                                    Object.assign(item, { is_auto_review: (1 * target.checked) });
                                                    let name = "is_auto_review";
                                                    field.onChange({ target: { name, value: values[name] } });
                                                  }}
                                                  type="switch"
                                                  label=""
                                                  disabled={noEdit}
                                                />
                                              );
                                            }}
                                          />
                                        </td>
                                        <td className="text-center align-middle">
                                          {!noEdit && (<Button color="danger" size={"sm"} onClick={(event) => this.handleRemoveLevel(item, event)}>
                                            <i className="fa fa-minus-circle" />
                                          </Button>)}
                                        </td>
                                      </tr>
                                    ]) : null;
                                  })}
                                  {!values.price_review_lv_users.length ? (
                                    <tr><td colSpan={100}>&nbsp;</td></tr>
                                  ) : null}
                                </tbody>
                              </Table>
                              {!noEdit && (<Row>
                                <Col sm={12}>
                                  <ErrorMessage name="price_review_lv_users" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                                <Col sm={12}>
                                  <Button onClick={this.handleAddLevel}>
                                    <i className="fa fa-plus-circle" /> Thêm
                                  </Button>
                                </Col>
                              </Row>)}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="is_active" sm={3}></Label>
                                <Col sm={9}>
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
                          <Col xs={12}>
                            <Row>
                              <Col sm={12} className="text-right">
                                {
                                  noEdit?(
                                    <CheckAccess permission="SL_OUTPUTTYPE_EDIT">
                                      <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/output-type/edit/${outputTypeEnt.id()}`)}>
                                        <i className="fa fa-edit mr-1" />Chỉnh sửa
                                      </Button>
                                    </CheckAccess>
                                  ):
                                  [
                                    <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                      <i className="fa fa-save mr-2" />Lưu
                                    </Button>,
                                    <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                      <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                    </Button>
                                  ]
                                }
                                <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/output-type')} className="btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-times-circle mr-1" />Đóng
                                </Button>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
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

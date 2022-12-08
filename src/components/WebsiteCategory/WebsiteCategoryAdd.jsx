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
import Select from 'react-select';
// Component(s)
import Loading from "../Common/Loading";
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)
import WebsiteCategoryModel from "../../models/WebsiteCategoryModel";
// Util(s)
import { mapDataOptions4Select } from '../../utils/html';
/** @var {Object} */
/**
 * @class WebsiteCategoryAdd
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16)
  })
}
export default class WebsiteCategoryAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._websiteCategoryModel = new WebsiteCategoryModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);
    // Init state
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      WebsiteCategoryOptions: [
        { label: "-- Chọn --", id: "", name: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      WebsiteCategoryParentOptions: [
        { label: "-- Chọn --", id: "", name: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      ProductCategoryOptions: [
        { label: "-- Chọn --", id: "", name: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      NewsCategoryOptions: [
        { label: "-- Chọn --", id: "", name: "-- Chọn --", value: "" },
      ],
      ManufacturerOptions: [
        { label: "-- Chọn --", id: "", name: "-- Chọn --", value: "" },
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

  formikValidationSchema = Yup.object().shape({
    category_name: Yup.string().required("Tên danh mục website là bắt buộc."),
    website_id: Yup.string().required("Website áp dụng là bắt buộc."),
    //cate_parent_id: Yup.string().required("Danh mục cha là bắt buộc."),
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {

    let { WebsiteCategoryEnt } = this.props;
    let values = Object.assign(
      {}, this._websiteCategoryModel.fillable(),
    );

    if (WebsiteCategoryEnt) {
      let categoryDataName = [];
      let newscategoryDataName = [];
      let manufacturenameDataName = [];
      if (WebsiteCategoryEnt.categoryname) {
        categoryDataName = WebsiteCategoryEnt.categoryname.map(function (obj) { return ({ "label": obj.category_name, "value": obj.product_category_id, "id": obj.product_category_id }) });
      }
      if (WebsiteCategoryEnt.newscategoryname) {
        newscategoryDataName = WebsiteCategoryEnt.newscategoryname.map(function (obj) { return ({ "label": obj.news_category_name, "value": obj.news_category_id, "id": obj.news_category_id }) });
      }
      if (WebsiteCategoryEnt.manufacturename) {
        manufacturenameDataName = WebsiteCategoryEnt.manufacturename.map(function (obj) { return ({ "label": obj.manufacture_name, "value": obj.manufacture_id, "id": obj.manufacture_id }) });
      }
      Object.assign(values, WebsiteCategoryEnt, {
        categoryname: categoryDataName,
        newscategoryname: newscategoryDataName,
        manufacturename: manufacturenameDataName
      });
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
    let bundle = {};
    let all = [
      //Website áp dụng
      this._websiteCategoryModel.getOptionsWebsite({ is_active: 1 })
        .then(data => { return (bundle['WebsiteCategoryOptions'] = mapDataOptions4Select(data)) }),
      //Danh mục cha
      this._websiteCategoryModel.getOptionsParent({ is_active: 1 })
        .then(data => { return (bundle['WebsiteCategoryParentOptions'] = mapDataOptions4Select(data)) }),
      //Danh mục loại sản phẩm
      this._websiteCategoryModel.getOptionsForListProductCategory({ is_active: 1 })
        .then(data => { return (bundle['ProductCategoryOptions'] = mapDataOptions4Select(data)) }),
      //Danh mục loại tin tức
      this._websiteCategoryModel.getOptionsForListNewsCategory(0, {})
        .then(data => { return (bundle['NewsCategoryOptions'] = mapDataOptions4Select(data)) }),
      this._websiteCategoryModel.getOptionsForListManufacturer({ is_active: 1 })
        .then(data => (bundle['ManufacturerOptions'] = mapDataOptions4Select(data))),
    ];

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

  /**
   * Goi API, lay toan bo data lien quan,...
   */

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    // window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikValidate(values) {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      (typeof values[prop] === "string") && (values[prop] = values[prop].trim());
    });
    //.end
  }

  handleFormikSubmit(values, formProps) {
    let { WebsiteCategoryEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting/*, resetForm*/ } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      website_id: ((1 * values.website_id) > 0 ? 1 * values.website_id : (1 * values.website_id.value || 0)),
      cate_parent_id: ((1 * values.cate_parent_id) > 0 ? 1 * values.cate_parent_id : (1 * values.cate_parent_id.value || 0)),
      list_product_category: values.categoryname != null ? values.categoryname.map(function (obj) { return ({ "product_category_id": obj.id || obj.value }) }).filter(function (hero) {
        return hero.product_category_id > 0;
      }) : [],
      list_news_category: values.newscategoryname != null ? values.newscategoryname.map(function (obj) { return ({ "news_category_id": obj.id || obj.value }) }).filter(function (hero) {
        return hero.news_category_id > 0;
      }) : [],
      list_manufacture: values.manufacturename != null ? values.manufacturename.map(function (obj) { return ({ "manufacture_id": obj.id || obj.value }) }).filter(function (hero) {
        return hero.manufacture_id > 0;
      }) : [],
    });
    let _websiteCategoryId = (WebsiteCategoryEnt && WebsiteCategoryEnt.web_category_id) || formData[this._websiteCategoryModel];
    let apiCall = _websiteCategoryId
      ? this._websiteCategoryModel.update(_websiteCategoryId, formData)
      : this._websiteCategoryModel.create(formData)
      ;
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = await this._websiteCategoryModel.read(data, {});
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }

        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/website-category');
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
        if (!WebsiteCategoryEnt && !willRedirect && !alerts.length) {
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

  handleChangeWebsite = (event) => {
    let { category_name_change, url_website_id } = this.state;
    url_website_id = 1 * event || undefined;
    url_website_id ?
      this._websiteCategoryModel
        .readWebsite(url_website_id)
        .then(data => {
          this.setState({ url_category_change: (data.url_category + (category_name_change ? '/' + category_name_change : "")) });
          this.setState({ url_website_id: url_website_id });
        }) :
      this.setState({ url_category_change: "" });
  }

  updateURLCategory = (item) => {
    let { category_name_change, url_website_id } = this.state;
    category_name_change = item.target.value ? this.ChangeAlias(item.target.value) : "";
    url_website_id = url_website_id ? 1 * url_website_id : undefined;
    url_website_id ?
      this._websiteCategoryModel
        .readWebsite(url_website_id)
        .then(data => {
          this.setState({ url_category_change: (data.url_category + (category_name_change ? '/' + category_name_change : "")) });
          this.setState({ category_name_change: category_name_change });
        }) :
      this.setState({ url_category_change: "" });
  }

  ChangeAlias = (val) => {
    var str = val;
    str = str.trim();
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, "-");
    str = str.replace(/[ ]/g, "-");
    str = str.trim();
    return str;
  }

  handleEnterSession(session, data, key, ref) {
    let { values, handleChange } = this.formikProps;
    let value = values[key] || [];
    let newsValue = data.find(d => ('' + d.label) === ('' + session));
    if (newsValue === undefined) {
      let item = { label: session, value: uuidv4() };
      value.push(item);
      handleChange({ target: { name: key, value } });
      ref.blur();
      ref.focus();
    }
  }
  render() {
    let { _id, ready, alerts, WebsiteCategoryOptions, WebsiteCategoryParentOptions, ProductCategoryOptions, NewsCategoryOptions, ManufacturerOptions } = this.state;
    let { WebsiteCategoryEnt, noEdit } = this.props;
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
                <b>{WebsiteCategoryEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} Danh mục website {WebsiteCategoryEnt ? WebsiteCategoryEnt.status_name : ''}</b>
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
                  // validate={this.handleFormikValidate}
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
                                <Label for="category_name" sm={3}>
                                  Tên danh mục {" "} <span className="font-weight-bold red-text"> * </span>
                                </Label>
                                <Col sm={9}>
                                  <Field name="category_name"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={(item) => this.updateURLCategory(item)}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                        maxLength={250}
                                      />
                                    )}
                                  />
                                  <ErrorMessage
                                    name="category_name" component={({ children }) => (<Alert color="danger" className="field-validation-error">{children}</Alert>)}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12} >
                              <FormGroup row>
                                <Label sm={3}>Danh mục cha</Label>
                                <Col sm={9}>
                                  <Field
                                    name="cate_parent_id"
                                    render={({ field /*, form*/ }) => {
                                      let defaultValue = WebsiteCategoryParentOptions.find(({ value }) => 1 * value === 1 * field.value);
                                      let placeholder = (WebsiteCategoryParentOptions[0] && WebsiteCategoryParentOptions[0].label) || "";
                                      return (
                                        <Select
                                          name={field.name}
                                          onChange={({ value }) => {
                                            value = value ? value : 0;
                                            field.onChange({
                                              target: { name: field.name, value }
                                            });
                                          }}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue || undefined}
                                          options={WebsiteCategoryParentOptions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  {/* <ErrorMessage name="cate_parent_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} /> */}
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12} >
                              <FormGroup row>
                                <Label for="website_id" sm={3}>
                                  Website áp dụng {" "} <span className="font-weight-bold red-text"> * </span>
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="website_id"
                                    render={({ field /*, form*/ }) => {
                                      let defaultValue = WebsiteCategoryOptions.find(({ value }) => 1 * value === 1 * field.value);
                                      let placeholder = (WebsiteCategoryOptions[0] && WebsiteCategoryOptions[0].label) || "";
                                      return (
                                        <Select
                                          name={field.name}
                                          onChange={({ value }) => {
                                            field.onChange({
                                              target: { name: field.name, value }
                                            });
                                            //this.handleChangeWebsite(value);
                                          }}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue || undefined}
                                          options={WebsiteCategoryOptions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="website_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="url_category" sm={3}>
                                  URL danh mục {" "} <span className="font-weight-bold red-text"> * </span>
                                </Label>
                                <Col sm={9}>
                                  <Field name="url_category"
                                    render={({ field }) => {
                                      return (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          value={this.ChangeAlias(values.category_name)}
                                          disabled={true}
                                        />
                                      )
                                    }}
                                  />
                                  <ErrorMessage
                                    name="url_category" component={({ children }) => (<Alert color="danger" className="field-validation-error">{children}</Alert>)}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12} >
                              <FormGroup row>
                                <Label for="categoryname" sm={3}>
                                  Danh mục sản phẩm
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="categoryname"
                                    render={({ field/*, form*/ }) => {
                                      let placeholder = (ProductCategoryOptions[0] && ProductCategoryOptions[0].label) || '';
                                      return (
                                        <Select
                                          isMulti
                                          id={field.name}
                                          name={field.name}
                                          ref={(ref) => { this.categoryname = ref }}
                                          onChange={(changeItem) => {
                                            field.onChange({
                                              target: { type: "select", name: field.name, value: changeItem }
                                            })
                                          }}
                                          onKeyDown={(event) => {
                                            const { target } = event
                                            if (event.keyCode === 13) {
                                              this.handleEnterSession(target.value, ProductCategoryOptions, "categoryname", this.categoryname)
                                            }
                                          }}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={field.value}
                                          options={ProductCategoryOptions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12} >
                              <FormGroup row>
                                <Label for="newscategoryname" sm={3}>
                                  Danh mục tin tức
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="newscategoryname"
                                    render={({ field/*, form*/ }) => {
                                      let placeholder = (NewsCategoryOptions[0] && NewsCategoryOptions[0].label) || '';
                                      return (
                                        <Select
                                          isMulti
                                          id={field.name}
                                          name={field.name}
                                          ref={(ref) => { this.newscategoryname = ref }}
                                          onChange={(changeItem) => {
                                            field.onChange({
                                              target: { type: "select", name: field.name, value: changeItem }
                                            })
                                          }}
                                          onKeyDown={(event) => {
                                            const { target } = event
                                            if (event.keyCode === 13) {
                                              this.handleEnterSession(target.value, NewsCategoryOptions, "newscategoryname", this.newscategoryname)
                                            }
                                          }}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={field.value}
                                          options={NewsCategoryOptions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12} >
                              <FormGroup row>
                                <Label for="manufacturename" sm={3}>
                                  Danh mục nhà sản xuất
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="manufacturename"
                                    render={({ field/*, form*/ }) => {
                                      let placeholder = (ManufacturerOptions[0] && ManufacturerOptions[0].label) || '';
                                      return (
                                        <Select
                                          isMulti
                                          id={field.name}
                                          name={field.name}
                                          ref={(ref) => { this.manufacturename = ref }}
                                          onChange={(changeItem) => {
                                            field.onChange({
                                              target: { type: "select", name: field.name, value: changeItem }
                                            })
                                          }}
                                          onKeyDown={(event) => {
                                            const { target } = event
                                            if (event.keyCode === 13) {
                                              this.handleEnterSession(target.value, ManufacturerOptions, "manufacturename", this.manufacturename)
                                            }
                                          }}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={field.value}
                                          options={ManufacturerOptions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
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
                                      maxLength={500}
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
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="" sm={3}></Label>
                                <Col sm={9}>
                                  <div className="d-flex button-list-default justify-content-end">
                                    {
                                      noEdit ? (
                                        <CheckAccess permission="CMS_WEBSITECATE_EDIT">
                                          <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/website-category/edit/${WebsiteCategoryEnt.web_category_id}`)}> <i className="fa fa-edit mr-1" /> Chỉnh sửa </Button>
                                        </CheckAccess>
                                      ) :
                                        [
                                          <CheckAccess permission={[
                                            "CMS_WEBSITECATE_EDIT",
                                            "CMS_WEBSITECATE_ADD",
                                          ]} any key={1}
                                          >
                                            <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm"><i className="fa fa-save mr-2" /> Lưu </Button>
                                          </CheckAccess>,
                                          <CheckAccess permission={[
                                            "CMS_WEBSITECATE_EDIT",
                                            "CMS_WEBSITECATE_ADD",
                                          ]} any key={2}
                                          >
                                            <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2"><i className="fa fa-save mr-2" />Lưu &amp; Đóng</Button>
                                          </CheckAccess>
                                        ]
                                    }
                                    <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/website-category')} className="btn-block-sm mt-md-0 mt-sm-2"> <i className="fa fa-times-circle mr-1" />Đóng </Button>
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

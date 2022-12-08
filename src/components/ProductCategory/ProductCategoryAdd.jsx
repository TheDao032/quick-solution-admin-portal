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
import Select, { components } from 'react-select';
import {DropzoneArea} from 'material-ui-dropzone'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import AttributeList from './AttributeList';

// Model(s)
import ProductCategoryModel from "../../models/ProductCategoryModel";
import CompanyModel from '../../models/CompanyModel';
import FunctionModel from '../../models/FunctionModel';

// Util(s)
import { mapDataOptions4Select, stringToAlias, groupByParams } from '../../utils/html';

/**
 * @class ProductCategoryAdd
 */
export default class ProductCategoryAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._productCategoryModel = new ProductCategoryModel();
    this._companyModel = new CompanyModel();
    this._functionModel = new FunctionModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      parents: [
        { label: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      companies: [
        { label: "-- Công ty --", id: "" },
      ],
      /** @var {Array} */
      functions: [
        { label: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      attributes:{},
      /** @var {Array} */
      attributesRender:[],
      /** @var {Boolean} */
      toggleAttribute: false,
      /** @var {Boolean} */
      clearImage: false,
      /** @var {String} */
      urlImageEdit: "",
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    this.props.AttributeEnts && this.handleAdd(this.props.AttributeEnts);
    //.end
  }

  formikValidationSchema = Yup.object().shape({
    category_name: Yup.string().required("Tên danh mục là bắt buộc."),
    name_show_web: Yup.string().required("Tên hiển thị web là bắt buộc."),
    seo_name:Yup.string().required("Tên SEO là bắt buộc."),
    company_id:Yup.string().required("Công ty áp dụng là bắt buộc."),
    add_function_id:Yup.string().required("Quyền thêm là bắt buộc."),
    edit_function_id:Yup.string().required("Quyền sửa là bắt buộc."),
    delete_function_id:Yup.string().required("Quyền xóa là bắt buộc."),
    view_function_id:Yup.string().required("Quyền xem là bắt buộc."),
    icon_url:Yup.string().required("Hình ảnh danh mục là bắt buộc."),
    list_attribute: Yup.string().required("Thuộc tính là bắt buộc."),
    // url_category: Yup.string().required("URL Danh mục là bắt buộc."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
  }

  /** @var {String} */
  _btnType = null;

  getInitialValues() {

    let { ProductCategoryEnt } = this.props;
    let values = Object.assign(
      {}, this._productCategoryModel.fillable(),
    );

    if (ProductCategoryEnt) {
      Object.assign(values, ProductCategoryEnt);
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
    let functions = (data||[]).map(_item => {
      let label = _item.function_name;
      let value = _item.function_alias;
      return({label, value});
    }); 
    return functions;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let bundle = {};
    let all = [
      // @TODO
      this._productCategoryModel.getOptions({ is_active: 1 })
        .then(data => {console.log('data', data); return (bundle['parents'] = mapDataOptions4Select(data))} ),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
      this._functionModel.getOptionsFull({ is_active: 1, is_delete:0 })
        .then(data => (bundle['functions'] = this.mapFunction(data))),
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

    let { ProductCategoryEnt } = this.props;
    if(ProductCategoryEnt && ProductCategoryEnt.icon_url){
      bundle["urlImageEdit"] = ProductCategoryEnt.icon_url;
    }

    return bundle;
  }

  handleAdd = (attributes) => {
    
    this.setState({
      toggleAttribute: false,
      attributesRender: Object.entries(attributes),
      attributes,
    });

    if(this.formikProps){
      let { values, setValues } = this.formikProps;
      // attributes
      setValues(Object.assign(values, { "list_attribute": attributes }));
    }
  }

  toggleAttribute = () => this.setState({toggleAttribute: !this.state.toggleAttribute})

  handleRemoveAttribute = (item, event) => {
    let attributes = Object.assign({},this.state.attributes);
    delete attributes[item[0]];
    this.setState({
      attributesRender: Object.entries(attributes),
      attributes,
    })

    if(this.formikProps && Object.keys(attributes).length === 0){
      let { values, setValues } = this.formikProps;
      setValues(Object.assign(values, { "list_attribute": "" }));
    }
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;

    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { ProductCategoryEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = []; 

    // get list_attribute
    let list_attribute = [];
    for( var key in this.state.attributes){
      list_attribute.push({ product_attribute_id: key }); 
    }

    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_show_web: 1 * values.is_show_web,
      list_attribute,
    });

    let productCategoryID = (ProductCategoryEnt && ProductCategoryEnt.product_category_id) || formData[this._productCategoryModel];
    
    let apiCall = productCategoryID
      ? this._productCategoryModel.edit(productCategoryID, formData)
      : this._productCategoryModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/product-category');
        }

        if (this._btnType === 'save' && !productCategoryID) {
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
        if (!ProductCategoryEnt && !willRedirect && !alerts.length) {
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
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ 
        ...bundle,
        ready: true,
        attributes: {},
        attributesRender:[],
        clearImage:false,
      });
    })();
    //.end
  }

  onDropImage(files, field) {
    const reader = new FileReader();
    reader.readAsDataURL(files);
    reader.onload = (event) => {
      field.onChange({
        target: { type: "text", name: field.name, value: event.target.result }
      })
    };
  }

  onBlueUrl(event, field) {
    let alias = stringToAlias(event.target.value);
    field.onChange({ target: { type: "text", name: field.name, value: alias }})
  }

  onBlurName(event, field){
    let alias = stringToAlias(event.target.value);
    field.onChange({ target: { type: "text", name: "url_category", value: alias }})
  }

  OnChangeParent(item, field){
    
    // update field url
    // let alias = stringToAlias(item.label);
    // field.onChange({ target: { type: "text", name: "url_category", value: alias }})

    // update field parent_id
    field.onChange({
      target: { type: "select", name: field.name, value:item.value }
    })
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      parents,
      companies,
      attributesRender,
      functions
    } = this.state;
    
    let { ProductCategoryEnt, noEdit } = this.props;
    let initialValues = this.getInitialValues();

    // Ready?
    if (!ready) {
      return <Loading />;
    }
    
    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12} hidden={this.state.toggleAttribute}>
            <Card >
              <CardHeader>
                <b>{ProductCategoryEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} danh mục {ProductCategoryEnt ? ProductCategoryEnt.product_category_name : ''}</b>
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
                  // validate={this.handleFormikValidate}
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    handleSubmit,
                    handleReset,
                    isSubmitting,
                  } = (this.formikProps = window._formikProps = formikProps);
                  console.log('this.formikProps', this.formikProps);
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin danh mục</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={8}>
                          <Row >
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="category_name" sm={4}>
                                  Tên danh mục <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="category_name"
                                    render={({ field }) => <Input
                                      {...field}
                                      onBlur={(event) => this.onBlurName(event, field)}
                                      type="text"
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="category_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="name_show_web" sm={4}>
                                  Tên hiển thị web <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="name_show_web"
                                    render={({ field }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="name_show_web" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="is_show_web" sm={4} />
                                <Col sm={8}>
                                  <Field
                                    name="is_show_web"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_show_web}
                                      type="switch"
                                      id={field.name}
                                      label="Hiển thị web"
                                      disabled={noEdit}
                                    />}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="seo_name" sm={4}>
                                  Tên SEO <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="seo_name"
                                    render={({ field }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="seo_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12} hidden={true}>
                              <FormGroup row>
                                <Label for="url" sm={4}>
                                  URL Danh mục <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="url_category"
                                    render={({ field }) => <Input
                                      {...field}
                                      onChange={(data) => this.onBlueUrl(data, field) }
                                      type="url"
                                      placeholder=""
                                      disabled={noEdit}
                                      
                                    />}
                                  />
                                  <ErrorMessage name="url_category" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={4}>Thuộc danh mục</Label>
                                  <Col sm={8}>
                                    <Field
                                      name="parent_id"
                                      render={({ field/*, form*/ }) => {
                                        let defaultValue = parents.find(({ value }) => (1 * value) === (1 * field.value)) || null;
                                        let placeholder = (parents[0] && parents[0].label) || '';
																				let groupedOptions = (parents.length > 1 && parents[0].id != '') ? groupByParams(parents, 'parent_id') : parents

																				const Option = (props) => {
																					const {
																						children,
																						innerRef,
																						innerProps,
																					} = props;
																					return (
																						<div
																							ref={innerRef}
																							className={`Select-Sub-Item ${props.data.is_child_options ? 'Select-Sub-Item__Inner' : ''}`}
																							{...innerProps}
																						>
																							{children}
																						</div>
																					)
                                        };

                                        return (
                                          <Select
                                            name={field.name}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            options={groupedOptions}
                                            value={defaultValue}
                                            isDisabled={noEdit}
                                            onChange={(value) => this.OnChangeParent(value, field) } 
                                            components={{ Option }}
                                          />
                                        );
                                      }}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={4}>
                                    Công ty <span className="font-weight-bold red-text">*</span> 
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="company_id"
                                      render={({ field/*, form*/ }) => {
                                        let defaultValue = companies.find(({ value }) => (1 * value) === (1 * field.value)) || null;
                                        let placeholder = (companies[0] && companies[0].label) || '';
                                        return (
                                          <Select
                                            name={field.name}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            value={defaultValue}
                                            options={companies}
                                            isDisabled={noEdit}
                                            onChange={ item => field.onChange({
                                              target: { type: "select", name: "company_id", value:item.value }
                                            })}
                                          />
                                        );
                                      }}
                                    />
                                  <ErrorMessage name="company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="description" sm={4}>Mô tả</Label>
                                    <Col sm={8}>
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
                        </Col>

                        <Col xs={12} sm={4}>
                          {
                            !this.state.clearImage &&
                            <FormGroup>
                              <Field
                                name="icon_url"
                                render={({ field }) => {
                                 
                                // render image edit
                                if(this.state.urlImageEdit){
                                  return<div className="tl-render-image">
                                    <img src={this.state.urlImageEdit} alt="images"/>
                                    {
                                      !noEdit ? 
                                      <button onClick={() => this.setState({urlImageEdit: ""})} >
                                        <i className="fa fa-trash" aria-hidden="true"></i>
                                      </button> : null
                                    }  
                                  </div>
                                }

                                return<div className="tl-drop-image">
                                  <DropzoneArea
                                    {...field}
                                    acceptedFiles={['image/*']}
                                    filesLimit={1}
                                    dropzoneText=""
                                    disabled={noEdit}
                                    onDrop={(files) => this.onDropImage(files, field)}
                                    onDelete={ () => field.onChange({
                                      target: { type: "text", name: field.name, value: "" }
                                    }) }
                                  >
                                  </DropzoneArea>
                                </div>}}
                              />
                              <ErrorMessage name="icon_url" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </FormGroup>
                          }
                        </Col>
                      </Row>

                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thuộc tính sản phẩm theo danh mục</b>
                        </Col>
                      </Row>

                      <Row>
                        {
                          !noEdit &&
                          <Col xs={12} className="flex justify-content-end">
                            <CheckAccess permission="PRO_PRODUCTATTRIBUTE_VIEW"
                              key={3}
                            >
                              <Button color="primary" onClick={() => { this.setState({ toggleAttribute:true }) } }>
                                Chọn thuộc tính
                              </Button>
                            </CheckAccess>
                          </Col>
                        }

                        <Col xs={12} className="mt-2">
                          <Col xs={12}>
                            <FormGroup row>
                              <Table size="sm" bordered striped >
                                <thead>
                                  <tr>
                                    <th style={{ minWidth: '130px' }}>Tên thuộc tính</th>
                                    <th style={{ minWidth: '130px' }}>Đơn vị tính</th>
                                    <th style={{ width: '1%' }}>Xóa</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attributesRender.map((item, idx) => {
                                    let {
                                      attribute_name,
                                      unit_name,
                                    } = item[1];
                                    //
                                    return item ? ([
                                      <tr key={`campaign_rlevel-0${idx}`}>
                                        <td className="align-middle">
                                          <Label>{ attribute_name }</Label>
                                        </td>
                                        <td className="align-middle">
                                          <Label>{ unit_name }</Label>
                                        </td>
                                        <td className="text-center align-middle">
                                          <Button color="danger" disabled={noEdit} size={"sm"} onClick={(event) => this.handleRemoveAttribute(item, event)}>
                                            <i className="fa fa-minus-circle" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ]) : null;
                                  })}
                                </tbody>
                              </Table>
                              <div style={{ width:"100%" }} >
                                <ErrorMessage name="list_attribute" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </div>
                            </FormGroup>
                          </Col>
                        </Col>
                      </Row>

                      <Row className="mb-4">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin quyền</b>
                        </Col>
                      </Row>

                      <Row>
                        <Col sm={8}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={4}>Quyền Thêm <span className="font-weight-bold red-text">*</span></Label>
                                  <Col sm={8}>
                                    <Field
                                      name="add_function_id"
                                      render={({ field/*, form*/ }) => {
                                        let defaultValue = functions.find( value => value.value === field.value ) || null;
                                        let placeholder = (functions[0] && functions[0].label) || '';
                                        return (
                                          <Select
                                            name={field.name}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            options={functions}
                                            value={defaultValue}
                                            isDisabled={noEdit}
                                            onChange={ item => field.onChange({
                                              target: { type: "select", name: "add_function_id", value: item.value }
                                            })}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="add_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={4}>Quyền Sửa <span className="font-weight-bold red-text">*</span></Label>
                                  <Col sm={8}>
                                    <Field
                                      name="edit_function_id"
                                      render={({ field/*, form*/ }) => {
                                        let defaultValue = functions.find(( value ) => value.value === field.value) || null;
                                        let placeholder = (functions[0] && functions[0].label) || '';
                                        return (
                                          <Select
                                            name={field.name}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            options={functions}
                                            value={defaultValue}
                                            isDisabled={noEdit}
                                            onChange={ item => field.onChange({
                                              target: { type: "select", name: "edit_function_id", value: item.value }
                                            })}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="edit_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={4}>Quyền Xóa <span className="font-weight-bold red-text">*</span></Label>
                                  <Col sm={8}>
                                    <Field
                                      name="delete_function_id"
                                      render={({ field/*, form*/ }) => {
                                        let defaultValue = functions.find(( value ) => value.value === field.value) || null;
                                        let placeholder = (functions[0] && functions[0].label) || '';
                                        return (
                                          <Select
                                            name={field.name}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            options={functions}
                                            value={defaultValue}
                                            isDisabled={noEdit}
                                            onChange={ item => field.onChange({
                                              target: { type: "select", name: "delete_function_id", value: item.value }
                                            })}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="delete_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={4}>Quyền Xem <span className="font-weight-bold red-text">*</span></Label>
                                  <Col sm={8}>
                                    <Field
                                      name="view_function_id"
                                      render={({ field/*, form*/ }) => {
                                        let defaultValue = functions.find(( value ) => value.value === field.value) || null;
                                        let placeholder = (functions[0] && functions[0].label) || '';
                                        return (
                                          <Select
                                            name={field.name}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            options={functions}
                                            value={defaultValue}
                                            isDisabled={noEdit}
                                            onChange={ item => field.onChange({
                                              target: { type: "select", name: "view_function_id", value: item.value }
                                            })}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="view_function_id" component={({ children }) => <Alert   color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                          </Row>   
                        </Col>
                      </Row>

                      <Row>
                        <Col sm={8}>
                          <FormGroup row>
                            <Label for="is_active" sm={4}></Label>
                            <Col sm={8}>
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
                        <Col sm={6}></Col>
                      </Row>
                      <Row>
                        <Col sm={12} className="text-right">
                          {
                            noEdit?(
                              <CheckAccess permission="MD_PRODUCTCATEGORY_EDIT">
                                <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/product-category/edit/${ProductCategoryEnt.product_category_id}`)}>
                                  <i className="fa fa-edit mr-1" />Chỉnh sửa
                                </Button>
                              </CheckAccess>
                            ):
                            [
                              <CheckAccess permission={[
                                  "MD_PRODUCTCATEGORY_EDIT",
                                  "MD_PRODUCTCATEGORY_ADD",
                                ]} any key={1}
                              >
                                <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                  <i className="fa fa-save mr-2" />Lưu
                                </Button>
                              </CheckAccess>,
                              <CheckAccess permission={[
                                  "MD_PRODUCTCATEGORY_EDIT",
                                  "MD_PRODUCTCATEGORY_ADD",
                                ]} any key={2}
                              >
                                <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                </Button>
                              </CheckAccess>
                            ]
                          }
                          <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/product-category')} className="btn-block-sm mt-md-0 mt-sm-2">
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
        {
          this.state.toggleAttribute ? 
          <div className="modal-view">
            <div onClick={this.toggleAttribute}></div>
            <Col xs={12} style={{height:'90%'}} >
              <AttributeList
                handleAdd={this.handleAdd}
                attributesSelect={this.state.attributes}
                toggleAttribute={this.toggleAttribute}
              />
            </Col>
          </div>
          : null
        }
      </div>
    );
  }
}

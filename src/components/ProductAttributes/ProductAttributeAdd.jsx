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
  // InputGroupText,
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

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';
// import * as utils from '../../utils';

// Model(s)
import ProductAttributeModel from "../../models/ProductAttributeModel";
import TaskWorkflowModel from "../../models/TaskWorkflowModel";
import UnitModel from "../../models/UnitModel";

/**
 * @class ProductAttributeAdd
 */
export default class ProductAttributeAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._productAttributeModel = new ProductAttributeModel();
    this._taskWorkflowModel = new TaskWorkflowModel();
    this._unitModel = new UnitModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    // +++
    // let { productAttributeEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Array} */
      units: [
        { value: "", label: "-- Chọn --" }
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
    let { productAttributeEnt } = this.props;
    // let { units } = this.state;
    let values = Object.assign(
      this._productAttributeModel.fillable(),
      productAttributeEnt || {}
    );
    // if (productAttributeEnt) {}
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
    // let { productAttributeEnt } = this.props;
    let bundle = {};
    let all = [
      this._unitModel.getOptions()
        .then(data => (bundle['units'] = mapDataOptions4Select(data))),
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
        data = [stateValue[0]].concat(data).filter(_i => !!_i);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    attribute_name: Yup.string().trim()
      // .min(2, 'Too Short!')
      // .max(70, 'Too Long!')
      .required("Tên thuộc tính sản phẩm là bắt buộc."),
    is_active: Yup.string().trim()
      .required("Kích hoạt là bắt buộc."),
    // unit_id: Yup.string()
    //  .required("Đơn vị tính là bắt buộc."),
    // attribute_values: Yup.array()
    // .required("Giá trị thuộc tính là bắt buộc."),
  });

  handleFormikSubmitSucceedCTA() {
    //
    setTimeout(() => {
      this.setState({ willShowCampaignTypeAdd: false });
      // Refresh dropdownlist
      this._getBundleItemCampaignTypes()
        .then(campaignTypes => this.setState({ campaignTypes }))
      ;
    });
    // Prevent default
    return false;
  }

  handleAddAttributeValues() {
    let attribute_values = (this._refAttrValuesInput.value || "").trim();
    if (attribute_values) {
      let { values, handleChange } = this.formikProps;
      let { attribute_values: value } = values;
      value.push({ attribute_values });
      handleChange({ target: { name: "attribute_values", value } });
      this._refAttrValuesInput.value = "";
    }
  }

  handleRemoveAttributeValue(item, idx) {
    let { values, handleChange } = this.formikProps;
    let { attribute_values: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    value.splice(foundIdx, 1);
    handleChange({ target: { name: "attribute_values", value }});
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
    let { productAttributeEnt, handleFormikSubmitSucceed } = this.props;
    // let {} = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      // unit_id: values.unit_id ? values.unit_id : null
    });
    // console.log('formData: ', formData);
    //
    let productAttributeId = (productAttributeEnt && productAttributeEnt.id())
      || formData[this._productAttributeModel.primaryKey]
    ;
    let apiCall = productAttributeId
      ? this._productAttributeModel.update(productAttributeId, formData)
      : this._productAttributeModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = Object.assign({ product_attribute_id: data }, formData);
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/product-attributes/');
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
        if (!productAttributeEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { productAttributeEnt } = this.props;
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
    return errors;
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      units,
    } = this.state;
    let { noEdit } = this.props;
    let { productAttributeEnt } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{productAttributeEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} thuộc tính sản phẩm {productAttributeEnt ? productAttributeEnt.attribute_name : ''}</b>
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
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="attribute_name" sm={3}>
                              Tên thuộc tính<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="attribute_name"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="attribute_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} className="z-index-222">
                          <FormGroup row>
                            <Label for="unit_id" sm={3}>
                              Đơn vị tính
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="unit_id"
                                render={({ field/*, form*/ }) => {
                                  let defaultValue = units.find(({ value }) => (1 * value) === (1 * field.value));
                                  let placeholder = (units[0] && units[0].label) || '';
                                  return (
                                    <Select
                                      name={field.name}
                                      onChange={({ value }) => field.onChange({
                                        target: { name: field.name, value }
                                      })}
                                      isSearchable={true}
                                      placeholder={placeholder}
                                      defaultValue={defaultValue}
                                      options={units}
                                      isDisabled={noEdit}
                                    />
                                  );
                                }}
                              />
                              <ErrorMessage name="unit_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="attribute_values_input" sm={3}>
                              Giá trị
                            </Label>
                            <Col sm={9}>
                              <InputGroup>
                                <Input
                                  innerRef={ref => (this._refAttrValuesInput = ref)}
                                  onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}
                                  defaultValue=""
                                  type="text"
                                  disabled={noEdit}
                                />
                                <CheckAccess permission="PRO_ATTRIBUTEVALUES_ADD">
                                  <InputGroupAddon addonType="append">
                                    <Button
                                      onClick={this.handleAddAttributeValues.bind(this)}
                                      disabled={noEdit}
                                    >
                                      <i className="fa fa-plus" /> Thêm
                                    </Button>
                                  </InputGroupAddon>
                                </CheckAccess>
                              </InputGroup>
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row id="attribute_values">
                            <Label sm={3}></Label>
                            <Col sm={9}>
                              <Table size="sm" bordered striped hover responsive>
                                <thead>
                                  <tr>
                                    <th style={{ width: '50px' }}>STT</th>
                                    <th style={{}}>Giá trị</th>
                                    <th style={{ width: '1%' }}>Xóa</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {values.attribute_values.map((item, idx) => {
                                    return item ? (
                                      <tr key={`attribute_value-${idx}`}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td className="">
                                          {item.name || item.attribute_values}
                                        </td>
                                        <td className="text-center">
                                          {noEdit ? null : <Button color="danger" size={"sm"} onClick={(event) => this.handleRemoveAttributeValue(item, idx)}>
                                            <i className="fa fa-minus-circle" />
                                          </Button>}
                                        </td>
                                      </tr>
                                    ) : null;
                                  })}
                                  {!values.attribute_values.length ? (
                                    <tr><td colSpan={100}>&nbsp;</td></tr>
                                  ) : null}
                                </tbody>
                              </Table>
                              <Col sm={12}>
                                <ErrorMessage name="attribute_values" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="attribute_description" sm={3}>
                              Mô tả
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="attribute_description"
                                render={({ field }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="textarea"
                                  id={field.name}
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="attribute_description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="is_active" sm={3}></Label>
                            <Col sm={9}>
                              <Field
                                name="is_active"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  id={field.name}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_active}
                                  type="switch"
                                  label="Kích hoạt?"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12} className="mt-2">
                          <Row>
                            <Col sm={12} className="text-right">
                              {noEdit ? (
                                <CheckAccess permission="PRO_PRODUCTATTRIBUTE_EDIT">
                                  <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/product-attributes/edit/${productAttributeEnt && productAttributeEnt.id()}`)}>
                                    <i className="fa fa-edit mr-1" />Chỉnh sửa
                                  </Button>
                                </CheckAccess>
                              ) : [
                                (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                  <i className="fa fa-save mr-2" />Lưu
                                </Button> : null,
                                (false !== this.props.handleActionSaveAndClose) ? <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                </Button> : null
                                ]
                              }
                              <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr('/product-attributes'))} className="btn-block-sm mt-md-0 mt-sm-2">
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

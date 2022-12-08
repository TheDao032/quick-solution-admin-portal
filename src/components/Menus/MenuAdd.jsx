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
  // FormText,
  // Media,
  // InputGroupAddon,
  // InputGroupText,
  // InputGroup
} from "reactstrap";
import Select from "react-select";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Util(s)
// import { readFileAsBase64 } from '../../utils/html';
// Model(s)
import MenuModel from "../../models/MenuModel";
import FunctionModel from "../../models/FunctionModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class MenuAdd
 */
export default class MenuAdd extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._menuModel = new MenuModel();
    this._functionModel = new FunctionModel();
   
    // Bind method(s)
    // this.handleMenuIconChange = this.handleMenuIconChange.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);
    // Init state
    // +++
    // let { menuEnt } = props;
    // let { icon_path } = menuEnt || {};
    // +++
    this.state = {
      /** @var {Array} */
      alerts: [],
      /** @var {Object} */
      initialValues: this.getInitialValues(),
      /** @var {String|null} */
      // iconBase64: icon_path || null,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      parents: [
        { name: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      functions: [
        { name: "-- Chọn --", id: "" },
      ],
    };
  }

  componentDidMount() {
    // Get bundle data
    (async () => {
      let bundle = await this._getBundleData();
      let {
        parents = [],
        functions = []
      } = this.state;
      //
      parents = functions.concat(bundle.parents || []);
      functions = functions.concat(bundle.functions || []);
      // ...
      this.setState({
        ready: true,
        parents,
        functions
      });
    })();
    //.end
  }

  /**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */module
  async _getBundleData() {
    let { menuEnt } = this.props;
    let bundle = {};
    let all = [
      this._menuModel.getOptions({
        _api: {
          include_id: [menuEnt && menuEnt.parent_id],
          exclude_id: [menuEnt && menuEnt.id()],
        },
        // parentId: "",
      })
        .then(data => (bundle['parents'] = data)),
      this._functionModel.getOptions({ is_active: 1 })
        .then(data => (bundle['functions'] = data)),
    ];
    await Promise.all(all);
    // console.log('bundle: ', bundle);
    return bundle;
  }

  /**
   * 
   * @return {Object}
   */
  getInitialValues() {
    let  { menuEnt } = this.props;
    let values = Object.assign({}, this._menuModel.fillable(), {});
    if (menuEnt) {
      Object.assign(values, menuEnt);
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

  formikValidationSchema = Yup.object().shape({
    menu_name: Yup.string()
      .required("Tên menu là bắt buộc."),
    order_index: Yup.number()
      .min(0, "Thứ tự  bắt buộc lớn hơn hoặc bằng 0")
      .required("Thứ tự là bắt buộc và lớn hơn hoặc bằng 0"),
  });

  handleFormikValidate(values) {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      (typeof values[prop] === "string") && (values[prop] = values[prop].trim());
    });
    //.end
  }
  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType, { submitForm }) {
    this._btnType = btnType;
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikSubmit(values, fromProps) {
    console.log('handleFormikSubmit')
    let { menuEnt } = this.props;
    // let { iconBase64 } = this.state;
    let { setSubmitting, resetForm } = fromProps;
    let willRedirect = false;
    let alerts = [];
    // 
    // let {} = values;
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_system: 1 * values.is_system,
      is_business: 1 * values.is_business,
      is_can_open_multi_windows: 1 * values.is_can_open_multi_windows,
      // icon_path: iconBase64,
    });
    // console.log('formData: ', formData);
    //
    let apiCall = menuEnt
      ? this._menuModel.update(menuEnt.id(), formData)
      : this._menuModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/menus');
        }
        // Reset form (only when add new)
        if (!menuEnt) {
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
        !willRedirect && this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  render() {
    let {
      ready,
      alerts,
      initialValues,
      // iconBase64,
      parents,
      functions,
      // actives,
      // systems,
      // businessOpts,
      // multiWindowsOpts
    } = this.state;
    let { menuEnt, noEdit } = this.props;
    console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{menuEnt ? 'Chỉnh sửa' : 'Thêm mới'}</b>
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
                  onSubmit={this.handleFormikSubmit}
                >{({
                  values, errors, status,
                  // touched, handleChange, handleBlur,
                  submitForm, resetForm, handleSubmit,
                  handleReset, isSubmitting,
                  /* and other goodies */
                }) => (
                  <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                    <Row>
                      <Col xs={12}>
                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="menu_name" sm={3}>
                                Tên menu<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="menu_name"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    name="menu_name"
                                    id="menu_name"
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                  <ErrorMessage name="menu_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>                          
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="parent_id" sm={3}>
                                Menu cha
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="parent_id"
                                  render={({ field/*, form*/ }) => {
                                    let options = parents.map(({ name: label, id: value }) => ({ value, label }));
                                    let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (parents[0] && parents[0].name) || '';
                                    return (
                                      <Select
                                        id="parent_id"
                                        name="parent_id"
                                        onChange={item => field.onChange({
                                          target: {
                                            type: "select",
                                            name: "parent_id",
                                            value: item.value,
                                          }
                                        })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={defaultValue}
                                        options={options}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                              </Col>
                            </FormGroup>
                            <ErrorMessage name="parent_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="function_id" sm={3}>
                                Quyền
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="function_id"
                                  render={({ field/*, form*/ }) => {
                                    let options = functions.map(({ name: label, id: value }) => ({ value, label }));
                                    let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (functions[0] && functions[0].name) || '';
                                    return (
                                      <Select
                                        id="function_id"
                                        name="function_id"
                                        onChange={item => field.onChange({
                                          target: {
                                            type: "select",
                                            name: "function_id",
                                            value: item.value,
                                          }
                                        })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={defaultValue}
                                        options={options}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                              </Col>
                            </FormGroup>
                            <ErrorMessage name="function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="icon_path" sm={3}>
                                Icon
                              </Label>
                              <Col sm={9}>
                                <Row>
                                  <Col xs={12} sm={8}>
                                    <Field
                                      name="icon_path"
                                      render={({ field /* _form */ }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        id="icon_path"
                                        disabled={noEdit}
                                      />}
                                    />
                                  </Col>
                                  <Col xs={12} sm={4}>
                                    <div className="text-left py-2">
                                      <a target="_blank" rel="noopener noreferrer" href="https://coreui.io/react/demo/#/icons/font-awesome">
                                        Xem danh sách icons hỗ trợ...
                                      </a>
                                    </div>
                                  </Col>
                                  <Col xs={12}>
                                    <b>Lưu ý:</b> nếu dùng class icons "Font Awesome" thì thêm prefix <b>"fa fa-"</b> (vd: <b>"fa fa-address-book"</b>).
                                  </Col>
                                </Row>
                              </Col>
                            </FormGroup>
                            <ErrorMessage name="icon_path" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="link_menu" sm={3}>
                                Link
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="link_menu"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    name="link_menu"
                                    id="link_menu"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </FormGroup>
                            <ErrorMessage name="link_menu" component={({ children }) => <Alert color="danger">{children}</Alert>} />
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="order_index" sm={3}>
                                Thứ tự
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="order_index"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="number"
                                    name="order_index"
                                    id="order_index"
                                    className="text-right"
                                    disabled={noEdit}
                                    min={0}
                                  />}
                                />
                                <ErrorMessage name="order_index" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                            
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="is_active" sm={3}></Label>
                              <Col sm={4}>
                                <Field
                                  name="is_active"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_active}
                                    type="switch"
                                    id="is_active"
                                    label="Kích hoạt?"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                              <Col sm={5}>
                                <Field
                                  name="is_system"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_system}
                                    type="switch"
                                    id="is_system"
                                    label="Hệ thống?"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="is_business" sm={3}></Label>
                              <Col sm={4}>
                                <Field
                                  name="is_business"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_business}
                                    type="switch"
                                    id="is_business"
                                    label="Business?"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                              <Col sm={4}>
                                <Field
                                  name="is_can_open_multi_windows"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_can_open_multi_windows}
                                    type="switch"
                                    id="is_can_open_multi_windows"
                                    label="Mở nhiều cửa sổ?"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="description" sm={3}>
                                Mô tả
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="description"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="textarea"
                                    name="description"
                                    id="description"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </FormGroup>
                            <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={12} className="text-right">
                            {
                              noEdit?(
                                <CheckAccess permission="SYS_MENU_EDIT">
                                  <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/menus/edit/${menuEnt.menu_id}`)}
                                    disabled={(!userAuth._isAdministrator() && menuEnt.is_system !== 0)}
                                  >
                                    <i className="fa fa-edit mr-1" />Chỉnh sửa
                                  </Button>
                                </CheckAccess>
                              ):
                              [
                                <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={(event) => this.handleSubmit('save', { submitForm, resetForm, event })} className="mr-2 btn-block-sm">
                                  <i className="fa fa-save mr-2" />Lưu
                                </Button>,
                                <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={(event) => this.handleSubmit('save_n_close', { submitForm, resetForm, event })} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                </Button>
                              ]
                            }
                            <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/menus')} className="btn-block-sm mt-md-0 mt-sm-2">
                              <i className="fa fa-times-circle mr-1" />Đóng
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Form>
                )}</Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

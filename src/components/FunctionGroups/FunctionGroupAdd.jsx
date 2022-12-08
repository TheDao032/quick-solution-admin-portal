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
  Table
} from "reactstrap";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Util(s)
// import { readFileAsBase64 } from '../../utils/html';

// Model(s)
import FunctionGroupModel from "../../models/FunctionGroupModel";
import FunctionModel from "../../models/FunctionModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class FunctionGroupAdd
 */
export default class FunctionGroupAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._functionGroupModel = new FunctionGroupModel();
    this._functionModel = new FunctionModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleChangeFunction = this.handleChangeFunction.bind(this);

    // Init state
    // +++
    // let { funcGroupEnt } = props;
    // +++
    this.state = {
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      functions: [],
      /** @var {Number} */
      order_index: 0,
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
    let  { funcGroupEnt } = this.props;
    let values = Object.assign({}, this._functionGroupModel.fillable(), {});
    if (funcGroupEnt) {
      Object.assign(values, funcGroupEnt);
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
    let { funcGroupEnt } = this.props;
    let bundle = {};
    let all = [
      this._functionModel.getOptionsFull({
          is_active: 1,
          function_group_id: (funcGroupEnt && funcGroupEnt.id()) || undefined
        })
        .then(data => (bundle['functions'] = data)),
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
    function_group_name: Yup.string()
      .required("Tên nhóm quyền là bắt buộc."),
    //order_index: Yup.string().matches(/^[1-9][0-9]*/, 'Must be 5 or 9 digits')
    order_index: Yup.number().min(0, "Thứ tự  bắt buộc lớn hơn hoặc bằng 0")
      .required("Thứ tự là bắt buộc và lớn hơn hoặc bằng 0"),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    Object.assign(values, {
      // +++
    });
  }

  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType, { submitForm }) {
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, fromProps) {
    let { funcGroupEnt } = this.props;
    let { setSubmitting, resetForm } = fromProps;
    let willRedirect = false;
    let alerts = [];

    // Format
    let functions = [];
    (this.state.functions || []).forEach((item) => {
      if (item.function_group_is_check) {
        functions.push(item.function_id);
      }
    });
    let formData = Object.assign({}, values, {
      functions
    });
    Object.keys(formData).forEach(key => {
      console.log(key)
      console.log(typeof(formData[key]));
      if (typeof(formData[key]) === 'boolean'){
        formData[key] = formData[key] ? 1 : 0;
      }
      
    });
    // console.log('formData: ', formData);
    //
    let apiCall = funcGroupEnt
      ? this._functionGroupModel.update(funcGroupEnt.id(), formData)
      : this._functionGroupModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/function-groups');
        }
        // Reset form (only when add new)
        if (!funcGroupEnt) {
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

  handleChangeFunction(_function) {
    let { functions = [] } = this.state;
    let _func = functions.find((item) => item === _function);
    if (_func) {
      let { function_group_is_check } = _func;
      function_group_is_check = !function_group_is_check;
      Object.assign(_func, { function_group_is_check });
    }
    this.setState({ functions: functions.concat([]) });
  }

  handleChangeOrderIndex(event) {
    console.log(event);
    let { value } = event.target;
    console.log(value);
    //value = Math.max(Number(min), Math.min(Number(max), Number(value)));
    value = (value < 0) ? 0 : value;
    this.setState({ order_index: value });
  };

  render() {
    let {
      ready,
      alerts,
      functions
    } = this.state;
    let { funcGroupEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();

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
                <b>{funcGroupEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} nhóm quyền {funcGroupEnt ? `"${funcGroupEnt.function_group_name}"` : ''}</b>
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
                    // errors, status,
                    // touched, handleChange, handleBlur,
                    submitForm, resetForm,
                    handleSubmit,
                    handleReset,
                    // isValidating,
                    isSubmitting,
                    /* and other goodies */
                  } = (this.formikProps = formikProps);
                  // [Event]
                  this.handleFormikBeforeRender({ initialValues });
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row>
                        <Col xs={12}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="function_group_name" sm={3}>
                                  Tên nhóm quyền<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="function_group_name"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      name="function_group_name"
                                      id="function_group_name"
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                   <ErrorMessage name="function_group_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                             
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="order_index" sm={3}>
                                  Thứ tự<span className="font-weight-bold red-text">*</span>
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
                                      placeholder="0"
                                      className="text-right"
                                      disabled={noEdit}
                                      min={0}
                                     // value={this.state.order_index} 
                                      //onChange={changeValue =>
                                      //  this.handleChangeOrderIndex(
                                      //    changeValue
                                     //   )
                                     // }
                                    />}
                                  />
                                  <ErrorMessage name="order_index" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                              
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="is_active" sm={3}></Label>
                                <Col xs={6} sm={4}>
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
                                <Col xs={6} sm={5}>
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
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="" sm={3}>Quyền</Label>
                                <Col xs={12}>
                                  <Table size="sm" bordered striped hover responsive>
                                    <thead>
                                      <tr>
                                        <th style={{ width: '1%' }}>#</th>
                                        <th>Tên quyền</th>
                                        <th>Code</th>
                                        <th style={{ width: '%' }}>Xoá</th>
                                      </tr>
                                    </thead>
                                    <tbody>{functions.map((item, idx) => {
                                      return (
                                        <tr key={`function-${idx}`}>
                                          <th scope="row" className="text-center">{idx + 1}</th>
                                          <td>{item.function_name}</td>
                                          <td>{item.function_alias}</td>
                                          <td className="text-center">
                                            <Field
                                              // name="_functions"
                                              render={( /*{ field, _form } */) => <CustomInput
                                                // {...field}
                                                id={`function-${idx}`}
                                                name="functions"
                                                // onBlur={null}
                                                onChange={() => this.handleChangeFunction(item)}
                                                type="switch"
                                                label=""
                                                defaultChecked={item.function_group_is_check}
                                                disabled={noEdit}
                                              />}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}</tbody>
                                    {/*<tfoot>
                                      <tr><td colSpan={4}></td></tr>
                                    </tfoot>*/}
                                  </Table>
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={12} className="text-right">
                              {
                                noEdit?(
                                  <CheckAccess permission="SYS_FUNCTIONGROUP_EDIT">
                                    <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/function-groups/edit/${funcGroupEnt.function_group_id}`)}
                                      disabled={(!userAuth._isAdministrator() && funcGroupEnt.is_system !== 0)}
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
                              <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/function-groups')} className="btn-block-sm mt-md-0 mt-sm-2">
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

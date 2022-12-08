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
} from "reactstrap";
import Select from "react-select";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Util(s)
// import { readFileAsBase64 } from '../../utils/html';
// Model(s)
import FunctionModel from "../../models/FunctionModel";
import FunctionGroupModel from "../../models/FunctionGroupModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class FunctionAdd
 */
export default class FunctionAdd extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._functionModel = new FunctionModel();
    this._functionGroupModel = new FunctionGroupModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);

    // Init state
    // +++
    this.state = {
      /** @var {Array} */
      alerts: [],
      /** @var {Object} */
      initialValues: this.getInitialValues(),
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      function_groups: [
        { name: "-- Chọn --", id: "" },
      ],
    };
  }

  componentDidMount() {
    // Get bundle data
    (async () => {
      let bundle = await this._getBundleData();
      let {
        function_groups = []
      } = this.state;
      //
      function_groups = function_groups.concat(bundle.function_groups || []);
      // ...
      this.setState({
        ready: true,
        function_groups
      });
    })();
    //.end
  }

  /**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    let { functionEnt } = this.props;
    let bundle = {};
    let all = [
      this._functionGroupModel.getOptions({
        include_id: [functionEnt && functionEnt.function_group_id]
      })
        .then(data => (bundle['function_groups'] = data)),
      // Debug only: , new Promise((rs) => { setTimeout(rs, 5000) })
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
    let  { functionEnt } = this.props;
    let values = Object.assign({}, this._functionModel.fillable(), {});
    if (functionEnt) {
      Object.assign(values, functionEnt);
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
    function_name: Yup.string()
      .required("Tên quyền là bắt buộc."),
    function_alias: Yup.string()
      .required("Code là bắt buộc."),
    function_group_id: Yup.string()
      .required("Nhóm quyền là bắt buộc."),
  });

  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType, { submitForm }) {
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, fromProps) {
    let { functionEnt } = this.props;
    let { setSubmitting, resetForm } = fromProps;
    let willRedirect = false;
    let alerts = [];
    // 
    // let {} = values;
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_system: 1 * values.is_system,
    });
    // console.log('formData: ', formData);
    //
    let apiCall = functionEnt
      ? this._functionModel.update(functionEnt.id(), formData)
      : this._functionModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/functions');
        }
        // Reset form (only when add new)
        if (!functionEnt) {
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
      function_groups,
    } = this.state;
    let { functionEnt, noEdit } = this.props;
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
                <b>{functionEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} quyền {functionEnt ? `"${functionEnt.function_name}"` : ''}</b>
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
                >{({
                  values, errors, status,
                  // touched, handleChange, handleBlur,
                  submitForm, resetForm, // handleSubmit,
                  isValidating, isSubmitting,
                  /* and other goodies */
                }) => (
                  <Form id="form1st" onSubmit={(event) => { event.preventDefault(); }}>
                  <Row>
                  <Col sm={12}>
                    <FormGroup row>
                      <Label for="function_name" sm={3} className="font-weight-bold">
                        Tên quyền <span className="font-weight-bold red-text">*</span>
                      </Label>
                      <Col sm={9}>
                        <Field
                          name="function_name"
                          render={({ field /* _form */ }) => <Input
                            {...field}
                            onBlur={null}
                            type="text"
                            name="function_name"
                            id="function_name"
                            placeholder=""
                            disabled={noEdit}
                          />}
                        />
                        <ErrorMessage name="function_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      </Col>
                    </FormGroup>
                  </Col>
                  <Col xs={12}>
                    <FormGroup row>
                      <Label for="function_alias" sm={3} className="font-weight-bold">
                        Code<span className="font-weight-bold red-text">*</span>
                      </Label>
                      <Col sm={9}>
                        <Field
                          name="function_alias"
                          render={({ field /* _form */ }) => <Input
                            {...field}
                            onBlur={null}
                            type="text"
                            name="function_alias"
                            id="function_alias"
                            placeholder=""
                            disabled={noEdit}
                          />}
                        />
                        <ErrorMessage name="function_alias" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>
                    <FormGroup row>
                      <Label for="function_group_id" sm={3} className="font-weight-bold">
                        Nhóm quyền <span className="font-weight-bold red-text">*</span>
                      </Label>
                      <Col sm={9}>
                        <Field
                          name="function_group_id"
                          render={({ field/*, form*/ }) => {
                            let options = function_groups.map(({ name: label, id: value }) => ({ value, label }));
                            let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                            let placeholder = (function_groups[0] && function_groups[0].name) || '';
                            return (
                              <Select
                                id="function_group_id"
                                name="function_group_id"
                                onChange={item => field.onChange({
                                  target: {
                                    type: "select",
                                    name: "function_group_id",
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
                        <ErrorMessage name="function_group_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>
                    <FormGroup row>
                      <Label for="is_active" sm={3} className="col-form-label"></Label>
                      <Col xs={6} sm="4">
                        <Field
                          name="is_active"
                          render={({ field /* _form */ }) => <CustomInput
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
                       <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      </Col>
                      <Col xs={6} sm="4">
                        <Field
                          name="is_system"
                          render={({ field /* _form */ }) => <CustomInput
                            {...field}
                            className="pull-left"
                            onBlur={null}
                            checked={values.is_system}
                            type="switch"
                            id="is_system"
                            label="Hệ thống"
                            disabled={noEdit}
                          />}
                        />
                        <ErrorMessage name="is_system" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>
                    <FormGroup row>
                      <Label for="description" sm={3}  className="font-weight-bold">
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
                        <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                      </Col>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} className="text-right">
                    {
                      noEdit?(
                        <CheckAccess permission="SYS_FUNCTION_EDIT">
                          <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/functions/edit/${functionEnt.function_id}`)}
                            disabled={(!userAuth._isAdministrator() && functionEnt.is_system !== 0)}
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
                    <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/functions')} className="btn-block-sm mt-md-0 mt-sm-2">
                      <i className="fa fa-times-circle mr-1" />Đóng
                    </Button>
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

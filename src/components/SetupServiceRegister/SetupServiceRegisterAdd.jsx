import React, { Component } from "react";
import { Formik, Field } from "formik";
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
  Input
} from "reactstrap";
import Select from 'react-select';
// Component(s)
import Loading from "../Common/Loading";
//import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)
import SetupServiceRegisterModel from "../../models/SetupServiceRegisterModel";
// Util(s)
import { mapDataOptions4Select } from '../../utils/html';
/** @var {Object} */
//const userAuth = window._$g.userAuth;

/**
 * @class SetupServiceRegisterAdd
 */
export default class SetupServiceRegisterAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._SetupServiceRegisterModel = new SetupServiceRegisterModel();

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
      SetupServiceRegisterOptions: [
        { label: "-- Chọn --", id: "" },
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
    full_name: Yup.string().required("Họ tên là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {

    let { SetupServiceRegisterEnt } = this.props;
    let values = Object.assign(
      {}, this._SetupServiceRegisterModel.fillable(),
    );

    if (SetupServiceRegisterEnt) {
      Object.assign(values, SetupServiceRegisterEnt);
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
      this._SetupServiceRegisterModel.getOptions({ is_active: 1 })
        .then(data => { return (bundle['SetupServiceRegisterOptions'] = mapDataOptions4Select(data)) }),
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

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    window.scrollTo(0, 0);
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
    let { SetupServiceRegisterEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting/*, resetForm*/ } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active
    });
    let _SetupServiceRegisterId = (SetupServiceRegisterEnt && SetupServiceRegisterEnt.SetupServiceRegister_id) || formData[this._SetupServiceRegisterModel];
    let apiCall = _SetupServiceRegisterId
      ? this._SetupServiceRegisterModel.update(_SetupServiceRegisterId, formData)
      : this._SetupServiceRegisterModel.create(formData)
      ;
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = await this._SetupServiceRegisterModel.read(data, {});
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/setup-service-register');
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
        if (!SetupServiceRegisterEnt && !willRedirect && !alerts.length) {
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

  render() {
    let { _id, ready, alerts, SetupServiceRegisterOptions, register_setup_id } = this.state;
    let { SetupServiceRegisterEnt, noEdit } = this.props;
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
                <b>{SetupServiceRegisterEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} Thông tin liên hệ</b>
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
                  validate={this.handleFormikValidate}
                  onSubmit={this.handleFormikSubmit}
                >
                  {formikProps => {
                    let {
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
                            <Col xs={12} >
                              <FormGroup row>
                                <Label for="full_name" sm={2}>
                                  Họ tên
                                </Label>
                                <Col sm={4}>
                                  <Field name="full_name"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                </Col>
                              {/* </FormGroup>
                           </Col>
                            <Col xs={12} sm={6}>
                              <FormGroup row> */}
                                <Label for="email" sm={2}>
                                  Email
                                </Label>
                                <Col sm={4}>
                                  <Field name="email"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} >
                              <FormGroup row>
                                <Label for="phone_number" sm={2}>
                                  Số điện thoại
                                </Label>
                                <Col sm={4}>
                                  <Field name="phone_number"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                </Col>
                              {/* </FormGroup>
                           </Col>
                            <Col xs={12} sm={6}>
                              <FormGroup row> */}
                                <Label for="address" sm={2}>
                                  Địa chỉ
                                </Label>
                                <Col sm={4}>
                                  <Field name="address"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12} >
                              <FormGroup row>
                              {/* </FormGroup>
                            </Col>
                            <Col xs={12} sm={6}> 
                              <FormGroup row> */}
                                <Label sm={2}>
                                  Gói setup
                                </Label>
                                <Col sm={10}>
                                  <Field
                                    name="setup_service_id"
                                    render={({ field /*, form*/ }) => {
                                      let defaultValue = SetupServiceRegisterOptions.find( ({ value }) => 1 * value === 1 * field.value );
                                      let placeholder = (SetupServiceRegisterOptions[0] && SetupServiceRegisterOptions[0].label) || "";
                                      return (
                                        <Select
                                          name={field.name}
                                          onChange={changeValue =>
                                            field.onChange({
                                              target: {
                                                name: field.name,
                                                changeValue
                                              }
                                            })
                                          }
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={SetupServiceRegisterOptions}
                                          value={register_setup_id}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="content_registration" sm={2}>  Mô tả </Label>
                                <Col sm={10}>
                                  <Field
                                    name="content_registration"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="textarea"
                                      id="content_registration"
                                      disabled={noEdit}
                                    />}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="" sm={3}></Label>
                                <Col sm={9}>
                                  <div className="d-flex button-list-default justify-content-end">
                                    {/* {
                                      noEdit ? (
                                        <CheckAccess permission="CMS_SetupServiceRegister_EDIT">
                                          <Button color="primary" className="mr-2 btn-block-sm"
                                            onClick={() => window._$g.rdr(`/SetupServiceRegister/update/${SetupServiceRegisterEnt && SetupServiceRegisterEnt.id()}`)}
                                            disabled={(!userAuth._isAdministrator() && SetupServiceRegisterEnt.is_active !== 0)}
                                          >
                                            <i className="fa fa-edit mr-1" />Chỉnh sửa
                                                </Button>
                                        </CheckAccess>
                                      ) :
                                        [
                                          (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit("save")} className="ml-3">
                                            <i className="fa fa-save mr-2" /> <span className="ml-1">Lưu</span>
                                          </Button> : null,
                                          (false !== this.props.handleActionSaveAndClose) ? <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit("save_n_close")} className="ml-3">
                                            <i className="fa fa-save mr-2" /> <span className="ml-1"> Lưu &amp; Đóng </span>
                                          </Button> : null
                                        ]
                                    } */}
                                    <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr("/task/add"))} className="ml-3" color="success">
                                      <i className="fa fa-back mr-1" /> <span className="ml-1">Giao việc</span>
                                    </Button>
                                    <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr("/setup-service-register"))} className="ml-3" >
                                      <i className="fa fa-times-circle mr-1" /> <span className="ml-1">Đóng</span>
                                    </Button>
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

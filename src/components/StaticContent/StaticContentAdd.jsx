import React, { Component } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
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
import Select from "react-select";

// Component(s)
import Loading from "../Common/Loading";
import RichEditor from "../Common/RichEditor";
import { CheckAccess } from "../../navigation/VerifyAccess";
import "react-image-lightbox/style.css";
import "../Products/styles.scss";
// Component(s)
// Model(s)
import StaticContentModel from "../../models/StaticContentModel";
// Util(s)
import { mapDataOptions4Select, readImageBase64CallBack } from "../../utils/html";
/** @var {Object} */
/**
 * @class StaticContentAdd
 */
export default class StaticContentAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._StaticContentModel = new StaticContentModel();

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
      StaticContentOptions: [{ label: "-- Chọn --", id: "" }],
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
    static_title: Yup.string().required("Tiêu đề là bắt buộc."),
    static_content: Yup.string().required("Nội dung là bắt buộc."),
    system_name: Yup.string().required("Tên hệ thống là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { StaticContentEnt } = this.props;
    let values = Object.assign({}, this._StaticContentModel.fillable());
    if (StaticContentEnt) {
      Object.assign(values, StaticContentEnt);
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
      this._StaticContentModel.getOptions({ is_active: 1 }).then(data => {
        return (bundle["StaticContentOptions"] = mapDataOptions4Select(data));
      })
    ];

    await Promise.all(all).catch(err =>
      window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      )
    );
    //
    Object.keys(bundle).forEach(key => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    return bundle;
  }
  ChangeAlias = (val) => {
    var str = val;
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

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikValidate(values) {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      typeof values[prop] === "string" && (values[prop] = values[prop].trim());
    });
    //.end
  }

  handleFormikSubmit(values, formProps) {
    let { StaticContentEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting /*, resetForm*/ } = formProps;

    let willRedirect = false;
    let alerts = [];

    console.log(values)
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_childrent: 1 * values.is_childrent,
      display_order: 1 * values.display_order,
      webcategory_id:
        1 * values.webcategory_id > 0
          ? 1 * values.webcategory_id
          : 1 * values.webcategory_id.value || 0
    });
    let _StaticContentId =
      (StaticContentEnt && StaticContentEnt.static_content_id) ||
      formData[this._StaticContentModel];
    let apiCall = _StaticContentId
      ? this._StaticContentModel.update(_StaticContentId, formData)
      : this._StaticContentModel.create(formData);
    apiCall
      .then(async data => {
        // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = await this._StaticContentModel.read(data, {});
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/static-content");
        }
        // Chain
        return data;
      })
      .catch(apiData => {
        // NG
        let { errors, statusText, message } = apiData;
        let msg = [`<b>${statusText || message}</b>`]
          .concat(errors || [])
          .join("<br/>");
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        //
        if (!StaticContentEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(
          () => ({ alerts }),
          () => {
            window.scrollTo(0, 0);
          }
        );
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
    let { _id, ready, alerts, StaticContentOptions } = this.state;
    let { StaticContentEnt, noEdit } = this.props;
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
                <b>
                  {StaticContentEnt
                    ? noEdit
                      ? "Chi tiết"
                      : "Chỉnh sửa"
                    : "Thêm mới"}{" "}
                  nội dung trang tĩnh
                </b>
              </CardHeader>
              <CardBody>
                {/* general alerts */}
                {alerts.map(({ color, msg }, idx) => {
                  return (
                    <Alert
                      key={`alert-${idx}`}
                      color={color}
                      isOpen={true}
                      toggle={() => this.setState({ alerts: [] })}
                    >
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
                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label sm={2}>
                                Tiêu đề{" "}
                                <span className="font-weight-bold red-text"> {" "}*{" "} </span>
                              </Label>
                              <Col sm={10}>
                                <Field
                                  name="static_title"
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
                                <ErrorMessage
                                  name="static_title"
                                  component={({ children }) => (
                                    <Alert
                                      color="danger"
                                      className="field-validation-error"
                                    >
                                      {children}
                                    </Alert>
                                  )}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label sm={2}>
                                Danh mục website
                              </Label>
                              <Col sm={4}>
                                <Field
                                  name="webcategory_id"
                                  render={({ field /*, form*/ }) => {
                                    let defaultValue = StaticContentOptions.find(
                                      ({ value }) =>
                                        1 * value === 1 * field.value
                                    );
                                    let placeholder =
                                      (StaticContentOptions[0] &&
                                        StaticContentOptions[0].label) ||
                                      "";
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={({ value }) =>
                                          field.onChange({
                                            target: {
                                              type: "select",
                                              name: field.name,
                                              value
                                            }
                                          })
                                        }
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={defaultValue}
                                        options={StaticContentOptions}
                                        isDisabled={noEdit}
                                        className="z-index-222"
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage
                                  name="webcategory_id"
                                  component={({ children }) => (
                                    <Alert
                                      color="danger"
                                      className="field-validation-error"
                                    >
                                      {children}
                                    </Alert>
                                  )}
                                />
                              </Col>
                              <Label sm={2}>
                                Tên seo
                                </Label>
                              <Col sm={4}>
                                <Field
                                  name="seo_name"
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      placeholder=""
                                      value={this.ChangeAlias(values.static_title)}
                                      disabled={true}
                                    />
                                  )}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="is_childrent" sm={2}></Label>
                              <Col sm={4}>
                                <Field
                                  name="is_childrent"
                                  render={({ field }) => (
                                    <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_childrent}
                                      type="switch"
                                      id="is_childrent"
                                      label="Là trang con"
                                      disabled={noEdit}
                                    />
                                  )}
                                />
                              </Col>
                              <Label sm={2}>
                                Meta Title
                                </Label>
                              <Col sm={4}>
                                <Field
                                  name="meta_title"
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
                          <Col xs={12}>
                            <FormGroup row>
                              <Label sm={2}>
                                Tên hệ thống{" "}
                                <span className="font-weight-bold red-text"> {" "}*{" "} </span>
                              </Label>
                              <Col sm={4}>
                                <Field
                                  name="system_name"
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
                                <ErrorMessage
                                  name="system_name"
                                  component={({ children }) => (
                                    <Alert
                                      color="danger"
                                      className="field-validation-error"
                                    >
                                      {children}
                                    </Alert>
                                  )}
                                />
                              </Col>
                              <Label sm={2}>
                                Meta Keywords
                                </Label>
                              <Col sm={4}>
                                <Field
                                  name="meta_keywords"
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
                          <Col xs={12}>
                            <FormGroup row>
                              <Label sm={2}>
                                Thứ tự hiển thị
                                </Label>
                              <Col sm={4}>
                                <Field
                                  name="display_order"
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
                              <Label for="meta_data_scriptions" sm={2}>Meta Description</Label>
                              <Col sm={4}>
                                <Field
                                  name="meta_data_scriptions"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="textarea"
                                    id="meta_data_scriptions"
                                    disabled={noEdit}
                                    maxLength={400}
                                  />}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="static_content" sm={2}>
                                Nội dung trang tĩnh{" "}
                                <span className="font-weight-bold red-text">
                                  {" "}
                                    *{" "}
                                </span>
                              </Label>
                              <Col sm={10}>
                                <RichEditor
                                  disable={noEdit}
                                  setContents={values.static_content}
                                  onChange={(content) => formikProps.setFieldValue("static_content", content)}
                                />
                                <ErrorMessage
                                  name="static_content"
                                  component={({ children }) => (
                                    <Alert
                                      color="danger"
                                      className="field-validation-error"
                                    >
                                      {children}
                                    </Alert>
                                  )}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="is_active" sm={2}></Label>
                              <Col sm={8}>
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
                        </Row>

                        <Row>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="" sm={3}></Label>
                              <Col sm={9}>
                                <div className="d-flex button-list-default justify-content-end">
                                  {noEdit ? (
                                    <CheckAccess permission="CMS_STATICCONTENT_EDIT">
                                      <Button
                                        color="primary"
                                        className="mr-2 btn-block-sm"
                                        onClick={() =>
                                          window._$g.rdr(
                                            `/static-content/edit/${StaticContentEnt &&
                                            StaticContentEnt.id()}`
                                          )
                                        }
                                      >
                                        <i className="fa fa-edit mr-1" />
                                          Chỉnh sửa
                                        </Button>
                                    </CheckAccess>
                                  ) : (
                                      [
                                        false !==
                                          this.props.handleActionSave ? (
                                            <Button
                                              key="buttonSave"
                                              type="submit"
                                              color="primary"
                                              disabled={isSubmitting}
                                              onClick={() =>
                                                this.handleSubmit("save")
                                              }
                                              className="ml-3"
                                            >
                                              <i className="fa fa-save mr-2" />{" "}
                                              <span className="ml-1">Lưu</span>
                                            </Button>
                                          ) : null,
                                        false !==
                                          this.props.handleActionSaveAndClose ? (
                                            <Button
                                              key="buttonSaveClose"
                                              type="submit"
                                              color="success"
                                              disabled={isSubmitting}
                                              onClick={() =>
                                                this.handleSubmit("save_n_close")
                                              }
                                              className="ml-3"
                                            >
                                              <i className="fa fa-save mr-2" />{" "}
                                              <span className="ml-1">
                                                {" "}
                                              Lưu &amp; Đóng{" "}
                                              </span>
                                            </Button>
                                          ) : null
                                      ]
                                    )}
                                  <Button
                                    disabled={isSubmitting}
                                    onClick={
                                      this.props.handleActionClose ||
                                      (() =>
                                        window._$g.rdr("/static-content"))
                                    }
                                    className="ml-3"
                                  >
                                    <i className="fa fa-times-circle mr-1" />{" "}
                                    <span className="ml-1">Đóng</span>
                                  </Button>
                                </div>
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>

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

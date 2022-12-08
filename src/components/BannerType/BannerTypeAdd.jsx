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
// Component(s)
import Loading from "../Common/Loading";
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)
import BannerTypeModel from "../../models/BannerTypeModel";

/** @var {Object} */

/**
 * @class BannerTypeAdd
 */
export default class BannerTypeAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._bannerTypeModel = new BannerTypeModel();

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
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      this.setState({ ready: true });
    })();
    //.end
  }

  formikValidationSchema = Yup.object().shape({
    banner_type_name: Yup.string().required("Tên loại banner là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { BannerTypeEnt } = this.props;
    let values = Object.assign({}, this._bannerTypeModel.fillable());
    if (BannerTypeEnt) {
      Object.assign(values, BannerTypeEnt);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
    });
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */

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
    let { BannerTypeEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting/*, resetForm*/ } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_show_home: (values.is_show_home != null) ? 1 * values.is_show_home : 0,
    });
    let _bannerTypeId = (BannerTypeEnt && BannerTypeEnt.banner_type_id) || formData[this._bannerTypeModel];
    let apiCall = _bannerTypeId
      ? this._bannerTypeModel.update(_bannerTypeId, formData)
      : this._bannerTypeModel.create(formData)
      ;
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = await this._bannerTypeModel.read(data, {});
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/banner-type');
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
        if (!BannerTypeEnt && !willRedirect && !alerts.length) {
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
    let { _id, ready, alerts } = this.state;
    let { BannerTypeEnt, noEdit } = this.props;
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
                <b>{BannerTypeEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} loại banner {BannerTypeEnt ? BannerTypeEnt.status_name : ''}</b>
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
                                <Label for="banner_type_name" sm={3}>
                                  Tên loại banner {" "} <span className="font-weight-bold red-text"> * </span>
                                </Label>
                                <Col sm={9}>
                                  <Field name="banner_type_name"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                        maxLength={200}
                                      />
                                    )}
                                  />
                                  <ErrorMessage
                                    name="banner_type_name" component={({ children }) => (<Alert color="danger" className="field-validation-error">{children}</Alert>)}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="descriptions" sm={3}>  Mô tả </Label>
                                <Col sm={9}>
                                  <Field
                                    name="descriptions"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="textarea"
                                      id="descriptions"
                                      disabled={noEdit}
                                      maxLength={400}
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
                                <Col sm={4}>
                                  <Field
                                    name="is_show_home"
                                    render={({ field }) => (
                                      <CustomInput
                                        {...field}
                                        className="pull-left"
                                        onBlur={null}
                                        checked={values.is_show_home}
                                        type="switch"
                                        id="is_show_home"
                                        label="Hiển thị trang chủ"
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
                                        <CheckAccess permission="CMS_BANNERTYPE_EDIT">
                                          <Button color="primary" className="mr-2 btn-block-sm"
                                            onClick={() => window._$g.rdr(`/banner-type/edit/${BannerTypeEnt && BannerTypeEnt.id()}`)}
                                            disabled={isSubmitting}
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
                                    }
                                    <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr("/banner-type"))} className="ml-3" >
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

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
import NewsStatusModel from "../../models/NewsStatusModel";

/** @var {Object} */

/**
 * @class NewsStatusAdd
 */
export default class NewsStatusAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._newsStatusModel = new NewsStatusModel();

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
    news_status_name: Yup.string().required("Tên loại trạng thái tin tức là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { NewsStatusEnt } = this.props;
    let values = Object.assign({}, this._newsStatusModel.fillable());
    if (NewsStatusEnt) {
      Object.assign(values, NewsStatusEnt);
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
    let { NewsStatusEnt, handleFormikSubmitSucceed } = this.props;
    let { setSubmitting/*, resetForm*/ } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_system: (values.is_system != null) ? 1 * values.is_system : 0,
    });
    let _newsStatusId = (NewsStatusEnt && NewsStatusEnt.news_status_id) || formData[this._newsStatusModel];
    let apiCall = _newsStatusId
      ? this._newsStatusModel.update(_newsStatusId, formData)
      : this._newsStatusModel.create(formData)
      ;
    apiCall
      .then(async (data) => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = await this._newsStatusModel.read(data, {});
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/news-status');
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
        if (!NewsStatusEnt && !willRedirect && !alerts.length) {
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
    let { NewsStatusEnt, noEdit } = this.props;
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
                <b>{NewsStatusEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} trạng thái tin tức {NewsStatusEnt ? NewsStatusEnt.status_name : ''}</b>
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
                                <Label for="news_status_name" sm={3}>
                                  Tên tên trạng thái tin tức {" "} <span className="font-weight-bold red-text"> * </span>
                                </Label>
                                <Col sm={9}>
                                  <Field name="news_status_name"
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
                                    name="news_status_name" component={({ children }) => (<Alert color="danger" className="field-validation-error">{children}</Alert>)}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="order_index" sm={3}> Thứ tự hiển thị  <span className="font-weight-bold red-text">  * </span></Label>
                                <Col sm={2}>
                                  <Field
                                    name="order_index"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="number"
                                      id={field.name}
                                      className="text-right"
                                      placeholder=""
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
                                    name="is_system"
                                    render={({ field }) => (
                                      <CustomInput
                                        {...field}
                                        className="pull-left"
                                        onBlur={null}
                                        checked={values.is_system}
                                        type="switch"
                                        id="is_system"
                                        label="Hệ thống"
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
                                        <CheckAccess permission="NEWS_NEWSSTATUS_EDIT">
                                          <Button color="primary" className="mr-2 btn-block-sm"
                                            onClick={() => window._$g.rdr(`/news-status/edit/${NewsStatusEnt && NewsStatusEnt.id()}`)}>
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
                                    <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr("/news-status"))} className="ml-3" >
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

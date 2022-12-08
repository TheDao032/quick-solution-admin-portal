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
  CustomInput
} from "reactstrap";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';
import Loading from '../Common/Loading';

// Model(s)
import TopicModel from "../../models/TopicModel";

/**
 * @class TopicAdd
 */
export default class TopicAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._topicModel = new TopicModel();

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
      ready: true,
    };
  }

  formikValidationSchema = Yup.object().shape({
    topic_name: Yup.string().trim()
      .required("Tên chủ đề là bắt buộc."),
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { TopicEnt } = this.props; 
    let values = {
      is_active: true,
      topic_name: '',
      descriptions: '',
    };
    if(TopicEnt){
      values = {
        is_active: TopicEnt.is_active,
        topic_name: TopicEnt.topic_name,
        descriptions: TopicEnt.descriptions,
      };
    }
    return values;
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { TopicEnt } = this.props;

    let { setSubmitting, resetForm } = formProps;
    let willRedirect = false;
    let alerts = []; 
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
    });
    let topicId = (TopicEnt && TopicEnt.topic_id) || formData[this._topicModel];
    let apiCall = topicId
      ? this._topicModel.edit(topicId, formData)
      : this._topicModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/topic');
        }

        if (this._btnType === 'save' && !topicId) {
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
        if (!TopicEnt && !willRedirect && !alerts.length) {
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
    }));
  }

  render() {
    let {
      _id,
      ready,
      alerts,
    } = this.state;
    let { TopicEnt, noEdit } = this.props;
    console.log(TopicEnt)
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
                <b>{TopicEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} chủ đề {TopicEnt ? TopicEnt.topic_name : ''}</b>
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
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    handleSubmit,
                    handleReset,
                    isSubmitting,
                  } = (this.formikProps = window._formikProps = formikProps);
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Col xs={12}>
                        <Row >
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="topic_name"  sm={3}>
                                Tên chủ đề <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="topic_name"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="topic_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <Row>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="descriptions" sm={3}>
                                    Mô tả
                                  </Label>
                                  <Col sm={9}>
                                    <Field
                                      name="descriptions"
                                      render={({ field /* _form */ }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="textarea"
                                        id="descriptions"
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
                                  <Label for="ward_id" sm={3}></Label>
                                  <Col sm={9}>
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
                            </Row>
                            <Row>
                              <Col sm={12} className="text-right">
                                {
                                  noEdit?(
                                    <CheckAccess permission="CMS_TOPIC_EDIT">
                                      <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/topic/edit/${TopicEnt.id()}`)}>
                                        <i className="fa fa-edit mr-1" />Chỉnh sửa
                                      </Button>
                                    </CheckAccess>
                                  ):
                                  [
                                    <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                      <i className="fa fa-save mr-2" />Lưu
                                    </Button>,
                                    <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                      <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                    </Button>
                                  ]
                                }
                                <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/topic')} className="btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-close" />
                                  <span className="ml-1">Đóng</span>
                                </Button>
                              </Col>
                            </Row>
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

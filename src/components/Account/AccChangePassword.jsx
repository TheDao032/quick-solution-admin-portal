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
  // Media
} from "reactstrap";

// Component(s)
import Loading from '../Common/Loading';

// Model(s)
import UserModel from "../../models/UserModel";

/**
 * @class AccChangePassword
 */
export default class AccChangePassword extends PureComponent {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._userModel = new UserModel();

    // Bind method(s)
    //this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    // Init state
    // +++
    // let { userEnt } = props;
    // Init state
    this.state = {
      /** @var {Array} */
      alerts: [],
      /** @var {UserEntity} */
      userEnt: window._$g.userAuth
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      old_password: Yup.string().trim()
        .required("Mật khẩu cũ là bắt buộc.")
        .min(8, 'Mật khẩu quá ngắn, ít nhất 8 ký tự!')
        .max(25, 'Mật khẩu quá dài, tối đa 25 ký tự!')
      ,
      new_password: Yup.string().trim()
        .required("Mật khẩu mới là bắt buộc.")
        .min(8, 'Mật khẩu quá ngắn, ít nhất 8 ký tự!')
        .max(25, 'Mật khẩu quá dài, tối đa 25 ký tự!')
      ,
      re_password: Yup.string().trim()
        .required("Xác nhận mật khẩu mới là bắt buộc.")
      ,
    });
  }

  componentDidMount() {}

  handleFormikValidate(values) {
    let errors = {};
    // let { campaignType } = this.state;
    //
    if (values.new_password !== values.re_password) {
      let errMsg = "Xác nhận mật khẩu mới không trùng khớp.";
      errors.re_password = errMsg;
    }
    return errors;
  }

  /**
   * @return {Object}
   */
  getInitialValues() {
    let values = {
      old_password: "",
      new_password: "",
      re_password: ""
    };
    // Return;
    return values;
  }

  handleSubmit() {
    let { submitForm } = this.formikProps;
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    //event.preventDefault();
    let { userEnt } = this.state;
    let { setSubmitting, resetForm } = formProps;
    let alerts = [];
    // 
    let formData = {...values};
    // console.log('formData: ', formData);
    //
    this._userModel.AccChangePasswordUser(userEnt.id(), formData)
      .then(data => { // OK
        window._$g.toastr.show('Thay đổi mật khẩu thành công!', 'success');
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
        if (!alerts.length) {
          resetForm();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  render() {
    let {
      alerts,
      userEnt,
    } = this.state;
    // Ready?
    if (!userEnt) {
      return <Loading />;
    }

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>Thay đổi mật khẩu</b>
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
                <Row>
                  <Col xs={9}>
                    <Formik
                      initialValues={this.getInitialValues()}
                      validationSchema={this.formikValidationSchema}
                      validate={this.handleFormikValidate.bind(this)}
                      validateOnBlur={false}
                  // validateOnChange={false}
                      onSubmit={this.handleFormikSubmit}
                    >{(formikProps) => {
                      let {
                        handleSubmit,
                        isSubmitting
                      } = (this.formikProps = formikProps);
                      //render
                      return(
                        <Form  id="form1st" onSubmit={handleSubmit}>
                        <FormGroup row>
                          <Label for="UserID" sm={4} className="font-weight-bold">
                            UserID
                          </Label>
                          <Col sm={8}>
                            <b>{`${userEnt._fullname()} [${userEnt.user_name}]`}</b>
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Label for="old_password" sm={4} className="font-weight-bold">
                            Mật khẩu cũ <span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Field
                              name="old_password"
                              render={({ field /* _form */ }) => <Input
                                {...field}
                                onBlur={null}
                                type="password"
                                placeholder="Mật khẩu cũ"
                              />}
                            />
                            <ErrorMessage name="old_password" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Label for="new_password" sm={4} className="font-weight-bold">
                            Mật khẩu mới<span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Field
                              name="new_password"
                              render={({ field /* _form */ }) => <Input
                                {...field}
                                onBlur={null}
                                type="password"
                                placeholder="Mật khẩu mới"
                              />}
                            />
                            <ErrorMessage name="new_password" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Label for="re_password" sm={4} className="font-weight-bold">
                            Xác nhận mật khẩu mới<span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Field
                              name="re_password"
                              render={({ field /* _form */ }) => <Input
                                {...field}
                                onBlur={null}
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                              />}
                            />
                            <ErrorMessage name="re_password" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Col sm={{ size: 3, offset: 4 }}>
                            <Button type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')}>
                              <i className="fa fa-edit" />
                              <span className="ml-1">Xác nhận</span>
                            </Button>
                          </Col>
                          <Col sm={{ size: 3 }}>
                            <Button onClick={() => window._$g.rdr('/users')} disabled={isSubmitting}>
                              <i className="fa fa-close" />
                              <span className="ml-1">Đóng</span>
                            </Button>
                          </Col>
                        </FormGroup>
                      </Form>
                      );
                    }}</Formik>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

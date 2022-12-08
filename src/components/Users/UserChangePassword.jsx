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
 * @class UserChangePassword
 */
export default class UserChangePassword extends PureComponent {
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
    let { userEnt } = props;
    // Init state
    this.state = {
      /** @var {Array} */
      alerts: [],
      /** @var {UserEntity} */
      userEnt: null
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      password: userEnt ? undefined : Yup.string().trim()
        .required("Mật khẩu là bắt buộc.")
        .min(8, 'Mật khẩu quá ngắn, ít nhất 8 ký tự!')
        .max(25, 'Mật khẩu quá dài, tối đa 25 ký tự!')
      ,
      password_confirm: Yup.string().trim()
        .required("Xác nhận mật khẩu là bắt buộc.")
      ,
    });
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let userEnt = await this._userModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      userEnt && this.setState({ userEnt });
    })();
    //.end
  }

  /**
   * @return {Object}
   */
  getInitialValues() {
    let values = {
      password: "",
      password_confirm: ""
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
    this._userModel.changePassword(userEnt.id(), formData)
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
                          <Label for="password" sm={4} className="font-weight-bold">
                            Mật khẩu <span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Field
                              name="password"
                              render={({ field /* _form */ }) => <Input
                                {...field}
                                onBlur={null}
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Mật khẩu"
                              />}
                            />
                            <ErrorMessage name="password" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Label for="password_confirm" sm={4} className="font-weight-bold">
                            Xác nhận mật khẩu <span className="font-weight-bold red-text">*</span>
                          </Label>
                          <Col sm={8}>
                            <Field
                              name="password_confirm"
                              render={({ field /* _form */ }) => <Input
                                {...field}
                                onBlur={null}
                                type="password"
                                name="password_confirm"
                                id="password_confirm"
                                placeholder="Xác nhận mật khẩu"
                              />}
                            />
                            <ErrorMessage name="password_confirm" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Col sm={{ size: 3, offset: 4 }}>
                            <Button type="submit" color="primary" block disabled={isSubmitting} onClick={() => this.handleSubmit('save')}>
                              <i className="fa fa-edit" />
                              <span className="ml-1">Xác nhận</span>
                            </Button>
                          </Col>
                          <Col sm={{ size: 3 }}>
                            <Button onClick={() => window._$g.rdr('/users')} block>
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

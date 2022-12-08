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
import AccountModel from "../../models/AccountModel";

/**
 * @class AccountChangePassword
 */
export default class AccountChangePassword extends PureComponent {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._accountModel = new AccountModel();

    // Bind method(s)
    //this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    // Init state
    // +++
    let { AccountEnt } = props;
    // Init state
    this.state = {
      /** @var {Array} */
      alerts: [],
      /** @var {AccountEntity} */
      AccountEnt: null
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      password: AccountEnt ? undefined : Yup.string().trim()
        .required("Mật khẩu là bắt buộc.")
        .min(8, 'Mật khẩu quá ngắn, ít nhất 8 ký tự!')
        .max(25, 'Mật khẩu quá dài, tối đa 25 ký tự!')
      ,
      password_confirm: Yup.string().trim()
      .required("Mật khẩu mới là bắt buộc.")
      .min(8, 'Mật khẩu quá ngắn, ít nhất 8 ký tự!')
      .max(25, 'Mật khẩu quá dài, tối đa 25 ký tự!') 
      ,
    });
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let AccountEnt = await this._accountModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      AccountEnt && this.setState({ AccountEnt });
    })();
    //.end
  }
  handleFormikValidate(values) {
    let errors = {};
    // let { campaignType } = this.state;
    //
    if (values.password !== values.password_confirm) {
      let errMsg = "Xác nhận mật khẩu mới không trùng khớp.";
      errors.password_confirm = errMsg;
    }
    return errors;
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
    let { submitForm,values } = this.formikProps;
    console.log(values);
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikSubmit(values, formProps) { 

    //event.preventDefault();
    let { AccountEnt } = this.state;
    let { setSubmitting, resetForm } = formProps;
    let alerts = [];
    // 
    console.log(values)
    let formData = {...values};
   
    this._accountModel.changePassword(AccountEnt.id(), formData)
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
      AccountEnt,
    } = this.state;
    // Ready?
    if (!AccountEnt) {
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
                            <b>{`${AccountEnt._fullname()} [${AccountEnt.user_name}]`}</b>
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
                            <Button onClick={() => window._$g.rdr('/account')} block>
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

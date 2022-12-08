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
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Model(s)
import ManufacturerModel from "../../models/ManufacturerModel";

/**
 * @class ManufacturerAdd
 */
export default class ManufacturerAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._manufacturerModel = new ManufacturerModel();

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
    manufacturer_name: Yup.string().required("Tên nhà sản xuất là bắt buộc."),
    email: Yup.string()
      .nullable()
      .email('Email không hợp lệ'),
    website: Yup.string()
      .nullable()
      .url('Website không hợp lệ'),
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { manufacturerEnt } = this.props;
    let values = {
      descriptions: '',
      is_active: true,
      manufacturer_name: '',
      phone_number: '',
      manufacturer_address: '',
      email: '',
      website: '',
    };
    if(manufacturerEnt){
      values = {
        descriptions: manufacturerEnt.descriptions,
        is_active: manufacturerEnt.is_active,
        manufacturer_name: manufacturerEnt.manufacturer_name,
        phone_number: manufacturerEnt.phone_number,
        manufacturer_address: manufacturerEnt.manufacturer_address,
        email: manufacturerEnt.email,
        website: manufacturerEnt.website,
      };
    }
    return values;
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
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
    let { manufacturerEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;
    let willRedirect = false;
    let alerts = []; 
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
    });
    let manufacturerId = (manufacturerEnt && manufacturerEnt.manufacturer_id) || formData[this._manufacturerModel];
    let apiCall = manufacturerId
      ? this._manufacturerModel.edit(manufacturerId, formData)
      : this._manufacturerModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/manufacturer');
        }

        if (this._btnType === 'save' && !manufacturerId) {
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
        if (!manufacturerEnt && !willRedirect && !alerts.length) {
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
    let { manufacturerEnt, noEdit } = this.props;
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
                <b>{manufacturerEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} nhà sản xuất {manufacturerEnt ? manufacturerEnt.manufacturer_name : ''}</b>
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
                  validate={this.handleFormikValidate}
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
                              <Label for="manufacturer_name"  sm={3}>
                                Tên nhà sản xuất<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="manufacturer_name"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="manufacturer_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="phone_number" sm={3}>
                                Số điện thoại
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="phone_number"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="phone_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="manufacturer_address" sm={3}>
                                Địa chỉ
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="manufacturer_address"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="manufacturer_address" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="email" sm={3}>
                                Email
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="email"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    id="email"
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="email" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>
                          <Col xs={12}>
                            <FormGroup row>
                              <Label for="website" sm={3}>
                                Website
                              </Label>
                              <Col sm={9}>
                                <Field
                                  name="website"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    placeholder=""
                                    id="website"
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="website" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
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
                                    <CheckAccess permission="MD_MANUFACTURER_EDIT">
                                      <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/manufacturer/edit/${manufacturerEnt.manufacturer_id}`)}>
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
                                <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/manufacturer')} className="btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-times-circle mr-1" />Đóng
                                </Button>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
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

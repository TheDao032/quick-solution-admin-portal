import React, { PureComponent } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
  Alert,
  CustomInput,
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
} from 'reactstrap';

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';

// Model(s)
import ContractTypeModel from '../../models/ContractTypeModel';
/**
 * @class ContractTypeAdd
 */
export default class ContractTypeAdd extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._contractTypeModel = new ContractTypeModel();

    /** @var {Array} */
    this.primaryKey = this._contractTypeModel._entity.primaryKey

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    this.state = {
      /** @var {number} */
      _id: 0,
      /** @var {Boolean} */
      ready: true,
      /** @var {Array} */
      alerts: [],
    };
  }

  /**
   * 
   * @return {Object}
   */
  getInitialValues() {
    let { contractTypeEnt } = this.props;
    let values = Object.assign(
      {}, this._contractTypeModel.fillable(),
    );
    if (contractTypeEnt) {
      Object.assign(values, contractTypeEnt);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // if (key === '') {}
    });

    // Return;
    return values;
  }

  formikValidationSchema = Yup.object().shape({
    contract_type_name: Yup.string()
      .required("Loại hợp đồng là bắt buộc."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
  }

  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    window.scrollTo(0, 0);
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { contractTypeEnt } = this.props;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let formData = Object.assign({}, values, {
      is_active: (1 * values.is_active),
      is_system: (1 * values.is_system),
      is_freeze: (1 * values.is_freeze),
      is_tranfer: (1 * values.is_tranfer),
      is_contract_pt: (1 * values.is_contract_pt),
    });
    // console.log('formData: ', formData);
    //
    let contractTypeId = (contractTypeEnt && contractTypeEnt[this.primaryKey] ) || formData[this.primaryKey];
    let apiCall = contractTypeId
      ? this._contractTypeModel.update(contractTypeId, formData)
      : this._contractTypeModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/contract-types');
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
        if (!contractTypeEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { contractTypeEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: []
    }));
    // Get bundle data --> ready data
    (async () => {
      this.setState({ ready: true });
    })();
    //.end
  }

  handleFormikValidate = (values) => {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      (typeof values[prop] === "string") && (values[prop] = values[prop].trim());
    });
  }

  render() {
    let {
      _id,
      alerts,
    } = this.state;
    let { contractTypeEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();

    return (
      <div id="contract-type-div" key={`view-${_id}`} className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{contractTypeEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} loại hợp đồng {contractTypeEnt ? `"${contractTypeEnt.contract_type_name}"` : ''}</b>
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
                  validateOnBlur={false}
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    handleSubmit,
                    handleReset,
                    isSubmitting,
                  } = (this.formikProps = window._formikProps = formikProps);
                  // [Event]
                  this.handleFormikBeforeRender({ initialValues });
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="mt-4">
                        <Col xs={12} sm={12}>
                          <FormGroup row>
                            <Label sm={3}>
                              Tên Loại hợp đồng<span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={9}>
                              <Field
                                name="contract_type_name"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id={field.name}
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="contract_type_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={12}>
                          <FormGroup>
                            <Row>
                              <Label sm={3} />
                              <Col sm={9}>
                                <Field
                                  name="is_freeze"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_freeze}
                                    type="switch"
                                    id={field.name}
                                    label="Là loại hợp đồng chuyển nhượng"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={12}>
                          <FormGroup>
                            <Row>
                              <Label sm={3} />
                              <Col sm={9}>
                                <Field
                                  name="is_tranfer"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_tranfer}
                                    type="switch"
                                    id={field.name}
                                    label="Là loại hợp đồng bảo lưu"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={12}>
                          <FormGroup>
                            <Row>
                              <Label sm={3} />
                              <Col sm={9}>
                                <Field
                                  name="is_contract_pt"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_contract_pt}
                                    type="switch"
                                    id={field.name}
                                    label="Là loại hợp đồng PT"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={12}>
                          <FormGroup>
                            <Row>
                              <Label sm={3}>
                                Mô tả
                              </Label>
                              <Col sm={9}>
                                  <Field
                                    name="description"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="textarea"
                                      id={field.name}
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={12}>
                          <FormGroup>
                            <Row>
                              <Label sm={3} />
                              <Col sm={9}>
                                <Field
                                  name="is_active"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left mr-5"
                                    onBlur={null}
                                    checked={values.is_active}
                                    type="switch"
                                    id={field.name}
                                    label="Là loại hợp đồng PT"
                                    disabled={noEdit}
                                  />}
                                />
  
                                <Field
                                  name="is_system"
                                  render={({ field /* _form */ }) => <CustomInput
                                    {...field}
                                    className="pull-left"
                                    onBlur={null}
                                    checked={values.is_system}
                                    type="switch"
                                    id={field.name}
                                    label="Là loại hợp đồng PT"
                                    disabled={noEdit}
                                  />}
                                />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col sm={12} className="text-right">
                          {noEdit ? (
                            <CheckAccess permission="CT_CONTRACT_EDIT">
                              <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/contract-types/edit/${contractTypeEnt[this.primaryKey]}`)}>
                                <i className="fa fa-edit mr-1" />Chỉnh sửa
                              </Button>
                            </CheckAccess>
                          ) : ([
                              <Button
                                key="buttonSave"
                                type="submit"
                                color="primary"
                                disabled={isSubmitting || noEdit}
                                onClick={() => this.handleSubmit('save')}
                                className="mr-2 btn-block-sm"
                              >
                                <i className="fa fa-save mr-2" />Lưu
                              </Button>,
                              <Button
                                key="buttonSaveClose"
                                type="submit"
                                color="success"
                                disabled={isSubmitting || noEdit}
                                onClick={() => this.handleSubmit('save_n_close')}
                                className="mr-2 btn-block-sm mt-md-0 mt-sm-2"
                              >
                                <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                              </Button>
                            ])
                          }
                            <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/contract-types')} className="btn-block-sm mt-md-0 mt-sm-2">
                              <i className="fa fa-close" />
                              <span className="ml-1">Đóng</span>
                            </Button>
                        </Col>
                      </Row>
                    </Form>
                  );
                }}</Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

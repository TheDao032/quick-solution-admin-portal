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
import Select from "react-select";

// Component(s)
import Loading from "../Common/Loading";
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)
import StatusDataLeadModel from "../../models/StatusDataLeadModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";

// Util(s)
import { mapDataOptions4Select } from "../../utils/html";

/**
 * @class SegmentAdd
 */
export default class StatusDataLeadAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._statusDataLeadModel = new StatusDataLeadModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      companies: [{ label: "-- Chọn --", value: "" }],
      /** @var {Array} */
      businessArr: [{ label: "-- Chọn --", value: "" }],

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
    status_name: Yup.string().required("Tên trạng thái là bắt buộc."),
    company_id: Yup.string().required("Công ty áp dụng là bắt buộc."),
    business_id: Yup.string().required("Cơ sở áp dụng là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { StatusDataLeadEnt } = this.props;
    let values = Object.assign({}, this._statusDataLeadModel.fillable());
    console.log('getInitialValues')
    console.log(StatusDataLeadEnt)
    if (StatusDataLeadEnt) {
      Object.assign(values, StatusDataLeadEnt);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // if (key === '') {}
    });
    console.log(values)
    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { StatusDataLeadEnt } = this.props;
    let bundle = {};
    let all = [
      // @TODO
      this._companyModel
        .getOptions({ is_active: 1 })
        .then(data => (bundle["companies"] = mapDataOptions4Select(data)))
    ];
    if (StatusDataLeadEnt && StatusDataLeadEnt.company_id) {
      all.push(
        this._businessModel
          .getOptions({ parent_id: StatusDataLeadEnt.company_id })
          .then(data => (bundle["businessArr"] = mapDataOptions4Select(data)))
      );
    }
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

  handleChangeCompany(changeValue) {
    let { values, setValues } = this.formikProps;
    let { value: company_id } = changeValue;
    this._businessModel
      .getOptions({ parent_id: company_id || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr, company: changeValue });
        setValues(
          Object.assign(values, {
            company_id,
            department_id: ""
          })
        );
      });
  }

  handleSubmit(btnType) {
    console.log('handleSubmit');
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    console.log(submitForm);
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
    console.log('handleFormikSubmit');
    let { StatusDataLeadEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      is_won: (values.order === 1) ? 1 : 0,
      is_lost: (values.order === 2) ? 1 : 0,
      is_system: 1 * values.is_system
    });
    let _statusDataLeadsId =
      (StatusDataLeadEnt && StatusDataLeadEnt.status_data_leads_id) ||
      formData[this._statusDataLeadModel];
    let apiCall = _statusDataLeadsId
      ? this._statusDataLeadModel.edit(_statusDataLeadsId, formData)
      : this._statusDataLeadModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/status-data-lead");
        }

        if (this._btnType === "save" && !_statusDataLeadsId) {
          resetForm();
          this.setState({ company: null });
        }

        // Chain
        return data;
      })
      .catch(apiData => {
        // NG
        let { errors, statusText, message } = apiData;
        let msg = [`<b>${statusText || message}</b>`].concat(errors || []).join("<br/>");
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        //
        if (!StatusDataLeadEnt && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }

        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      });
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: true,
      alerts: []
    }));
  }

  render() {
    let { _id, ready, alerts, companies, businessArr, company } = this.state;
    let { StatusDataLeadEnt, noEdit } = this.props;
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
                <b>{StatusDataLeadEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} trạng thái khách hàng tiềm năng {StatusDataLeadEnt ? StatusDataLeadEnt.status_name : ''}</b>
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
                        <Col xs={12}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="status_name" sm={3}>
                                  Tên trạng thái{" "}
                                  <span className="font-weight-bold red-text">
                                    *
                                  </span>
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="status_name"
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
                                    name="status_name"
                                    component={({ children }) => (
                                      <Alert color="danger" className="field-validation-error">{children}</Alert>
                                    )}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs="12">
                              <FormGroup>
                                <Row>
                                  <Label sm={3}>
                                    Công ty áp dụng
                                    <span className="font-weight-bold red-text"> * </span>
                                  </Label>
                                  <Col sm={9}>
                                    <Field
                                      name="company_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = companies.find(
                                          ({ value }) =>
                                            1 * value === 1 * field.value
                                        );
                                        let placeholder =
                                          (companies[0] &&
                                            companies[0].label) ||
                                          "";
                                        return (
                                          <Select
                                            name={field.name}
                                            onChange={changeValue =>
                                              this.handleChangeCompany(
                                                changeValue
                                              )
                                            }
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={companies}
                                            value={company}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage
                                      name="company_id"
                                      component={({ children }) => (
                                        <Alert color="danger" className="field-validation-error">{children}</Alert>
                                      )}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={3}>
                                    Cơ sở áp dụng
                                    <span className="font-weight-bold red-text">
                                      *
                                    </span>
                                  </Label>
                                  <Col sm={9}>
                                    <Field
                                      key={`business_id_of_${values.company_id}`}
                                      name="business_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = businessArr.find(
                                          ({ value }) =>
                                            1 * value === 1 * field.value
                                        );
                                        let placeholder =
                                          (businessArr[0] &&
                                            businessArr[0].label) ||
                                          "";
                                        return (
                                          <Select
                                            name={field.name}
                                            onChange={({ value }) =>
                                              field.onChange({
                                                target: {
                                                  name: field.name,
                                                  value
                                                }
                                              })
                                            }
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={businessArr}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage
                                      name="business_id"
                                      component={({ children }) => (
                                        <Alert color="danger" className="field-validation-error">{children}</Alert>
                                      )}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <Row>
                                <Label sm={3}></Label>
                                <Col xs={9} key={`order-is_won`}>
                                  <FormGroup check>
                                    <Label check>
                                      <Field
                                        name="order"
                                        render={({ field }) => <Input
                                          {...field}
                                          onBlur={null}
                                          value={1}
                                          defaultChecked={(values.is_won === 1) ? `checked` : ``}
                                          type="radio"
                                          id={`is_won`}
                                          disabled={noEdit}
                                        />}
                                      /> {" là trạng thái chốt được đơn hàng thành công"}
                                    </Label>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Label sm={3}></Label>
                                <Col xs={9} key={`order-is_lost`}>
                                  <FormGroup check>
                                    <Label check>
                                      <Field
                                        name="order"
                                        render={({ field }) => <Input
                                          {...field}
                                          onBlur={null}
                                          value={2}
                                          defaultChecked={(values.is_lost === 1) ? `checked` : ``}
                                          type="radio"
                                          id={`is_lost`}
                                          disabled={noEdit}
                                        />}
                                      /> {" là trạng thái không chốt đơn hàng"}
                                    </Label>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="ward_id" sm={3}></Label>
                                    <Col sm={4}>
                                      <Field
                                        name="is_active"
                                        render={({ field }) => (
                                          <CustomInput
                                            {...field}
                                            className="pull-left"
                                            onBlur={null}
                                            checked={values.is_active}
                                           // defaultChecked={(values.business_id !== "") ? values.is_active : 1}
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
                                        {
                                          noEdit ? (
                                            <CheckAccess permission="AM_STATUSDATALEAD_EDIT">
                                            <Button color="primary" className="mr-2 btn-block-sm"
                                            onClick={() => window._$g.rdr(`/status-data-lead/edit/${StatusDataLeadEnt && StatusDataLeadEnt.id()}`)}>
                                              <i className="fa fa-edit mr-1" />Chỉnh sửa
                                              </Button>
                                              </CheckAccess>
                                          ) :
                                            [
                                              <Button
                                                type="submit"
                                                color="primary"
                                                disabled={isSubmitting}
                                                onClick={() =>
                                                  this.handleSubmit("save")
                                                }
                                                className="ml-3"
                                              >
                                                <i className="fa fa-edit" />
                                                <span className="ml-1">Lưu</span>
                                              </Button>,
                                              <Button
                                                type="submit"
                                                color="success"
                                                disabled={isSubmitting}
                                                onClick={() =>
                                                  this.handleSubmit("save_n_close")
                                                }
                                                className="ml-3"
                                              >
                                                <i className="fa fa-edit" />
                                                <span className="ml-1">
                                                  Lưu &amp; Đóng
                                            </span>
                                              </Button>
                                            ]
                                        }
                                        <Button
                                          disabled={isSubmitting}
                                          onClick={() =>
                                            window._$g.rdr("/status-data-lead")
                                          }
                                          className="ml-3"
                                        >
                                          <i className="fa fa-close" />
                                          <span className="ml-1">Đóng</span>
                                        </Button>
                                      </div>
                                    </Col>
                                  </FormGroup>
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

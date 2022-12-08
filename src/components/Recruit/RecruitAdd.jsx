import React, { Component } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from 'moment';
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
  CustomInput, 
} from "reactstrap";
import Select from "react-select";
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
// Component(s)
import Loading from "../Common/Loading";
import RichEditor from "../Common/RichEditor";
import { DateRangePicker } from 'react-dates'
import { CheckAccess } from '../../navigation/VerifyAccess'
import "react-image-lightbox/style.css"; 
import "../Products/styles.scss";
// Assets
import "./styles.scss";
// Model(s)
import RecruitModel from "../../models/RecruitModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";
import PositionModel from '../../models/PositionModel';
// Util(s)
import { mapDataOptions4Select, MOMENT_FORMAT_DATE, readImageBase64CallBack } from "../../utils/html";

/**
 * @class SegmentAdd
 */
export default class RecruitAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._recruitModel = new RecruitModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
    this._positionModel = new PositionModel();
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
      /** @var {Array}*/
      position:  [{ label: "-- Chọn --", value: "" }],
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
    recruit_title: Yup.string().required("Tên trạng thái là bắt buộc."),
    company_id: Yup.string().required("Công ty áp dụng là bắt buộc."),
    business_id: Yup.string().required("Cơ sở áp dụng là bắt buộc."),
    position_id: Yup.string().required("Vị trí tuyển dụng là bắt buộc."),
    quantity: Yup.number()
      .min(0, "Số lượng bắt buộc lớn hơn hoặc bằng 0")
      .required("Số lượng là bắt buộc."),
    salary_from: Yup.string().required("Mức lương từ là bắt buộc."),
    salary_to: Yup.string().required("Mức lương đến là bắt buộc."),
    start_date: Yup.string().required("Thời gian tuyển dụng từ là bắt buộc."),
    end_date: Yup.string().required("Thời gian tuyển dụng đến là bắt buộc."), 
    recruit_content: Yup.string().required("Mô tả chi tiết là bắt buộc."),
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { RecruitEnt } = this.props;
    let values = Object.assign({}, this._recruitModel.fillable());

    if (RecruitEnt) {
      Object.assign(values, RecruitEnt);
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

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { RecruitEnt } = this.props;
    let bundle = {};
    let all = [
      // @TODO
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle["companies"] = mapDataOptions4Select(data))),
      this._positionModel.getOptions()
        .then(data => (bundle['position'] = mapDataOptions4Select(data)) ),
    ];
    if (RecruitEnt && RecruitEnt.company_id) {
      all.push(
        this._businessModel.getOptions({ parent_id: RecruitEnt.company_id })
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
    let { RecruitEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data

    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
    });
    let _recruitId =
      (RecruitEnt && RecruitEnt.recruit_id) ||
      formData[this._recruitModel];
    let apiCall = _recruitId
      ? this._recruitModel.edit(_recruitId, formData)
      : this._recruitModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/recruit");
        }

        if (this._btnType === "save" && !_recruitId) {
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
        if (!RecruitEnt && !willRedirect && !alerts.length) {
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
    let { _id, ready, alerts, companies, businessArr, company, position } = this.state;
    let { RecruitEnt, noEdit } = this.props;
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
                <b>{RecruitEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} tin tuyển dụng {RecruitEnt ? RecruitEnt.recruit_title : ''}</b>
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
                              <FormGroup>
                                <Row>
                                  <Label sm={3} className="text-right">
                                    Công ty áp dụng <span className="font-weight-bold red-text"> * </span>
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
                                          (companies[0] && companies[0].label) ||"";
                                        return (
                                          <Select
                                            name={field.name}
                                            onChange={changeValue =>
                                              this.handleChangeCompany(
                                                changeValue
                                              )}
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
                                    <ErrorMessage name="company_id"  component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                           
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label sm={3} className="text-right">
                                    Cơ sở áp dụng <span className="font-weight-bold red-text"> * </span>
                                  </Label>
                                  <Col sm={9}>
                                    <Field
                                      key={`business_id_of_${values.business_id}`}
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
                              <FormGroup row>
                                <Label for="recruit_title" sm={3} className="text-right"> Tiêu đề tin tuyển dụng{" "} <span className="font-weight-bold red-text"> * </span> </Label>
                                <Col sm={9}>
                                  <Field
                                    name="recruit_title"
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
                                  <ErrorMessage name="recruit_title" component={({ children }) => (<Alert color="danger" className="field-validation-error">{children}</Alert> )}/>
                                </Col>
                              </FormGroup>
                            </Col>
                           
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label for="position_id" sm={3} className="text-right"> Vị trí tuyển dụng <span className="font-weight-bold red-text"> * </span> </Label>
                                  <Col sm={9}>
                                    <Field key={`position_id_of_${values.company_id}`}
                                      name="position_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = position.find(
                                          ({ value }) => 1 * value === 1 * field.value
                                        );
                                        let placeholder = (position[0] && position[0].label) || "";
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
                                            options={position}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="position_id" component={({ children }) => (<Alert color="danger" className="field-validation-error">{children}</Alert>)}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                            
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="quantity" sm={3} className="text-right"> Số lượng {" "} <span className="font-weight-bold red-text"> * </span> </Label>
                                <Col sm={9}>
                                  <Field
                                    name="quantity"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="number"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                  <ErrorMessage name="quantity" component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="salary_from"  className="text-right" sm={3}> Mức lương từ {" "} <span className="font-weight-bold red-text"> * </span> </Label>
                                <Col sm={3}>
                                  <Field
                                    name="salary_from"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="number"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                  <ErrorMessage name="salary_from" component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )} />
                                </Col>

                                <Label for="salary_to" sm={1}  className="text-right"> Đến </Label>
                                <Col sm={3}>
                                  <Field
                                    name="salary_to"
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        onBlur={null}
                                        type="number"
                                        placeholder=""
                                        disabled={noEdit}
                                      />
                                    )}
                                  />
                                  <ErrorMessage name="salary_to" component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                                <FormGroup row>
                                  <Label className="text-right" sm={3}> Thời gian tuyển dụng  {" "} <span className="font-weight-bold red-text"> * </span> </Label>
                                  <Col sm={4}>
                                    <Field
                                      name="start_and_end_date"
                                      render={({ field, form }) => {
                                        return (
                                          <DateRangePicker
                                            startDate={values.start_date ? moment(values.start_date, MOMENT_FORMAT_DATE) : undefined}
                                            startDateId="start_date" // PropTypes.string.isRequired,
                                            endDate={values.end_date ? moment(values.end_date, MOMENT_FORMAT_DATE) : undefined}
                                            endDateId="end_date" // PropTypes.string.isRequired,
                                            onDatesChange={({ startDate, endDate }) => {
                                              let start_date = (startDate && startDate.format(MOMENT_FORMAT_DATE)) || "";
                                              let end_date = (endDate && endDate.format(MOMENT_FORMAT_DATE)) || "";
                                              form.setValues(Object.assign(form.values, {
                                                start_date, end_date, [field.name]: [startDate, endDate]
                                              }));
                                            }} // PropTypes.func.isRequired,
                                            focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                            onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                                            disabled={noEdit}
                                            displayFormat={MOMENT_FORMAT_DATE}
                                          />
                                        );
                                      }}
                                    />
                                    <div className="pull-left w-100">
                                      <ErrorMessage name="start_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                                      <ErrorMessage name="end_date" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                                    </div>
                                  </Col> 
                                </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label for="recruit_content" sm={3} className="text-right" > Mô tả chi tiết {" "} <span className="font-weight-bold red-text"> * </span></Label>
                                  <Col sm={9}>
                                    <RichEditor
                                      disable={noEdit}
                                      setContents={values.recruit_content}
                                      onChange={(content) => formikProps.setFieldValue("recruit_content", content)}
                                    />
                                    <ErrorMessage name="recruit_content" component={({ children }) => <Alert className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
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
                                            <CheckAccess permission="HR_RECRUIT_EDIT">
                                            <Button key="buttonEdit"  color="primary" className="mr-2 btn-block-sm"
                                            onClick={() => window._$g.rdr(`/recruit/edit/${RecruitEnt && RecruitEnt.id()}`)}>
                                              <i className="fa fa-edit mr-1" />Chỉnh sửa
                                              </Button>
                                              </CheckAccess>
                                          ) :
                                            [
                                              <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit("save") } className="ml-3"
                                              >
                                                <i className="fa fa-edit" />
                                                <span className="ml-1">Lưu</span>
                                              </Button>,
                                              <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() =>
                                                  this.handleSubmit("save_n_close") }
                                                className="ml-3"
                                              >
                                                <i className="fa fa-edit" />
                                                <span className="ml-1">
                                                  Lưu &amp; Đóng
                                            </span>
                                              </Button>
                                            ]
                                        }
                                        <Button  disabled={isSubmitting} onClick={() => window._$g.rdr("/recruit") } className="ml-3" >
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

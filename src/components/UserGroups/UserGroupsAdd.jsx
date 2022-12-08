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
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from "../Common/Loading";

// Model(s)
import UserGroupModel from "../../models/UserGroupModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";
// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

//import UserGroupModel from "models/UserGroupModel/index";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class SegmentAdd
 */
export default class UserGroupsAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._userGroupsModel = new  UserGroupModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
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
    user_group_name: Yup.string().required("Tên nhóm là băt buộc."),
    order_index: Yup.number()
      .min(0, "Thứ tự bắt buộc lớn hơn hoặc bằng 0")
      .required("Thứ tự là bắt buộc."),
    company_id: Yup.string().required("Công ty áp dụng là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { UserGroupEnti } = this.props;
    let values = Object.assign({}, this._userGroupsModel.fillable());
    if (UserGroupEnti) {
      Object.assign(values, UserGroupEnti);
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
    let { UserGroupEnti } = this.props;
    let bundle = {};
    let all = [
      // @TODO
      this._companyModel
        .getOptions({ is_active: 1 })
        .then(data => (bundle["companies"] = mapDataOptions4Select(data)))
    ];
    if (UserGroupEnti && UserGroupEnti.company_id) {
      all.push(
        this._businessModel
          .getOptions({ parent_id: UserGroupEnti.company_id })
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

  handleFormikSubmit(values, formProps) {
    let { UserGroupEnti } = this.props;
    let { setSubmitting, resetForm } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    let formData = Object.assign({}, values, {
      order_index: '' + values.order_index,
      is_active: 1 * values.is_active,
      is_system: 1 * values.is_system,
      user_group_functions: []
    });
    let _userGroupId = (UserGroupEnti && UserGroupEnti.user_group_id) ||
      formData[this._userGroupsModel];

    let apiCall = _userGroupId
      ? this._userGroupsModel.edit(_userGroupId, formData)
      : this._userGroupsModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/user-groups");
        }

        if (this._btnType === "save" && !_userGroupId) {
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
        if (!UserGroupEnti && !willRedirect && !alerts.length) {
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
    let { UserGroupEnti, noEdit } = this.props;
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
                <b>{UserGroupEnti ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} nhóm người dùng {UserGroupEnti ? UserGroupEnti.user_group_name : ''}</b>
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
                                <Label for="user_group_name" sm={3}>
                                  Tên nhóm {" "}
                                  <span className="font-weight-bold red-text">
                                    *
                                  </span>
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="user_group_name"
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
                                  <ErrorMessage name="user_group_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="order_index" sm={3}>
                                  Thứ tự<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={9}>
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
                              <FormGroup>
                                <Row>
                                  <Label sm={3}>
                                    Công ty áp dụng
                                    <span className="font-weight-bold red-text">
                                      *
                                    </span>
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
                                        <Alert className="field-validation-error" color="danger">{children}</Alert>
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
                                        <Alert className="field-validation-error" color="danger">{children}</Alert>
                                      )}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                                <FormGroup row>
                                  <Label for="description" sm={3}>
                                    Mô tả
                                  </Label>
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
                                            defaultChecked={(values.user_group_id !== "") ? values.is_active : 1}
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
                                    <Label for="is_system" sm={3}></Label>
                                    <Col sm={4}>
                                      <Field
                                        name="is_system"
                                        render={({ field }) => (
                                          <CustomInput
                                            {...field}
                                            className="pull-left"
                                            onBlur={null}
                                            defaultChecked={values.is_system}
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
                              </Row>

                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="" sm={3}></Label>
                                    <Col sm={12} className="text-right">
                                      {
                                        noEdit?(
                                          <CheckAccess permission="AM_BUSINESSTYPE_EDIT">
                                            <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/user-groups/edit/${UserGroupEnti.id()}`)}
                                              disabled={(!userAuth._isAdministrator() && UserGroupEnti.is_system !== 0)}
                                            >
                                              <i className="fa fa-edit mr-1" />Chỉnh sửa
                                            </Button>
                                          </CheckAccess>
                                        ):
                                        [
                                          <Button type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit("save") } className="ml-3">
                                          <i className="fa fa-edit" /> Lưu
                                          </Button>,
                                          <Button type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit("save_n_close") } className="ml-3" >
                                            <i className="fa fa-edit" />   Lưu &amp; Đóng 
                                          </Button>
                                        ]
                                      }
                                      <Button disabled={isSubmitting} onClick={() => window._$g.rdr("/user-groups") } className="ml-3">
                                          <i className="fa fa-close" />
                                          <span className="ml-1">Đóng</span>
                                        </Button>
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

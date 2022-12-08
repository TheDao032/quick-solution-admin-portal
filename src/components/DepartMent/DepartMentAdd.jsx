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
  CustomInput,
  Table
} from "reactstrap";
import Select from "react-select";

import "./styles.scss";
// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from "../Common/Loading";

// Model(s)
import DepartmentModel from "../../models/DepartmentModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";

// Util(s)
import { mapDataOptions4Select } from "../../utils/html";

/**
 * @class SegmentAdd
 */
export default class DepartMentAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._departmentModel = new DepartmentModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);

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
      businessArr: [{ label: "-- Chọn --", value: "" }]
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
    department_name: Yup.string().required("Tên phòng ban là bắt buộc."),
    company_id: Yup.string().required("Trực thuộc công ty là bắt buộc.")
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { DepartmentEnti } = this.props;
    let values = Object.assign({}, this._departmentModel.fillable());
    if (DepartmentEnti) {
      Object.assign(values, DepartmentEnti);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
    });
    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { DepartmentEnti } = this.props;
    let bundle = {};
    let all = [
      // @TODO
      this._companyModel
        .getOptions({ is_active: 1 })
        .then(data => (bundle["companies"] = mapDataOptions4Select(data)))
    ];
    if (DepartmentEnti && DepartmentEnti.company_id) {
      all.push(
        this._businessModel
          .getOptions({ parent_id: DepartmentEnti.company_id })
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
    this.setState({ company: changeValue });
    setValues(
      Object.assign(values, {
        company_id,
        department_id: ""
      })
    );
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { DepartmentEnti } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];

    let _priorities = [];
     if(values.priorities !== undefined){
      let { priorities } = values;
      _priorities = priorities.map((item, priority) => ({
         department_id: '' + (item.id || item.department_id),
         priority
      }))
     }

    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      priorities: _priorities
    });


    let _departmentId =
      (DepartmentEnti && DepartmentEnti.department_id) ||
      formData[this._departmentModel];
    let apiCall = _departmentId
      ? this._departmentModel.edit(_departmentId, formData)
      : this._departmentModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/department");
        }

        if (this._btnType === "save" && !_departmentId) {
          resetForm();
          this.setState({ company: null });
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
        if (!DepartmentEnti && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: true,
      alerts: []
    }));
  }

  handleSortTaskWorkflow(type, item) {
    let { values, handleChange } = this.formikProps;
    let { priorities: value } = values;
    let nextIdx = null;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    if ('up' === type) {
      nextIdx = Math.max(0, foundIdx - 1);
    }
    if ('down' === type) {
      nextIdx = Math.min(value.length - 1, foundIdx + 1);
    }
    if ((foundIdx !== nextIdx) && (null !== nextIdx)) {
      let _tempItem = value[foundIdx];
      value[foundIdx] = value[nextIdx];
      value[nextIdx] = _tempItem;
      handleChange({ target: { name: "priorities", value }});
    }
  }


  render() {
    let { _id, ready, alerts, companies, company } = this.state;
    let { DepartmentEnti, noEdit, detail } = this.props;
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
                <b>
                  {DepartmentEnti
                    ? `Chỉnh sửa phòng ban ${DepartmentEnti.department_name}` : "Thêm mới phòng ban"}
                </b>
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
                                <Label for="department_name" sm={3}>
                                  Tên phòng ban{" "}
                                  <span className="font-weight-bold red-text">
                                    *
                                  </span>
                                </Label>
                                <Col sm={9}>
                                  <Field
                                    name="department_name"
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
                                   <ErrorMessage name="department_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>

                            <Col xs="12">
                              <FormGroup>
                                <Row>
                                  <Label sm={3}>
                                    Trực thuộc công ty
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
                                     <ErrorMessage name="company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
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
                              {values.priorities !== undefined && values.priorities !== null ?
                                (<Col sm={12}>
                                <Row className="mb15">
                                  <Col xs={12}>
                                    <b className="underline">Thứ tự phòng ban ưu tiên</b>
                                  </Col>
                                </Row>
                                <FormGroup row id="priorities">
                                  <Table size="sm" bordered striped hover responsive>
                                    <thead>
                                      <tr>
                                        <th style={{ width: '75px', minWidth: '75px' }}><i className="fa fa-list" /></th>
                                        <th style={{ width: '85px', minWidth: '75px'  }}>Thứ tự</th>
                                        <th style={{}}>Tên phòng ban</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {values.priorities.map((item, idx) => {
                                        return item ? (
                                          <tr key={`priorities-${idx}`}>
                                            <th scope="row" className="text-center _sort">
                                              <Button size="sm" color="primary" className="mr-1"
                                                disabled={(0 === idx) || noEdit}
                                                onClick={(evt) => this.handleSortTaskWorkflow('up', item, evt)}
                                              >
                                                <i className="fa fa-arrow-up" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                color="success"
                                                disabled={((values.priorities.length - 1) === idx) || noEdit}
                                                onClick={(evt) => this.handleSortTaskWorkflow('down', item, evt)}
                                              >
                                                <i className="fa fa-arrow-down" />
                                              </Button>
                                            </th>
                                            <td className="text-center">
                                              {idx + 1}{/*item.order_index*/}
                                            </td>
                                            <td className="">
                                              {item.name || item.department_name}
                                            </td>
                                          </tr>
                                        ) : null;
                                      })}
                                      {!values.priorities.length ? (
                                        <tr><td colSpan={100}>&nbsp;</td></tr>
                                      ) : null}
                                    </tbody>
                                  </Table>
                                </FormGroup>
                                </Col>) : null}
                          </Row>
                          <Row>
                            <Col sm={12} className="mt-2">
                              <Row>
                                <Col sm={12} className="text-right">
                                  {
                                    noEdit?(
                                      <CheckAccess permission="MD_DEPARTMENT_EDIT">
                                        <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/department/edit/${DepartmentEnti.id()}`)}>
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
                                  <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/department')} className="btn-block-sm mt-md-0 mt-sm-2">
                                    <i className="fa fa-times-circle mr-1" />Đóng
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

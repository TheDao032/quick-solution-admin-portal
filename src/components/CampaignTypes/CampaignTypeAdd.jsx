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
  // Media,
  // InputGroupText,
  // InputGroup,
  // InputGroupAddon,
  CustomInput,
  Table
} from "reactstrap";
import Select from "react-select";

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';
import * as utils from '../../utils';

// Model(s)
import CampaignTypeModel from "../../models/CampaignTypeModel";
import CampaignReviewLevelModel from "../../models/CampaignReviewLevelModel";
import FunctionModel from "../../models/FunctionModel";
import CompanyModel from "../../models/CompanyModel";
import DepartmentModel from "../../models/DepartmentModel";
import UserModel from "../../models/UserModel";

/**
 * @class CampaignTypeAdd
 */
export default class CampaignTypeAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._campaignTypeModel = new CampaignTypeModel();
    this._campaignRLvModel = new CampaignReviewLevelModel();
    this._functionModel = new FunctionModel();
    this._companyModel = new CompanyModel();
    this._departmentModel = new DepartmentModel();
    this._userModel = new UserModel();

    // Bind method(s)
    this.handleAddCampaignReviewLevel = this.handleAddCampaignReviewLevel.bind(this);
    this.handleChangeCRLCompany = this.handleChangeCRLCompany.bind(this);
    this.handleChangeCRLDepartment = this.handleChangeCRLDepartment.bind(this);
    this.handleChangeCRLUser = this.handleChangeCRLUser.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // Init state
    // +++
    // let { campaignTypeEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      functions: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      campaignRLvs: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      companies: [
        { label: "-- Công ty --", value: "" },
      ],
      /** @var {Object} */
      departmentsOf: {
        _: { label: "-- Phòng ban --", value: "" },
      },
      /** @var {Object} */
      usersOf: {
        _: { label: "-- Người duyệt --", value: "" },
      },
      /** @var {Array} */
      // campaign_type_relevels: [],
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

  /**
   * 
   * @return {Object}
   */
  getInitialValues() {
    let { campaignTypeEnt } = this.props;
    let values = Object.assign(
      {}, this._campaignTypeModel.fillable(),
    );
    if (campaignTypeEnt) {
      Object.assign(values, campaignTypeEnt);
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
    // let { campaignTypeEnt } = this.props;
    let bundle = {};
    let all = [
      this._functionModel.getOptions({ is_active: 1 })
        .then(data => (bundle['functions'] = mapDataOptions4Select(data))),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
      this._campaignRLvModel.getOptionsFull()
        .then(data => (bundle['campaignRLvs'] = mapDataOptions4Select(data)))
    ];
    await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ))
    ;
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  formikValidationSchema = Yup.object().shape({
    campaign_type_name: Yup.string().trim()
      // .min(2, 'Too Short!')
      // .max(70, 'Too Long!')
      .required("Tên loại chiến dịch là bắt buộc."),
    // description: Yup.string()
    //  .required("Mô tả là bắt buộc."),
    order_index: Yup.number()
      .min(0, "Thứ tự bắt buộc lớn hơn hoặc bằng 0")
      .required("Thứ tự là bắt buộc."),
    is_active: Yup.string()
      .required("Kích hoạt là bắt buộc."),
    is_auto_review: Yup.string()
      .required("Tự động duyệt là bắt buộc."),
    add_function_id: Yup.string()
     .required("Quyền thêm mới là bắt buộc."),
    edit_function_id: Yup.string()
     .required("Quyền chỉnh sửa là bắt buộc."),
  });

  handleAddCampaignReviewLevel(evt) {
    let { values, handleChange } = this.formikProps;
    let { campaign_type_relevels: value } = values;
    let item = this._campaignRLvModel.mkEnt();
    value.push(item);
    handleChange({ target: { name: "campaign_type_relevels", value }});
  }

  handleRemoveCampaignReviewLevel(item, evt) {
    let { values, handleChange } = this.formikProps;
    let { campaign_type_relevels: value } = values;
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    value.splice(foundIdx, 1);
    handleChange({ target: { name: "campaign_type_relevels", value }});
  }

  handleChangeCRLCompany(changeItem, reviewItem) {
    let { departmentsOf } = this.state;
    let { value: parent_id } = changeItem;
    const callback = () => this.setState({ departmentsOf: {...departmentsOf} });
    if (!departmentsOf[parent_id] && parent_id) {
      this._departmentModel.getOptions({ parent_id })
        .then(data => {
          let departments = mapDataOptions4Select(data);
          Object.assign(departmentsOf, { [parent_id]: departments });
          callback()
        });
    }
    callback();
  }

  handleChangeCRLDepartment(changeItem, reviewItem) {
    let { usersOf } = this.state;
    let { value: department_id } = changeItem;
    const callback = () => this.setState({ usersOf: {...usersOf} });
    if (!usersOf[department_id] && department_id) {
      this._userModel.getOptionsFull({ department_id })
        .then(data => {
          let users = mapDataOptions4Select(data);
          Object.assign(usersOf, { [department_id]: users });
          callback()
        });
    }
    callback()
  }

  handleChangeCRLUser(changeItem, reviewItem) {
    // ...
  }

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    // +++
    Object.assign(values, {
      // +++
    });
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
    let { campaignTypeEnt, handleFormikSubmitSucceed } = this.props;
    // let {} = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];

    if (values.campaign_type_relevels.length) {
      let checkAutoCompleteReview = values.campaign_type_relevels.find(({ is_complete_review }) => (1 * is_complete_review) === 1);
      if (!checkAutoCompleteReview) {
        window._$g.dialogs.alert(
          window._$g._('Không có mức duyệt cuối!'),
          window._$g._('Lỗi')
        )
        setSubmitting(false);
        return
      }
    }
    // Build form data
    // +++
    // let {} = values;
    // +++
    let formData = Object.assign({}, values, {
      order_index: '' + values.order_index,
      is_active: 1 * values.is_active,
      is_auto_review: 1 * values.is_auto_review,
      campaign_type_relevels: (1 * values.is_auto_review) ? undefined : values.campaign_type_relevels
    });
    // console.log('formData: ', formData);
    //
    let campaignTypeId = (campaignTypeEnt && campaignTypeEnt.id()) || formData[this._campaignTypeModel];
    let apiCall = campaignTypeId
      ? this._campaignTypeModel.update(campaignTypeId, formData)
      : this._campaignTypeModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        // Fire callback?
        if (handleFormikSubmitSucceed) {
          let cbData = Object.assign({ campaign_type_id: data }, formData);
          if (false === handleFormikSubmitSucceed(cbData)) {
            willRedirect = true;
          }
          return data;
        }
        //.end
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/campaign-types');
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
        if (!campaignTypeEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { campaignTypeEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  handleFormikValidate(values) {
    let errors = {};
    let { is_auto_review, campaign_type_relevels } = values;
    //
    if (!is_auto_review) {
      let errMsg = "Thông tin mức duyệt là bắt buộc.";
      if (!campaign_type_relevels.length) {
        errors.campaign_type_relevels = errMsg;
      } else {
        let isCompleteReviewCnt = 0;
        let isLastCompleteReviewYes = campaign_type_relevels.length
          && (1 * campaign_type_relevels[campaign_type_relevels.length - 1].is_complete_review)
        ;
        let reviewUsers = {}, reviewUsersErr = false;
        campaign_type_relevels.forEach((item) => {
          if (!errors.campaign_type_relevels) {
            if (utils.isVoid(item.review_order_index)
              || utils.isVoid(item.department_id)
              || utils.isVoid(item.user_name)
              || (!item.user_name.length)
            ) {
              errors.campaign_type_relevels = errMsg;
            }
            if (1 * item.is_complete_review) {
              isCompleteReviewCnt += 1;
            }
            if (item.user_name) {
              reviewUsers[item.user_name] = (reviewUsers[item.user_name] || 0) + 1;
              if (reviewUsers[item.user_name] > 1) {
                reviewUsersErr = true;
              }
            }
          }
        });
        if (!errors.campaign_type_relevels) {
          if (isCompleteReviewCnt !== 1 || !isLastCompleteReviewYes) {
            errors.campaign_type_relevels = (errMsg = `Bắt buộc phải có một mức duyệt là "Mức duyệt cuối" nằm ở ví trí cuối cùng trong danh sách mức duyệt.`);
          }
        }
        if (!errors.campaign_type_relevels && reviewUsersErr) {
          errors.campaign_type_relevels = (errMsg = `Thông tin người duyệt không được phép trùng.`);
        }
      }
    }
    return errors;
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      functions,
      campaignRLvs,
      companies,
      departmentsOf,
      usersOf
    } = this.state;
    let { campaignTypeEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{campaignTypeEnt ? 'Chỉnh sửa' : 'Thêm mới'} loại chiến dịch {campaignTypeEnt ? campaignTypeEnt.campaign_type_name : ''}</b>
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
                  // validateOnChange={false}
                  onSubmit={this.handleFormikSubmit}
                >{(formikProps) => {
                  let {
                    values,
                    // errors,
                    // status,
                    // touched, handleChange, handleBlur,
                    // submitForm,
                    // resetForm,
                    handleSubmit,
                    handleReset,
                    // isValidating,
                    isSubmitting,
                    /* and other goodies */
                  } = (this.formikProps = window._formikProps = formikProps);
                  // [Event]
                  this.handleFormikBeforeRender({ initialValues });
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="mb15">
                        <Col xs={12}>
                          <b className="underline">Thông tin loại chiến dịch</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} sm={6}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="campaign_type_name" sm={4}>
                                  Tên loại chiến dịch<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="campaign_type_name"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id={field.name}
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="campaign_type_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="order_index" sm={4}>
                                  Thứ tự<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
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
                              <FormGroup row>
                                <Label for="description" sm={4}>
                                  Mô tả
                                </Label>
                                <Col sm={8}>
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
                                  <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="is_active" sm={4}></Label>
                                <Col sm={8}>
                                  <Field
                                    name="is_active"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_active}
                                      type="switch"
                                      id={field.name}
                                      label="Kích hoạt?"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                        <Col xs={12} sm={6}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="add_function_id" sm={4}>
                                  Quyền thêm mới<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="add_function_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = functions.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (functions[0] && functions[0].label) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={functions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="add_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="edit_function_id" sm={4}>
                                  Quyền chỉnh sửa<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="edit_function_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = functions.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (functions[0] && functions[0].label) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={functions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="edit_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="delete_function_id" sm={4}>
                                  Quyền xóa
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="delete_function_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = functions.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (functions[0] && functions[0].label) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={functions}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="delete_function_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row className="mb15">
                        <Col xs={12}>
                          <b className="underline">Thông tin mức duyệt</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <FormGroup row>
                            <Label for="is_auto_review" sm={0}></Label>
                            <Col sm={12}>
                              <Field
                                name="is_auto_review"
                                render={({ field /* _form */ }) => <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_auto_review}
                                  type="switch"
                                  id={field.name}
                                  label="Tự động duyệt?"
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="is_auto_review" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <FormGroup row hidden={values.is_auto_review}>
                            <Table size="sm" bordered striped hover>
                              <thead>
                                <tr>
                                  <th style={{ width: '1%' }}>#</th>
                                  <th style={{ minWidth: '256px' }}>Tên mức duyệt<span className="font-weight-bold red-text">*</span></th>
                                  <th style={{ minWidth: '96px', width: '128px', 'display': 'none' }} hidden>Thứ tự<span className="font-weight-bold red-text">*</span></th>
                                  <th>Mô tả</th>
                                  <th style={{ minWidth: '170px' }}>Công ty / Phòng ban<br/>Người duyệt<span className="font-weight-bold red-text">*</span></th>
                                  <th style={{ minWidth: '96px', width: '144px'  }}>Mức duyệt cuối?</th>
                                  <th style={{ width: '1%' }}>Xóa</th>
                                </tr>
                              </thead>
                              <tbody>
                                {values.campaign_type_relevels.map((item, idx) => {
                                  let {
                                    campaign_review_level_id,
                                    company_id,
                                    department_id,
                                    user_name = [],
                                  } = item;
                                  let campaignRLv = campaignRLvs.find(({ value }) => (1 * value) === (1 * campaign_review_level_id));
                                  //
                                  return item ? ([
                                    <tr key={`campaign_rlevel-0${idx}`}>
                                      <th scope="row" className="text-center align-middle" rowSpan="2">{idx + 1}</th>
                                      <td rowSpan={2} className="align-middle">
                                        <Field
                                          name={`campaign_rlevel_id_${idx}`}
                                          render={({ field/*, form*/ }) => {
                                            let defaultValue = campaignRLvs.find(({ value }) => (1 * value) === (1 * field.value));
                                            let placeholder = (campaignRLvs[0] && campaignRLvs[0].label) || '';
                                            return (
                                              <Select
                                                id={field.name}
                                                name={field.name}
                                                onChange={(changeItem) => {
                                                  let name = "campaign_type_relevels";
                                                  Object.assign(item, {
                                                    campaign_review_level_id: changeItem.value,
                                                    is_complete_review: changeItem.is_complete_review
                                                  });
                                                  field.onChange({ target: { name, value: values[name] } });
                                                }}
                                                isSearchable={true}
                                                placeholder={placeholder}
                                                defaultValue={defaultValue}
                                                options={campaignRLvs}
                                              />
                                            );
                                          }}
                                        />
                                      </td>
                                      <td style={{ display: 'none' }} hidden>
                                        <Field
                                          name={`campaign_rlevel_order_index_${idx}`}
                                          render={({ field /* _form */ }) => <Input
                                            {...field}
                                            onBlur={null}
                                            onChange={(evt) => Object.assign(item, { review_order_index: '' + evt.target.value })}
                                            type="number"
                                            id={field.name}
                                            defaultValue={item.review_order_index}
                                            placeholder=""
                                            className="text-right"
                                            min={0}
                                          />}
                                        />
                                      </td>
                                      <td colSpan={2}>
                                        {campaignRLv && campaignRLv.description}
                                      </td>
                                      <td className="text-center">
                                        <CustomInput
                                          id={`campaign_rlevel_order_index_${idx}`}
                                          readOnly
                                          checked={!!(campaignRLv && (1 * campaignRLv.is_complete_review))}
                                          type="switch"
                                          label=""
                                        />
                                      </td>
                                      <td className="text-center align-middle" rowSpan="2">
                                        <Button color="danger" size={"sm"} onClick={(event) => this.handleRemoveCampaignReviewLevel(item, event)}>
                                          <i className="fa fa-minus-circle" />
                                        </Button>
                                      </td>
                                    </tr>,
                                    <tr key={`campaign_rlevel-1${idx}`}>
                                      <td colSpan={3}>
                                        <Row className="no-gutters">
                                          <Col sm={6}>
                                            <Field
                                              name={`campaign_rlevel_company_id_${idx}`}
                                              render={({ field/*, form*/ }) => {
                                                let defaultValue = companies.find(({ value }) => (1 * value) === (1 * company_id));
                                                let placeholder = (companies[0] && companies[0].label) || '';
                                                return (
                                                  <Select
                                                    id={field.name}
                                                    name={field.name}
                                                    onChange={(changeItem) => {
                                                      this.handleChangeCRLCompany(changeItem, item);
                                                      Object.assign(item, { company_id: changeItem.value });
                                                      let name = "campaign_type_relevels";
                                                      field.onChange({ target: { name, value: values[name] } });
                                                    }}
                                                    isSearchable={true}
                                                    placeholder={placeholder}
                                                    defaultValue={defaultValue}
                                                    options={companies}
                                                  />
                                                );
                                              }}
                                            />
                                          </Col>
                                          <Col sm={6}>
                                            <Field
                                              key={`campaign_rlevel_department_id_${idx}${company_id}`}
                                              name={`campaign_rlevel_department_id_${idx}`}
                                              render={({ field/*, form*/ }) => {
                                                let options = [departmentsOf._].concat(departmentsOf[company_id] || []);
                                                let defaultValue = options.find(({ value }) => (1 * value) === (1 * department_id));
                                                let placeholder = (options[0] && options[0].label) || '';
                                                return (
                                                  <Select
                                                    id={field.name}
                                                    name={field.name}
                                                    onChange={(changeItem) => {
                                                      this.handleChangeCRLDepartment(changeItem, item);
                                                      Object.assign(item, { department_id: changeItem.value });
                                                      let name = "campaign_type_relevels";
                                                      field.onChange({ target: { name, value: values[name] } });
                                                    }}
                                                    isSearchable={true}
                                                    placeholder={placeholder}
                                                    defaultValue={defaultValue}
                                                    options={options}
                                                  />
                                                );
                                              }}
                                            />
                                          </Col>
                                          <Col sm={12} className="mt-1" hidden={!campaignRLv}>
                                            <Field
                                              key={`campaign_rlevel_user_name_${idx}${company_id}${department_id}`}
                                              name={`campaign_rlevel_user_name_${idx}`}
                                              render={({ field/*, form*/ }) => {
                                                let options = [].concat(usersOf[department_id] || []);
                                                let defaultValue = [];
                                                options.forEach((_optItem) => {
                                                  let uName = user_name.find((uName) => ('' + uName) === ('' + _optItem.user_name));
                                                  uName && defaultValue.push(_optItem);
                                                });
                                                let placeholder = (usersOf._ && usersOf._.label) || '';
                                                return (
                                                  <Select
                                                    id={field.name}
                                                    name={field.name}
                                                    isMulti
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    onChange={(changeItems) => {
                                                      // Format input
                                                      changeItems = ((changeItems instanceof Array) ? changeItems: [changeItems]).filter(_i => !!(_i && _i.value));
                                                      //
                                                      // field.onChange({ target: { type: "select", name: field.name, value: changeItems } });
                                                      this.handleChangeCRLUser(changeItems, item);
                                                      Object.assign(item, {
                                                        user_name: changeItems.map(({ user_name }) => user_name),
                                                        is_complete_review: campaignRLv.is_complete_review
                                                      });
                                                    }}
                                                    isSearchable={true}
                                                    placeholder={placeholder}
                                                    defaultValue={department_id && defaultValue}
                                                    options={options}
                                                  />
                                                );
                                              }}
                                            />
                                          </Col>
                                        </Row>
                                      </td>
                                    </tr>]
                                  ) : null;
                                })}
                                {!values.campaign_type_relevels.length ? (
                                  <tr><td colSpan={100}>&nbsp;</td></tr>
                                ) : null}
                              </tbody>
                            </Table>
                            <Col sm={12}>
                              <ErrorMessage name="campaign_type_relevels" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                            <Col sm={12}>
                              <Button onClick={this.handleAddCampaignReviewLevel}>
                                <i className="fa fa-plus-circle" /> Thêm
                              </Button>
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12} className="mt-2">
                          <Row>
                            <Col sm={12} className="text-right">
                              {
                                noEdit?(
                                  <CheckAccess permission="CRM_CAMPAIGNTYPE_EDIT">
                                    <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/campaign-types/edit/${campaignTypeEnt.id()}`)}>
                                      <i className="fa fa-edit mr-1" />Chỉnh sửa
                                    </Button>
                                  </CheckAccess>
                                ):
                                [
                                  (false !== this.props.handleActionSave) ? <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                    <i className="fa fa-save mr-2" />Lưu
                                  </Button> : null,
                                  (false !== this.props.handleActionSaveAndClose) ? <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                    <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                  </Button> : null
                                ]
                              }
                              <Button disabled={isSubmitting} onClick={this.props.handleActionClose || (() => window._$g.rdr('/campaign-types'))} className="btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-times-circle mr-1" />Đóng
                              </Button>
                            </Col>
                          </Row>
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
    );
  }
}

import React, { PureComponent } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import moment from 'moment';
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
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';
import Select from 'react-select';
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import { DateRangePicker } from 'react-dates'

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
// +++
import NumberFormat from '../Common/NumberFormat';
import CampaignTypeAdd from '../CampaignTypes/CampaignTypeAdd';
import CampaignReviewLevelAdd from './CampaignReviewLevelAdd';
import CampaignReviewLevelEdit from './CampaignReviewLevelEdit';

// Util(s)
import {
  mapDataOptions4Select,
  MOMENT_FORMAT_DATE
} from "../../utils/html";
// import * as utils from '../../utils';

// Model(s)
import CampaignModel from '../../models/CampaignModel';
import CampaignTypeModel from '../../models/CampaignTypeModel';
import CampaignStatusModel from '../../models/CampaignStatusModel';
import CompanyModel from '../../models/CompanyModel';
import BusinessModel from '../../models/BusinessModel';

/**
 * @class CampaignAdd
 */
export default class CampaignAdd extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._campaignModel = new CampaignModel();
    this._campaignTypeModel = new CampaignTypeModel();
    this._campaignStatusModel = new CampaignStatusModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.handleToggleCTA = this.handleToggleCTA.bind(this);
    this.handleFormikSubmitSucceedCTA = this.handleFormikSubmitSucceedCTA.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);
    this.handleChangeCampaignType = this.handleChangeCampaignType.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleApproveCRL = this.handleApproveCRL.bind(this);

    // Init state
    this.state = {
      /** @var {number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      willShowCampaignTypeAdd: false,
      /** @var {Object|null} */
      campaignType: undefined, // uses undefined NOT null
      /** @var {Array} */
      campaignTypes: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      campaigns: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      companies: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      campaignStatusArr: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      businessArr: [
        { label: "-- Chọn --", value: "" },
      ],
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
    let { campaignEnt } = this.props;
    let values = Object.assign(
      {}, this._campaignModel.fillable(),
    );
    if (campaignEnt) {
      Object.assign(values, campaignEnt);
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
   */
  _getBundleItemCampaignTypes() {
    let { campaignEnt } = this.props;
    if (campaignEnt) {
      let {
        campaign_type_name: label,
        campaign_type_id: value
      } = campaignEnt;
      return Promise.resolve([{ label, value }]);
    }
    return this._campaignTypeModel.getOptions4Create()
        .then(mapDataOptions4Select);
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { campaignEnt } = this.props;
    let bundle = {};
    let all = [
      this._campaignModel.getOptions({ exclude_id: (campaignEnt && campaignEnt.id()), is_active: 1, is_reviewed: 1, is_expired: 0 })
        .then(data => (bundle['campaigns'] = mapDataOptions4Select(data))),
      this._getBundleItemCampaignTypes()
        .then(data => (bundle['campaignTypes'] = data)),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
      this._campaignStatusModel.getOptions()
        .then(data => (bundle['campaignStatusArr'] = mapDataOptions4Select(data))),
    ];
    if (campaignEnt && campaignEnt.company_id) {
      all.push(
        this._businessModel.getOptions({ parent_id: campaignEnt.company_id })
          .then(data => (bundle['businessArr'] = mapDataOptions4Select(data)))
      );
    }
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
    campaign_name: Yup.string().trim()
      .required("Tên chiến dịch là bắt buộc."),
    campaign_type_id: Yup.string()
      .required("Loại chiến dịch là bắt buộc."),
    campaign_status_id: Yup.string()
      .required("Trạng thái là bắt buộc."),
    company_id: Yup.string()
      .required("Công ty áp dụng là bắt buộc."),
    business_id: Yup.string()
      .required("Cơ sở áp dụng là bắt buộc."),
    total_values: Yup.number()
      .min(1, "Ngân sách dự kiến là bắt buộc.")
      .required("Ngân sách dự kiến là bắt buộc."),
    description: Yup.string().trim()
      .required("Mô tả là bắt buộc."),
    is_active: Yup.string()
      .required("Kích hoạt là bắt buộc."),
  });

  handleToggleCTA() {
    let { willShowCampaignTypeAdd } = this.state;
    // toggle
    willShowCampaignTypeAdd = !willShowCampaignTypeAdd;
    // +++
    this.setState({ willShowCampaignTypeAdd });
  }

  handleFormikSubmitSucceedCTA(campaignTypeData) {
    //
    setTimeout(() => {
      this.setState({ willShowCampaignTypeAdd: false });
      // Refresh dropdownlist
      this._getBundleItemCampaignTypes()
        .then(campaignTypes => this.setState(
          { campaignTypes },
          // Auto trigger select "loai chien dich"
          () => this.handleChangeCampaignType({ value: campaignTypeData.campaign_type_id })
        ))
      ;
    });
    // Prevent default
    return false;
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
      business_id: values.company_id ? values.business_id : "",
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
    let { campaignEnt } = this.props;
    let { campaignType = {} } = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let { campaign_rls = [] } = campaignType;
    let campaign_review_list = campaign_rls.map(crlEnt => {
      let { campaign_rl_id, _user } = crlEnt;
      if (_user) {
        return {
          campaign_review_level_id: campaign_rl_id,
          user_id: _user.user_name
        };
      }
      return null;
    }).filter(_i => !!_i);
    // +++
    let formData = Object.assign({}, values, {
      is_active: (1 * values.is_active),
      campaign_review_list
    });
    delete formData.start_and_end_date;
    // console.log('formData: ', formData);
    //
    let campaignId = (campaignEnt && campaignEnt.id()) || formData[this._campaignModel.primaryKey];
    let apiCall = campaignId
      ? this._campaignModel.update(campaignId, formData)
      : this._campaignModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/campaigns');
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
        if (!campaignEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { campaignEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
      campaignType: undefined
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
    let { campaignType } = this.state;
    //
    if (campaignType) {
      let errMsg = "Thông tin mức duyệt là bắt buộc!";
      let { is_auto_review, campaign_rls = [] } = campaignType;
      if (!is_auto_review) {
        let usernameObj = {};
        let campaign_review_list = campaign_rls.filter(_item => {
          let { _user } = _item;
          _user && Object.assign(usernameObj, { [_user.user_name]: 1 });
          return !!_user;
        });
        if (!errors.campaign_review_list
          && !campaign_review_list.length
        ) {
          errors.campaign_review_list = errMsg;
        }
        if (!errors.campaign_review_list
          && (Object.keys(usernameObj).length < campaign_review_list.length)
        ) {
          errMsg = "Thông tin người duyệt không được phép trùng!";
          errors.campaign_review_list = errMsg;
        }
      }
    }
    return errors;
  }

  handleChangeCampaignType(changeValue) {
    let { value } = changeValue;
    let { values, setValues } = this.formikProps;
    let { campaignTypes } = this.state;
    let campaignType = value ? null : undefined;
    setValues(Object.assign(values, { "campaign_type_id": value }));
    this.setState({ campaignType });
    //
    if (value) {
      campaignType = campaignTypes.find(_item => (1 * value) === _item.value);
      if (campaignType) {
        campaignType = Object.assign({}, campaignType);
      }
      this._campaignTypeModel.getListCampaignRLUser(value)
        .then(campaign_rls => {
          this.setState({ campaignType: Object.assign(campaignType, { campaign_rls }) });
        })
        .catch(err => {
          window._$g.dialogs.alert(
            (`Tải dữ liệu loại chiến dịch không thành công. Bạn vui lòng thử lại!`)
          );
          this.setState({ campaignType: undefined });
        })
      ;
    }
  }

  handleChangeCompany(changeValue) {
    let { values, setValues } = this.formikProps;
    let { value: company_id } = changeValue;
    this._businessModel.getOptions({ parent_id: company_id || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr });
        setValues(Object.assign(values, {
          company_id, "business_id": ""
        }))
      })
    ;
  }

  handleApproveCRL(crlItem, is_review, callback) {
    let { campaignEnt } = this.props;
    let { review_list_id, note } = crlItem;
    // console.log('ID: ', campaignEnt.id());
    this._campaignModel.approvedReviewList(campaignEnt.id(), {
      is_review, review_list_id, note
    })
      .then(data => {
        // Update data, marked as approved
        Object.assign(crlItem, {
          is_review,
          review_date: moment().format('DD/MM/YY')
        });
        // Fire callback
        callback && callback(null, data);
        // Return + chain calls
        return data;
      })
      .catch(callback);
  }

  render() {
    let {
      _id,
      alerts,
      willShowCampaignTypeAdd,
      campaignType,
      campaignTypes,
      campaigns,
      companies,
      campaignStatusArr,
      businessArr
    } = this.state;
    let { campaignEnt, noEdit: propNoEdit } = this.props;
    let noEdit = propNoEdit || (campaignEnt && (null !== campaignEnt.is_reviewed)); // If campaign is reviewed --> disable edit.
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        {/** start#CampaignTypeAdd */}{willShowCampaignTypeAdd
          ? (
            <div className="campaign-type">
              <div className="campaign-type-box p-3">
                <CampaignTypeAdd
                  handleActionSave={false}
                  handleActionClose={this.handleToggleCTA}
                  handleFormikSubmitSucceed={this.handleFormikSubmitSucceedCTA}
                />
              </div>
            </div>
          ) : null
        }{/** end#CampaignTypeAdd */}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{campaignEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} chiến dịch {campaignEnt ? `"${campaignEnt.campaign_name}"` : ''}</b>
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
                  // Flag: can review?
                  let flagCampaignRLNoEdit = false;
                  // let startDate = values.start_date ? moment(values.start_date, MOMENT_FORMAT_DATE) : null;
                  let endDate = values.end_date ? moment(values.end_date, MOMENT_FORMAT_DATE) : null;
                  if (endDate && endDate <= moment()) {
                    flagCampaignRLNoEdit = true;
                  }

                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row>
                        <Col xs={12}>
                          <b className="underline">Thông tin chiến dịch</b>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Tên chiến dịch<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                  <Field
                                    name="campaign_name"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id={field.name}
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="campaign_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Loại chiến dịch<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <InputGroup>
                                  <div style={{ flex: '1 1 auto' }}>
                                    <Field
                                      name="campaign_type_id"
                                      render={({ field, form }) => {
                                        let defaultValue = campaignTypes.find(({ value }) => (1 * value) === (1 * field.value));
                                        let placeholder = (campaignTypes[0] && campaignTypes[0].label) || '';
                                        return (
                                          <Select
                                            name={field.name}
                                            onChange={(changeValue) => this.handleChangeCampaignType(changeValue)}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            // defaultValue={defaultValue}
                                            value={defaultValue}
                                            options={campaignTypes}
                                            isDisabled={!!campaignEnt || noEdit}
                                          />
                                        );
                                      }}
                                    />
                                  </div>
                                  <CheckAccess permission="CRM_CAMPAIGNTYPE_ADD">
                                    {campaignEnt ? null : <InputGroupAddon addonType="append">
                                      <Button onClick={this.handleToggleCTA}>
                                        <i className="fa fa-plus" />
                                      </Button>
                                    </InputGroupAddon>}
                                  </CheckAccess>
                                </InputGroup>
                                <ErrorMessage name="campaign_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Thuộc chiến dịch
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="parent_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = campaigns.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (campaigns[0] && campaigns[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={({ value }) => field.onChange({
                                          target: { type: "select", name: field.name, value }
                                        })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={campaigns}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="parent_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label for="campaign_status_id" sm={4}>
                                Trạng thái<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                  <Field
                                    name="campaign_status_id"
                                    render={({ field/*, form*/ }) => {
                                      let defaultValue = campaignStatusArr.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (campaignStatusArr[0] && campaignStatusArr[0].label) || '';
                                      return (
                                        <Select
                                          name={field.name}
                                          onChange={({ value }) => field.onChange({
                                            target: { type: "select", name: field.name, value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          value={defaultValue}
                                          options={campaignStatusArr}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="campaign_status_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Công ty áp dụng<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="company_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = companies.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (companies[0] && companies[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={(changeValue) => this.handleChangeCompany(changeValue)}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={companies}
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
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Cơ sở áp dụng<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <Field
                                  key={`business_id_of_${values.company_id}`}
                                  name="business_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = businessArr.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (businessArr[0] && businessArr[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        onChange={({ value }) => field.onChange({ target: { name: field.name, value } })}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        value={defaultValue}
                                        options={businessArr}
                                        isDisabled={noEdit}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="business_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Thời hạn từ
                              </Label>
                              <Col sm={8}>
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
                                <ErrorMessage name="start_and_end_date" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Ngân sách dự kiến<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={8}>
                                <InputGroup>
                                  <Field
                                    name="total_values"
                                    render={({ field /* _form */ }) => <NumberFormat
                                      name={field.name}
                                      onValueChange={(({ value }) => field.onChange({ target: { name: field.name, value } }))}
                                      defaultValue={values.total_values}
                                      disabled={noEdit}
                                    />}
                                  />
                                  <InputGroupAddon addonType="append">
                                    <InputGroupText>VND</InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <ErrorMessage name="total_values" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Mô tả<span className="font-weight-bold red-text">*</span>
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
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4}>
                                Lý do
                              </Label>
                              <Col sm={8}>
                                <Field
                                  name="reason"
                                  render={({ field /* _form */ }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="textarea"
                                    id={field.name}
                                    placeholder=""
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="reason" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label sm={4} />
                              <Col sm={4} className="d-flex">
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
                              </Col>
                              <Col sm={4} className="d-flex">
                                {campaignEnt ? <CustomInput
                                  className="pull-left"
                                  checked={campaignEnt.is_reviewed}
                                  type="switch"
                                  label="Đã duyệt?"
                                  disabled
                                /> : null}
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col xs={12}>
                          <b className="underline">Thông tin mức duyệt</b>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        {/* Case: edit campaign */}
                        {campaignEnt ? <Col xs={12}>
                            <CampaignReviewLevelEdit
                              campaignEnt={campaignEnt}
                              handleApprove={this.handleApproveCRL}
                              noEdit={propNoEdit || flagCampaignRLNoEdit}
                            />
                          </Col> : null
                        }
                        {/* Case: add campaign */}
                        {!campaignEnt ? <Col xs={12}>
                          <CampaignReviewLevelAdd campaignType={campaignType} />
                        </Col> : null}
                        <Col xs={12} className="mt-1"><ErrorMessage name="campaign_review_list" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} /></Col>
                      </Row>
                      <Row className="mt-4">
                        <Col sm={12} className="text-right">
                          {propNoEdit ? (
                            <CheckAccess permission="CRM_CAMPAIGN_EDIT">
                              <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/campaigns/edit/${campaignEnt.id()}`)}>
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
                            <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/campaigns')} className="btn-block-sm mt-md-0 mt-sm-2">
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

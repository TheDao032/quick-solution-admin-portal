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
  CustomInput,
  Table,
} from "reactstrap";
import Select from "react-select";
import moment from "moment";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address';
import DatePicker from '../Common/DatePicker';

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

// Model(s)
import BusinessModel from "../../models/BusinessModel";
import CustomerDataLeadModel from "../../models/CustomerDataLeadModel";
import CompanyModel from "../../models/CompanyModel";
import CampaignModel from "../../models/CampaignModel";
import SegmentModel from "../../models/SegmentModel";
import StatusDataLeadModel from "../../models/StatusDataLeadModel";

/**
 * @class CustomerDataLeadAdd
 */
export default class CustomerDataLeadAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._businessModel = new BusinessModel();
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._companyModel = new CompanyModel();
    this._campaignModel = new CampaignModel();
    this._segmentModel = new SegmentModel();
    this._statusDataLeadModel = new StatusDataLeadModel();

    // Bind method(s)
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleChangeBusiness = this.handleChangeBusiness.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      genders: [
        { name: "Nam", id: 1 },
        { name: "N???", id: 0 },
      ],
      marital: [
        { name: "?????c th??n", id: "0" },
        { name: "???? k???t h??n", id: "1" },
      ],
      /** @var {Array} */
      campaign: [
        { name: "-- Ch???n --", id: "" },
      ],
      /** @var {Array} */
      company: [
        { name: "-- Ch???n --", id: "" },
      ],
      /** @var {Array} */
      segment: [
        { name: "-- Ch???n --", id: "" },
      ],
      /** @var {Array} */
      statusDataLead: [
        { name: "-- Ch???n --", id: "" },
      ],
      /** @var {Array} */
      businessArr: [
        { name: "-- Ch???n --", id: "" },
      ],
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      full_name: Yup.string().trim()
        .required("T??n kh??ch h??ng l?? b???t bu???c."),
      gender: Yup.string()
        .required("Gi???i t??nh l?? b???t bu???c."),
      birthday: Yup.string()
        .required("Ng??y sinh l?? b???t bu???c."),
      phone_number: Yup.string()
        .matches(/^\d{10,11}$/, '??i???n tho???i kh??ng h???p l???!')
        .required("??i???n tho???i l?? b???t bu???c."),
      email: Yup.string().trim()
        .email('Email kh??ng h???p l???')
        .required("Email l?? b???t bu???c."),
      company_id: Yup.string()
        .required("C??ng ty l?? b???t bu???c."),
      segment_id: Yup.string()
        .required("Ph??n kh??c kh??ch h??ng l?? b???t bu???c."),
      business_id: Yup.string()
        .required("C?? s??? ph??ng t???p l?? b???t bu???c."),
      status_data_leads_id: Yup.string()
        .required("Tr???ng th??i kh??ch h??ng l?? b???t bu???c."),
      is_active: Yup.string()
        .required("K??ch ho???t l?? b???t bu???c."),
    });
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
    let { customerDataLeadEnt } = this.props;
    let values = Object.assign(
      {}, this._customerDataLeadModel.fillable(),
      {
        // Set default country to 'VN'
        country_id: DEFAULT_COUNTRY_ID,
      },
    );
    if (customerDataLeadEnt) {
      // map segment
      const { segment } = this.state;
      const cloneData = JSON.parse(JSON.stringify(segment));
      let segmentArr = [];
      customerDataLeadEnt.segment_id.map(v => {
        let currentIdxSegment = segment.findIndex(_item => _item.value === (1 * v));
        if (currentIdxSegment >= 0) {
          segmentArr.push(cloneData[currentIdxSegment]);
        }
      });
      if (segmentArr.length) {
        Object.assign(customerDataLeadEnt, {
          segment_id: segmentArr,
        });
      }

      Object.assign(values, customerDataLeadEnt);
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
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    let { customerDataLeadEnt, isEdit } = this.props;
    let bundle = {};
    let all = [
      this._businessModel.getOptions({ parent_id: (customerDataLeadEnt && customerDataLeadEnt.company_id) || -1 })
        .then(data => (bundle['businessArr'] = mapDataOptions4Select(data))),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['company'] = mapDataOptions4Select(data))),
    ];
    if (customerDataLeadEnt) {
      all = [
        ...all,
        this._segmentModel.getOptions({ is_active: 1, parent_id: customerDataLeadEnt.business_id })
          .then(data => this.setState({ segment: [this.state.segment[0]].concat(mapDataOptions4Select(data)) })),
        this._statusDataLeadModel.getOptions({ is_active: 1, is_won: 2, is_lost: 2, parent_id: customerDataLeadEnt.business_id })
          .then(data => { this.setState({ statusDataLead: [this.state.statusDataLead[0]].concat(mapDataOptions4Select(data)) }); }),
      ];
    }
    await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Kh???i t???o d??? li???u kh??ng th??nh c??ng (${err.message}).`),
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

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    let province_id = values.country_id ? values.province_id : "";
    let district_id = province_id ? values.district_id : "";
    let ward_id = district_id ? values.ward_id : "";
    // +++
    Object.assign(values, {
      // +++ address
      province_id,
      district_id,
      ward_id
    });
    // console.log('formikBfRender: ', values);
  }

  /** @var {String} */
  _btnType = null;

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

    let errors = {};
    let segmentArr = [];
    let { segment_id } = values;
    segment_id.map(v => v.value && segmentArr.push(v.value));
    if (segmentArr.length === 0) {
      let errMsg = "Ph??n kh??c kh??ch h??ng l?? b???t bu???c.";
      errors.segment_id = errMsg;
    }
    return errors;
  }

  handleFormikSubmit(values, formProps) {
    let { customerDataLeadEnt } = this.props;
    let { setSubmitting/*, resetForm*/ } = formProps;
    let willRedirect = false;
    let alerts = [];
    let segmentArr = [];
    // Build form data
    let { id_card_date, birthday, segment_id } = values;
    let bdArr = (birthday && moment(birthday, 'DD/MM/YYYY').format("DD/MM/YYYY")) || [];
    let idCardDateArr = (id_card_date && moment(id_card_date, 'DD/MM/YYYY').format("DD/MM/YYYY")) || [];
    segment_id.map(v => segmentArr.push(v.value));
    // +++
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
      birthday: (bdArr.length ? bdArr : ''),
      id_card_date: (idCardDateArr.length ? idCardDateArr : ''),
      segment_id: segmentArr,
      country_name: values.country_id && values.country_name ? this.refCountry.state.options.find(({ value }) => (1 * value) === (1 * values.country_id)).label : '',
      province_name: values.province_id && values.province_name ? this.refProvince.state.options.find(({ value }) => (1 * value) === (1 * values.province_id)).label : '',
      district_name: values.district_id && values.district_name ? this.refDistrict.state.options.find(({ value }) => (1 * value) === (1 * values.district_id)).label : '',
      ward_name: values.ward_id && values.ward_name ? this.refWard.state.options.find(({ value }) => (1 * value) === (1 * values.ward_id)).label : '',
    });
    let customerDataLead = (customerDataLeadEnt && customerDataLeadEnt.data_leads_id) || formData[this._customerDataLeadModel];
    let apiCall = customerDataLead
      ? this._customerDataLeadModel.update(customerDataLead, formData)
      : this._customerDataLeadModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('L??u th??nh c??ng!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/customer-data-leads');
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
        if (!customerDataLeadEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: false,
      alerts: [],
    }));
    // Get bundle data --> ready data
    (async () => {
      this.setState({ ready: true });
    })();
    //.end
  }

  handleChangeCompany(changeValue) {
    let { values, setValues } = this.formikProps;
    let { value: company_id } = changeValue;
    this._businessModel.getOptions({ parent_id: company_id || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({
          businessArr,
          campaign: [ { name: "-- Ch???n --", id: "" } ],
          segment: [ { name: "-- Ch???n --", id: "" } ],
          statusDataLead: [ { name: "-- Ch???n --", id: "" } ]
        });
        setValues(Object.assign(values, {
          company_id, "business_id": "", "campaign_id": "", "segment_id": [], "status_data_leads_id": "",
        }))
      })
    ;
  }

  handleChangeBusiness(changeValue) {
    let { isEdit } = this.props
    let { values, setValues } = this.formikProps;
    let { value: business_id } = changeValue;

    if (business_id === '') {
      this.setState({
        campaign: [ { name: "-- Ch???n --", id: "" } ],
        segment: [ { name: "-- Ch???n --", id: "" } ],
        statusDataLead: [ { name: "-- Ch???n --", id: "" } ]
      });
      setValues(Object.assign(values, {
        "business_id": "", "campaign_id": "", "segment_id": [], "status_data_leads_id": "",
      }))
      return
    } else {
      this._segmentModel.getOptions({ is_active: 1, parent_id: business_id })
        .then(data => this.setState({ segment: [this.state.segment[0]].concat(mapDataOptions4Select(data)) }))
      this._statusDataLeadModel.getOptions({ is_active: 1, is_won: isEdit === true ? 2 : 0, is_lost: isEdit === true ? 2 : 0, parent_id: business_id })
        .then(data => { this.setState({ statusDataLead: [this.state.statusDataLead[0]].concat(mapDataOptions4Select(data)) }); })
      this._campaignModel.getOptions({ is_active: 1, is_reviewed: 1, is_expired: 0, business_id: business_id, company_id: values.company_id })
        .then(data => {
          let { campaign } = this.state;
          campaign = [campaign[0]].concat(mapDataOptions4Select(data));
          this.setState({ campaign });
          setValues(Object.assign(values, {
            business_id, "campaign_id": "", "segment_id": [], "status_data_leads_id": "",
          }))
        })
      ;
    }
  }

  handleAddField(evt, key) {
    let { values, handleChange } = this.formikProps;
    let value = values[key];
    let item = {
      label: "",
      value: ""
    };
    value.push(item);
    handleChange({ target: { name: key, value }});
  }

  mappingSegmentDisabled(segmentArr) {
    const { segment } = this.state;
    const cloneData = JSON.parse(JSON.stringify(segment));
    segmentArr.map(v => {
      let currentIdxSegment = segment.findIndex(_item => _item.value === (1 * v.value));
      if (currentIdxSegment >= 0) {
        cloneData[currentIdxSegment].isDisabled = true
      }
    });
    return cloneData
  }

  handleUpdateField(item, valueChange, key) {
    let { values, handleChange } = this.formikProps;
    let value = values[key];
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    value[foundIdx] = valueChange;
    handleChange({ target: { name: key, value }});
  }

  handleRemoveField(item, evt, key) {
    let { values, handleChange } = this.formikProps;
    let value = values[key];
    let foundIdx = value.findIndex(_item => _item === item);
    if (foundIdx < 0) {
      return;
    }
    value.splice(foundIdx, 1);
    handleChange({ target: { name: key, value }});
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      genders,
      marital,
      company,
      campaign,
      segment,
      statusDataLead,
      businessArr,
    } = this.state;
    let { customerDataLeadEnt, noEdit } = this.props;
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
                <b>{customerDataLeadEnt ? `${noEdit ? 'Th??ng tin' : 'Ch???nh s???a'} kh??ch h??ng ${customerDataLeadEnt.data_leads_id}` : 'Th??m m???i kh??ch h??ng'}</b>
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
                  } = (this.formikProps = formikProps);
                  // [Event]
                  this.handleFormikBeforeRender({ initialValues });
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Col xs={12}>
                        <Row className="mb15">
                          <Col xs={12}>
                            <b className="underline">Th??ng tin kh??ch h??ng</b>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12} sm={6}>
                            <Row>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="full_name" sm={4}>
                                    T??n kh??ch h??ng<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="full_name"
                                      render={({ field }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder="H??? t??n kh??ch h??ng"
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="full_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="gender" sm={4}>
                                    Gi???i t??nh<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Row>
                                      {genders.map(({ name, id }, idx) => {
                                        return (
                                          <Col xs={4} key={`gender-${idx}`}>
                                            <FormGroup check>
                                              <Label check>
                                                <Field
                                                  name="gender"
                                                  render={({ field /* _form */ }) => <Input
                                                    {...field}
                                                    onBlur={null}
                                                    value={id}
                                                    type="radio"
                                                    checked={(1 * values.gender) === (1 * id)}
                                                    id={`gender_${id}`}
                                                    disabled={noEdit}
                                                  />}
                                                /> {name}
                                              </Label>
                                            </FormGroup>
                                          </Col>
                                        );
                                      })}
                                    </Row>
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="birthday" sm={4}>
                                    Ng??y sinh<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="birthday"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="birthday"
                                            date={values.birthday ? moment(values.birthday, 'DD/MM/YYYY') : null}
                                            onDateChange={date => {
                                              setFieldValue('birthday', date)
                                            }}
                                            disabled={noEdit}
                                            maxToday
                                            readOnly
                                          />
                                        )
                                      }}
                                    />
                                    <ErrorMessage name="birthday" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="phone_number" sm={4}>
                                    S??? ??i???n tho???i<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="phone_number"
                                      render={({ field }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder="S??? ??i???n tho???i (10 ?????n 11 ch??? s???)"
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="phone_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="email" sm={4}>
                                    Email<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="email"
                                      render={({ field }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="employee.0001@company.com"
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="email" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="company_id" sm={4}>
                                    C??ng ty<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="company_id"
                                      render={({ field/*, form*/ }) => {
                                        let options = company.map(({ name: label, id: value }) => ({ value, label }));
                                        let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                        let placeholder = (company[0] && company[0].name) || '';
                                        return (
                                          <Select
                                            id="company_id"
                                            name="company_id"
                                            onChange={(changeValue) => this.handleChangeCompany(changeValue)}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={options}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="business_id" sm={4}>
                                    C?? s??? ph??ng t???p<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      key={`business_id_of_${values.company_id}`}
                                      name="business_id"
                                      render={({ field/*, form*/ }) => {
                                        let options = businessArr.map(({ name: label, id: value }) => ({ value, label }));
                                        let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                        let placeholder = (businessArr[0] && businessArr[0].label) || '';
                                        return (
                                          <Select
                                            id="business_id"
                                            name="business_id"
                                            onChange={(changeValue) => this.handleChangeBusiness(changeValue)}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            value={defaultValue}
                                            options={options}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="business_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="campaign_id" sm={4}>
                                    Thu???c chi???n d???ch
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      key={`campaign_id_of_${values.company_id}_of_${values.business_id}`}
                                      name="campaign_id"
                                      render={({ field/*, form*/ }) => {
                                        let options = campaign.map(({ name: label, id: value }) => ({ value, label }));
                                        let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                        let placeholder = (campaign[0] && campaign[0].name) || '';
                                        return (
                                          <Select
                                            id="campaign_id"
                                            name="campaign_id"
                                            onChange={item => field.onChange({
                                              target: {
                                                type: "select",
                                                name: "campaign_id",
                                                value: item.value,
                                              }
                                            })}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={options}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="campaign_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="status_data_leads_id" sm={4}>
                                    Tr???ng th??i kh??ch h??ng<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      key={`status_data_leads_id_of_${values.business_id}`}
                                      name="status_data_leads_id"
                                      render={({ field/*, form*/ }) => {
                                        let options = statusDataLead.map(({ name: label, id: value }) => ({ value, label }));
                                        let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                        let placeholder = (statusDataLead[0] && statusDataLead[0].name) || '';
                                        return (
                                          <Select
                                            id="status_data_leads_id"
                                            name="status_data_leads_id"
                                            onChange={item => field.onChange({
                                              target: {
                                                type: "select",
                                                name: "status_data_leads_id",
                                                value: item.value,
                                              }
                                            })}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={options}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="status_data_leads_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
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
                                        label="K??ch ho???t?"
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
                                  <Label for="marital_status" sm={4}>
                                    T??nh tr???ng h??n nh??n
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="marital_status"
                                      render={({ field/*, form*/ }) => {
                                        let options = marital.map(({ name: label, id: value }) => ({ value, label }));
                                        let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                        let placeholder = (marital[0] && marital[0].name) || '';
                                        return (
                                          <Select
                                            id="marital_status"
                                            name="marital_status"
                                            onChange={item => field.onChange({
                                              target: {
                                                type: "select",
                                                name: "marital_status",
                                                value: item.value,
                                              }
                                            })}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options={options}
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }}
                                    />
                                    <ErrorMessage name="marital_status" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="id_card" sm={4}>
                                    S??? CMND
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="id_card"
                                      render={({ field }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="id_card" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="id_card_date" sm={4}>
                                    Ng??y c???p
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="id_card_date"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="id_card_date"
                                            date={values.id_card_date ? moment(values.id_card_date, 'DD/MM/YYYY') : null}
                                            onDateChange={date => {
                                              setFieldValue('id_card_date', date)
                                            }}
                                            disabled={noEdit}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                    <ErrorMessage name="id_card_date" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="id_card_place" sm={4}>
                                    N??i c???p
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="id_card_place"
                                      render={({ field }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="id_card_place" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Address className="col-12">{(addrProps) => {
                                let {
                                  CountryComponent,
                                  ProvinceComponent,
                                  DistrictComponent,
                                  WardComponent
                                } = addrProps;
                                  return (
                                    <div className="row">
                                      <Col xs={12}>
                                        <FormGroup row>
                                          <Label for="country_id" sm={4}>
                                            Qu???c gia
                                          </Label>
                                          <Col sm={8}>
                                            <Field
                                              name="country_id"
                                              render={({ field, form }) => {
                                                return (
                                                  <CountryComponent
                                                    ref={(country) => { this.refCountry = country }}
                                                    id={field.name}
                                                    name={field.name}
                                                    onChange={({ value }) => {
                                                      // change?
                                                      if ('' + values[field.name] !== '' + value) {
                                                        return form.setValues(Object.assign(values, {
                                                          [field.name]: value, province_id: "", district_id: "", ward_id: "",
                                                        }));
                                                      }
                                                      field.onChange({ target: { name: field.name, value } });
                                                    }}
                                                    value={values[field.name]}
                                                    isDisabled={noEdit}
                                                  />
                                                );
                                              }}
                                            />
                                            <ErrorMessage name="country_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                          </Col>
                                        </FormGroup>
                                      </Col>
                                      <Col xs={12}>
                                        <FormGroup row>
                                          <Label for="province_id" sm={4}>
                                            T???nh/Th??nh ph???
                                          </Label>
                                          <Col sm={8}>
                                            <Field
                                              key={`province_of_${values.country_id}`}
                                              name="province_id"
                                              render={({ field, form }) => {
                                                return (
                                                  <ProvinceComponent
                                                    ref={(province) => { this.refProvince = province }}
                                                    id={field.name}
                                                    name={field.name}
                                                    onChange={({ value }) => {
                                                      // change?
                                                      if ('' + values[field.name] !== '' + value) {
                                                        return form.setValues(Object.assign(values, {
                                                          [field.name]: value, district_id: "", ward_id: "",
                                                        }));
                                                      }
                                                      field.onChange({ target: { name: field.name, value } });
                                                    }}
                                                    mainValue={values.country_id}
                                                    value={values[field.name]}
                                                    isDisabled={noEdit}
                                                  />
                                                );
                                              }}
                                            />
                                            <ErrorMessage name="province_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                          </Col>
                                        </FormGroup>
                                      </Col>
                                      <Col xs={12}>
                                        <FormGroup row>
                                          <Label for="district_id" sm={4}>
                                            Qu???n/Huy???n
                                          </Label>
                                          <Col sm={8}>
                                            <Field
                                              key={`district_of_${values.province_id}`}
                                              name="district_id"
                                              render={({ field, form }) => {
                                                return (
                                                  <DistrictComponent
                                                    ref={(district) => { this.refDistrict = district }}
                                                    id={field.name}
                                                    name={field.name}
                                                    onChange={({ value }) => {
                                                      // change?
                                                      if ('' + values[field.name] !== '' + value) {
                                                        return form.setValues(Object.assign(values, {
                                                          [field.name]: value, ward_id: "",
                                                        }));
                                                      }
                                                      field.onChange({ target: { name: field.name, value } });
                                                    }}
                                                    mainValue={values.province_id}
                                                    value={values[field.name]}
                                                    isDisabled={noEdit}
                                                  />
                                                );
                                              }}
                                            />
                                            <ErrorMessage name="district_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                          </Col>
                                        </FormGroup>
                                      </Col>
                                      <Col xs={12}>
                                        <FormGroup row>
                                          <Label for="ward_id" sm={4}>
                                            Ph?????ng/X??
                                          </Label>
                                          <Col sm={8}>
                                            <Field
                                              key={`ward_of_${values.district_id}`}
                                              name="ward_id"
                                              render={({ field/*, form*/ }) => {
                                                return (
                                                  <WardComponent
                                                    ref={(ward) => { this.refWard = ward }}
                                                    id={field.name}
                                                    name={field.name}
                                                    onChange={({ value }) => field.onChange({
                                                      target: { name: field.name, value }
                                                    })}
                                                    mainValue={values.district_id}
                                                    value={values[field.name]}
                                                    isDisabled={noEdit}
                                                  />
                                                );
                                              }}
                                            />
                                            <ErrorMessage name="ward_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                          </Col>
                                        </FormGroup>
                                      </Col>
                                    </div>
                                  );
                              }}</Address>
                              <Col xs={12}>
                                <FormGroup row>
                                  <Label for="address" sm={4}>
                                    ?????a ch???
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="address"
                                      render={({ field }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="text"
                                        placeholder=""
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="address" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row className="mb-3 mt-3">
                          <Col xs={12}>
                            <FormGroup row id="segment_id">
                              <Label for="address" sm={2}>
                                Ph??n kh??c kh??ch h??ng<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={10}>
                                <Table size="sm" bordered striped hover>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '75px', minWidth: '75px' }}>STT</th>
                                      <th style={{}}>Ph??n kh??c kh??ch h??ng</th>
                                      <th style={{ width: '1%' }}>X??a</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {values.segment_id.map((item, idx) => {
                                      let cloneSegment = this.mappingSegmentDisabled(values.segment_id)
                                      let options = cloneSegment.map(({ name: label, id: value, isDisabled }) => ({ value, label, isDisabled }));
                                      let defaultValue = options.find(({ value }) => (1 * value) === (1 * item.value));
                                      return item ? (
                                        <tr key={`segment_id-${idx}`}>
                                          <td className="text-center">
                                            {idx + 1}
                                          </td>
                                          <td className="">
                                            <Select
                                              onChange={(value) => this.handleUpdateField(item, value, 'segment_id')}
                                              isSearchable={true}
                                              options={options}
                                              placeholder="--- Ch???n ---"
                                              isDisabled={noEdit}
                                              defaultValue={defaultValue}
                                              value={item}
                                            />
                                          </td>
                                          <td className="text-center">
                                            {noEdit ? null : <Button color="danger" size={"sm"} onClick={(event) => this.handleRemoveField(item, event, 'segment_id')}>
                                              <i className="fa fa-minus-circle" />
                                            </Button>}
                                          </td>
                                        </tr>
                                      ) : null;
                                    })}
                                    {!values.segment_id.length ? (
                                      <tr><td colSpan={100}>&nbsp;</td></tr>
                                    ) : null}
                                </tbody>
                                </Table>
                                <Row>
                                  <Col sm={12}>
                                    <ErrorMessage name="segment_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                  <CheckAccess permission="CRM_CUSDATALEADS_ADD">
                                    <Col sm={12}>
                                      {noEdit ? null : <Button onClick={(evt) => this.handleAddField(evt, 'segment_id')}>
                                        <i className="fa fa-plus-circle" /> Th??m d??ng
                                      </Button>}
                                    </Col>
                                  </CheckAccess>
                                </Row>
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={12} className="mt-2">
                            <Row>
                              <Col sm={12} className="text-right">
                                {
                                  noEdit?(
                                    <CheckAccess permission="CRM_CUSDATALEADS_EDIT">
                                      <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/customer-data-leads/edit/${customerDataLeadEnt.id()}`)}>
                                        <i className="fa fa-edit mr-1" />Ch???nh s???a
                                      </Button>
                                    </CheckAccess>
                                  ):
                                  [
                                    <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                      <i className="fa fa-save mr-2" />L??u
                                    </Button>,
                                    <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                      <i className="fa fa-save mr-2" />L??u &amp; ????ng
                                    </Button>
                                  ]
                                }
                                <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/customer-data-leads')} className="btn-block-sm mt-md-0 mt-sm-2">
                                  <i className="fa fa-times-circle mr-1" />????ng
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

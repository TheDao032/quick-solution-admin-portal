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
  Media,
  InputGroupAddon,
  // InputGroupText,
  InputGroup,
  CustomInput
} from "reactstrap";
import Select from "react-select";
import moment from 'moment';

// Assets
import "./styles.scss";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import MyGoogleMap from '../Common/MyGoogleMap';
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address';
import DatePicker from '../Common/DatePicker';

// Util(s)
import { readFileAsBase64, mapDataOptions4Select } from '../../utils/html';
// Model(s)
import BusinessModel from "../../models/BusinessModel";
import BusinessTypeModel from '../../models/BusinessTypeModel'
import CompanyModel from "../../models/CompanyModel";
import AreaModel from "../../models/AreaModel";

/**
 * @class BusinessAdd
 */
export default class BusinessAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._businessModel = new BusinessModel();
    this._businessTypeModel = new BusinessTypeModel();
    this._companyModel = new CompanyModel();
    this._areaModel = new AreaModel();

    // Bind method(s)
    this.getGmapProps = this.getGmapProps.bind(this);
    this.handlePickLocation = this.handlePickLocation.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    // +++
    let { businessEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {String|null} */
      bannerBase64: (businessEnt && businessEnt.businessBanner()) || null,
      /** @var {String|null} */
      iconUrlBase64: (businessEnt && businessEnt.businessIconUrl()) || null,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      businessTypes: [
        { name: "-- Ch???n --", id: "" },
      ],
      /** @var {Array} */
      companies: [
        { name: "-- Ch???n --", id: "" },
      ],
      /** @var {Array} */
      areas: [
        { label: "-- Ch???n --", value: "" },
      ],
      /** @var {Boolean} */
      openGmap: false
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
    let { businessEnt } = this.props;
    let values = Object.assign(
      {}, this._businessModel.fillable(),
      {
        business_country_id: DEFAULT_COUNTRY_ID,
      }
    );
    if (businessEnt) {
      Object.assign(values, businessEnt);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // values[key] += '';
      // opening_date
      if (key === 'opening_date') {
        let bdArr = values[key].match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
        bdArr && (values[key] = `${bdArr[3]}-${bdArr[2]}-${bdArr[1]}`);
      }
      // business_groups
      if (key === 'business_groups') {
        values[key] = values[key] || [];
      }
    });

    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    // let { businessEnt } = this.props;
    let bundle = {};
    let all = [
      this._businessTypeModel.getOptions()
        .then(data => (bundle['businessTypes'] = data)),
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = data)),
      this._areaModel.getOptions({ is_active: 1 })
        .then(data => (bundle['areas'] = mapDataOptions4Select(data))),
    ];
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

  getGmapProps() {
    return {
      onCloseGMap: () => {
        this.setState({ openGmap: false });
      }
    };
  }

  handlePickLocation(evt) {
    evt.preventDefault();
    // 
    this.setState({ openGmap: true });
  }

  handleImageChange(type, event) {
    let { target } = event;
    if (target.files[0]) {
      readFileAsBase64(target, {
        // option: validate input
        validate: (file) => {
          // Check file's type
          if ('type' in file) {
            if (file.type.indexOf('image/') !== 0) {
              return 'Ch??? ???????c ph??p s??? d???ng t???p tin ???nh.';
            }
          }
          // Check file's size in bytes
          if ('size' in file) {
            let maxSize = 4; /*4mb*/
            if ((file.size / 1024 / 1024) > maxSize) {
              return `Dung l?????ng t???p tin t???i ??a l??: ${maxSize}mb.`;
            }
          }
        }
      })
        .then(imgBase64 => {
          if ('banner' === type) {
            this.setState({ bannerBase64: imgBase64 });
          }
          if ('icon' === type) {
            this.setState({ iconUrlBase64: imgBase64 });
          }
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
      ;
    }
  }

  formikValidationSchema = Yup.object().shape({
    business_name: Yup.string()
      // .min(2, 'Too Short!')
      // .max(70, 'Too Long!')
      .required("T??n c?? s??? l?? b???t bu???c."),
    business_type_id: Yup.string()
      .nullable()
      .required("Lo???i h??nh c?? s??? l?? b???t bu???c."),
    company_id: Yup.string()
      .nullable()
      .required("Tr???c thu???c c??ng ty l?? b???t bu???c."),
    business_phone_number: Yup.string()
      .required("S??? ??i???n tho???i l?? b???t bu???c."),
    business_mail: Yup.string()
      .email('Email kh??ng h???p l???')
      // .required("Email l?? b???t bu???c.")
    ,
    open_time: Yup.string()
      .matches(/\d{2}:\d{2}/, "Gi??? m??? c???a kh??ng h???p l???."),
    close_time: Yup.string()
      .matches(/\d{2}:\d{2}/, "Gi??? ????ng c???a kh??ng h???p l???."),
    area_id: Yup.string()
      .required("Khu v???c l?? b???t bu???c."),
    business_country_id: Yup.string()
      .required("Qu???c gia l?? b???t bu???c."),
    location_x: Yup.string()
      .matches(/\d+\.\d+/, "V?? ????? kh??ng h???p l???."),
     location_y: Yup.string()
      .matches(/\d+\.\d+/, "Kinh ????? kh??ng h???p l???."),
  });

  handleFormikBeforeRender({ initialValues }) {
    let { values } = this.formikProps;
    if (values === initialValues) {
      return;
    }
    // Reformat data
    let business_province_id = values.business_country_id ? values.business_province_id : "";
    let business_district_id = business_province_id ? values.business_district_id : "";
    let business_ward_id = business_district_id ? values.business_ward_id : "";
    // +++
    Object.assign(values, {
      // +++ address
      business_province_id,
      business_district_id,
      business_ward_id,
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

  handleFormikValidate(values) {
    // Trim string values,...
    Object.keys(values).forEach(prop => {
      (typeof values[prop] === "string") && (values[prop] = values[prop].trim());
    });
    //.end
  }

  businessAddressFull(values) {
    return ([
      values.business_address,
      values.business_ward_id && values.business_ward_name ? this.refWard.state.options.find(({ value }) => (1 * value) === (1 * values.business_ward_id)).label : '',
      values.business_district_id && values.business_district_name ? this.refDistrict.state.options.find(({ value }) => (1 * value) === (1 * values.business_district_id)).label : '',
      values.business_province_id && values.business_province_name ? this.refProvince.state.options.find(({ value }) => (1 * value) === (1 * values.business_province_id)).label : '',
      values.business_country_id && values.business_country_name ? this.refCountry.state.options.find(({ value }) => (1 * value) === (1 * values.business_country_id)).label : '',
    ].filter(item => !!item).join(', '));
  }

  handleFormikSubmit(values, formProps) {
    let { businessEnt } = this.props;
    let { bannerBase64, iconUrlBase64 } = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let { opening_date } = values;
    let bdArr = (opening_date && moment(opening_date).format("DD/MM/YYYY")) || [];
    // +++
    let formData = Object.assign({}, values, {
      business_banner: bannerBase64,
      business_icon_url: iconUrlBase64,
      opening_date: (bdArr.length ? bdArr : ''),
      is_active: (1 * values.is_active),
      business_address_full: this.businessAddressFull(values),
    });

    //
    let businessId = (businessEnt && businessEnt.id()) || formData[this._businessModel];
    let apiCall = businessId
      ? this._businessModel.update(businessId, formData)
      : this._businessModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('L??u th??nh c??ng!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/businesses');
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
        if (!businessEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() {
    // let { businessEnt } = this.props;
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
      bannerBase64: null,
      iconUrlBase64: null,
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      bannerBase64,
      iconUrlBase64,
      businessTypes,
      companies,
      areas,
      openGmap
    } = this.state;
    let { businessEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // console.log('initialValues: ', initialValues);
    /** @var {Object} */
    let gmapProps = this.getGmapProps();
    // console.log('gmapProps: ', gmapProps);

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        {openGmap ? <MyGoogleMap
          ref={ref => (ref && (this._refGMap = ref))}
          {...gmapProps}
        /> : null}
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>{businessEnt ? (noEdit ? 'Chi ti???t' : 'Ch???nh s???a') : 'Th??m m???i'} c?? s??? {businessEnt ? businessEnt.business_name : ''}</b>
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
                      <Row className="mb15 page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Th??ng tin c?? s???</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={6}>
                          <FormGroup row>
                            <Label for="business_banner" sm={4} className="font-weight-bold">
                              Banner
                            </Label>
                            <Col sm={8}>
                              <div className="hidden ps-relative text-center p-3 business-img-box business-img-banner">
                                {bannerBase64 ? <Media
                                  object
                                  src={bannerBase64}
                                  alt="Banner"
                                  className="user-imgage"
                                /> : <span>Click ????? ch???n banner</span>}
                                <Input
                                  type="file"
                                  id="business_banner"
                                  className="input-overlay"
                                  onChange={evt => this.handleImageChange('banner', evt)}
                                  disabled={noEdit}
                                />
                              </div>
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={6}>
                          <FormGroup row>
                            <Label for="business_icon_url" sm={4} className="font-weight-bold">
                              Logo
                            </Label>
                            <Col sm={8}>
                              <div className="hidden ps-relative text-center p-3 business-img-box business-img-icon">
                                {iconUrlBase64 ? <Media
                                  object
                                  src={iconUrlBase64}
                                  alt="Icon"
                                  className="user-imgage"
                                /> : <span>Click ????? ch???n icon</span>}
                                <Input
                                  type="file"
                                  id="business_icon_url"
                                  className="input-overlay"
                                  onChange={evt => this.handleImageChange('icon', evt)}
                                  disabled={noEdit}
                                />
                              </div>
                            </Col>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <FormGroup row>
                            <Label for="business_name" sm={2} className="font-weight-bold">
                              T??n c?? s??? <span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col sm={10}>
                              <Field
                                name="business_name"
                                render={({ field /* _form */ }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  id="business_name"
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="business_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col sm={12}>
                          <Row>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="business_type_id" sm={4} className="font-weight-bold">
                                  Lo???i h??nh c?? s??? <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="business_type_id"
                                    render={({ field/*, form*/ }) => {
                                      let options = businessTypes.map(({ name: label, id: value }) => ({ value, label }));
                                      let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (businessTypes[0] && businessTypes[0].name) || '';
                                      return (
                                        <Select
                                          id="business_type_id"
                                          name="business_type_id"
                                          onChange={({ value }) => field.onChange({
                                            target: { name: "business_type_id", value }
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
                                  <ErrorMessage name="business_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="opening_date" sm={4} className="font-weight-bold">
                                  Ng??y m??? c???a
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="opening_date"
                                    render={({
                                      date,
                                      form: { setFieldValue, setFieldTouched, values },
                                      field,
                                      ...props
                                    }) => {
                                      return (
                                        <DatePicker
                                          id="opening_date"
                                          date={values.opening_date ? moment(values.opening_date) : null}
                                          onDateChange={date => {
                                            setFieldValue('opening_date', date)
                                          }}
                                          disabled={noEdit}
                                        />
                                      )
                                    }}
                                    
                                  />
                                </Col>
                              </FormGroup>
                              <ErrorMessage name="opening_date" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="area_id" sm={4} className="font-weight-bold">
                                  Thu???c khu v???c <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="area_id"
                                    render={({ field/*, form */ }) => {
                                      let defaultValue = areas.find(({ value }) => ('' + value) === ('' + field.value));
                                      let placeholder = (areas[0] && areas[0].name) || '';
                                      return (
                                        <Select
                                          id={field.name}
                                          name={field.name}
                                          onChange={item => field.onChange({
                                            target: { name: field.name, value: item.value }
                                          })}
                                          isSearchable={true}
                                          placeholder={placeholder}
                                          defaultValue={defaultValue}
                                          options={areas}
                                          isDisabled={noEdit}
                                        />
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="area_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="company_id" sm={4} className="font-weight-bold">
                                  Tr???c thu???c c??ng ty <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="company_id"
                                    render={({ field/*, form */ }) => {
                                      let options = companies.map(({ name: label, id: value }) => ({ value, label }));
                                      let defaultValue = options.find(({ value }) => (1 * value) === (1 * field.value));
                                      let placeholder = (companies[0] && companies[0].name) || '';
                                      return (
                                        <Select
                                          id="company_id"
                                          name="company_id"
                                          onChange={item => field.onChange({
                                            target: {
                                              type: "select",
                                              name: "company_id",
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
                                  <ErrorMessage name="company_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={6}></Col>
                          </Row>
                          <Row>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="business_phone_number" sm={4} className="font-weight-bold">
                                  S??? ??i???n tho???i <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="business_phone_number"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id="business_phone_number"
                                      placeholder="09345678910"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="business_phone_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="business_mail" sm={4} className="font-weight-bold">
                                  Email
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="business_mail"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="email"
                                      id="business_mail"
                                      placeholder="business.0001@company.com"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="business_mail" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                             
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="business_website" sm={4} className="font-weight-bold">
                                  Website
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="business_website"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id="business_website"
                                      placeholder="https://business.company.com"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="business_website" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="business_zip_code" sm={4} className="font-weight-bold">
                                  M?? b??u ch??nh
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="business_zip_code"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id="business_zip_code"
                                      placeholder=""
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="business_zip_code" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="open_time" sm={4} className="font-weight-bold">
                                  Gi??? m??? c???a
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="open_time"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id="open_time"
                                      placeholder="hh:mm (vd: 08:00)"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="open_time" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="close_time" sm={4} className="font-weight-bold">
                                  Gi??? ????ng c???a
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="close_time"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id="close_time"
                                      placeholder="hh:mm (vd: 17:00)"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="close_time" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={12}>
                              <FormGroup row>
                                <Label for="description" sm={2} className="font-weight-bold">
                                  M?? t???
                                </Label>
                                <Col sm={10}>
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
                                  <ErrorMessage name="description" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                        <Row className="mb15 page_title">
                          <Col sm={12}>
                            <b className="title_page_h1 text-primary">?????a ch??? c?? s???</b>
                          </Col>
                        </Row>
                          <Address>{(addrProps) => {
                            let {
                              CountryComponent,
                              ProvinceComponent,
                              DistrictComponent,
                              WardComponent
                            } = addrProps;
                            return (
                              <Row>
                                <Col sm={6}>
                                  <FormGroup row>
                                    <Label for="location_x" sm={4} className="font-weight-bold">
                                      V?? ?????
                                    </Label>
                                    <Col sm={8}>
                                      <Field
                                        name="location_x"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          id="location_x"
                                          placeholder=""
                                          disabled
                                        />}
                                      />
                                      <ErrorMessage name="location_x" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                    </Col>
                                  </FormGroup>
                                </Col>
                                <Col sm={6}>
                                  <FormGroup row>
                                    <Label for="location_y" sm={4} className="font-weight-bold">
                                      Kinh ?????
                                    </Label>
                                    <Col sm={8}>
                                      <InputGroup>
                                        <Field
                                          name="location_y"
                                          render={({ field /* _form */ }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="text"
                                            id="location_y"
                                            placeholder=""
                                            disabled
                                          />}
                                        />
                                        <InputGroupAddon addonType="append">
                                          <Button
                                            onClick={this.handlePickLocation}
                                          >
                                            <i className="fa fa-map-marker" />
                                          </Button>
                                        </InputGroupAddon>
                                      </InputGroup>
                                      <ErrorMessage name="location_y" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                    </Col>
                                  </FormGroup>
                                </Col>
                                <Col sm={6}>
                                  <FormGroup row>
                                    <Label for="business_country_id" sm={4} className="font-weight-bold">
                                      Qu???c gia <span className="font-weight-bold red-text">*</span>
                                    </Label>
                                    <Col sm={8}>
                                      <Field
                                        name="business_country_id"
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
                                                    [field.name]: value, business_province_id: "", business_district_id: "", business_ward_id: "",
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
                                      <ErrorMessage name="business_country_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                    </Col>
                                  </FormGroup>
                                </Col>
                                <Col sm={6}>
                                  <FormGroup row>
                                    <Label for="business_province_id" sm={4} className="font-weight-bold">
                                      T???nh/Th??nh ph???
                                    </Label>
                                    <Col sm={8}>
                                      <Field
                                        key={`province_of_${values.business_country_id}`}
                                        name="business_province_id"
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
                                                    [field.name]: value, business_district_id: "", business_ward_id: "",
                                                  }));
                                                }
                                                field.onChange({ target: { name: field.name, value } });
                                              }}
                                              mainValue={values.business_country_id}
                                              value={values[field.name]}
                                              isDisabled={noEdit}
                                            />
                                          );
                                        }}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                                <Col sm={6}>
                                  <FormGroup row>
                                    <Label for="business_district_id" sm={4} className="font-weight-bold">
                                      Qu???n/Huy???n
                                    </Label>
                                    <Col sm={8}>
                                      <Field
                                        key={`district_of_${values.business_province_id}`}
                                        name="business_district_id"
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
                                                    [field.name]: value, business_ward_id: "",
                                                  }));
                                                }
                                                field.onChange({ target: { name: field.name, value } });
                                              }}
                                              mainValue={values.business_province_id}
                                              value={values[field.name]}
                                              isDisabled={noEdit}
                                            />
                                          );
                                        }}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                                <Col sm={6}>
                                  <FormGroup row>
                                    <Label for="business_ward_id" sm={4} className="font-weight-bold">
                                      Ph?????ng/X??
                                    </Label>
                                    <Col sm={8}>
                                      <Field
                                        key={`ward_of_${values.business_district_id}`}
                                        name="business_ward_id"
                                        render={({ field/*, form*/ }) => {
                                          return (
                                            <WardComponent
                                              ref={(ward) => { this.refWard = ward }}
                                              id={field.name}
                                              name={field.name}
                                              onChange={({ value }) => field.onChange({
                                                target: { name: field.name, value }
                                              })}
                                              mainValue={values.business_district_id}
                                              value={values[field.name]}
                                              isDisabled={noEdit}
                                            />
                                          );
                                        }}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                                <Col sm={12}>
                                  <FormGroup row>
                                    <Label for="business_address" sm={2} className="font-weight-bold">
                                      ?????a Ch???
                                    </Label>
                                    <Col sm={10}>
                                      <Field
                                        name="business_address"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          id="business_address"
                                          placeholder="S??? nh??, ???????ng - khu ph???/th??n/x??m"
                                          disabled={noEdit}
                                        />}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                              </Row>
                            );
                          }}</Address>
                          <Row>
                            <Col sm={6}>
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
                                      id="is_active"
                                      label="K??ch ho???t"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="is_active" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}></Col>
                          </Row>
                          <Row>
                            <Col sm={12} className="text-right">
                              {
                                noEdit ? (
                                  <CheckAccess permission="AM_BUSINESS_EDIT">
                                    <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/businesses/edit/${businessEnt && businessEnt.id()}`)}>
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
                              <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/businesses')} className="btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-times-circle mr-1" />????ng
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

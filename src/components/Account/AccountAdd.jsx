import React, { Component } from "react";
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
  Media,
  InputGroup,
  InputGroupAddon,
  // InputGroupText,
  Table
} from "reactstrap";
import Select from "react-select";
import moment from "moment";

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address';
import DatePicker from '../Common/DatePicker';

// Util(s)
import { readFileAsBase64 } from '../../utils/html';
// Model(s)
import AccountModel from "../../models/AccountModel"; 

/**
 * @class AccountAdd
 */
export default class AccountAdd extends Component {

  /** @var {Object} */
  formikProps = null;
  
  constructor(props) {
    super(props);

    // Init model(s)
    this._accountModel = new AccountModel(); 
    // Bind method(s)
    this.handleUserImageChange = this.handleUserImageChange.bind(this);
    this.handleAddUserGroup = this.handleAddUserGroup.bind(this);
    this.handleRemoveUserGroup = this.handleRemoveUserGroup.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    // +++
    let { AccountEnt } = props;
    // let {} = AccountEnt || {};
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {String|null} */
      usrImgBase64: (AccountEnt && AccountEnt.defaultPictureUrl()) || null,
      /** @var {Boolean} */
      ready: false,
      /** @var {Object|null} */
      userData: null,
      /** @var {Array} */
      userGroups: [
        { name: "-- Nhóm người dùng --", id: "" },
      ],
      /** @var {Array} */
      positions: [
        { name: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      departments: [
        { name: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      genders: [
        { name: "Nam", id: "1" },
        { name: "Nữ", id: "0" },
      ],
      maritalStatus:[
        { name: "Chưa kết hôn", id: "0" },
        { name: "Đã kết hôn", id: "1" },
      ],
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      user_name: Yup.string().trim()
        .required("ID khách hàng là bắt buộc."),
      password: AccountEnt ? undefined : Yup.string().trim()
        .min(8, 'Mật khẩu quá ngắn, ít nhất 8 ký tự!')
        .max(25, 'Mật khẩu quá dài, tối đa 25 ký tự!')
        .required("Mật khẩu là bắt buộc."),
      gender: Yup.number()
        .required("Giới tính là bắt buộc."),
      birth_day: Yup.string().trim()
        .required("Ngày sinh là bắt buộc."),
      phone_number: Yup.string().trim()
        .matches(/^\d{10,11}$/, 'Điện thoại không hợp lệ!')
        .required("Điện thoại là bắt buộc."),
      phone_number_1: Yup.string().trim()
       .matches(/^\d{10,11}$/, 'Điện thoại không hợp lệ!'),
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
    let { AccountEnt } = this.props;
    let { accountData = {} } = this.state;
    let values = Object.assign(
      {}, this._accountModel.fillable(),
      {
        // Set default country to 'VN'
        country_id: DEFAULT_COUNTRY_ID,
      },
      accountData
    );
    if (AccountEnt) {
      Object.assign(values, AccountEnt);
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // values[key] += '';
      // birthday
      if (key === 'birth_day') {
        let bdArr = values[key].match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
        bdArr && (values[key] = `${bdArr[3]}-${bdArr[2]}-${bdArr[1]}`);
      }
      // user_groups
      if (key === 'user_groups') {
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
    let bundle = {};
    let all = [];
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

  makeAvatarStr(values = {})
  {
    let {
      positions = [],
      departments = []
    } = this.state;
    let position = positions.find(p => ('' + p.id) === ('' + values.position_id));
    let department = departments.find(d => ('' + d.id) === ('' + values.department_id));
    return [
      [
        values.user_name,
        [values.first_name, values.last_name].filter(_d => !!_d).join(' '),
      ].filter(_d => !!_d).join(' - '),
      [
        (position && position.id) ? position && position.name : '',
        (department && department.id) ? department && department.name : ''
      ].filter(_d => !!_d).join(' - '),
    ];
  }

  handleUserImageChange(event) {
    let { target } = event;
    if (target.files[0]) {
      readFileAsBase64(target, {
        // option: validate input
        validate: (file) => {
          // Check file's type
          if ('type' in file) {
            if (file.type.indexOf('image/') !== 0) {
              return 'Chỉ được phép sử dụng tập tin ảnh.';
            }
          }
          // Check file's size in bytes
          if ('size' in file) {
            let maxSize = 4; /*4mb*/
            if ((file.size / 1024 / 1024) > maxSize) {
              return `Dung lượng tập tin tối đa là: ${maxSize}mb.`;
            }
          }
        }
      })
        .then(usrImgBase64 => {
          this.setState({ usrImgBase64 });
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
      ;
    }
  }

  handleAddUserGroup({ item/*, action*/, form: { values, handleChange } }) {
    if (item && item.value) {
      let { userGroups = [] } = this.state;
      let { user_groups = [] } = values;
      let fItem = userGroups.find(_item => ('' + _item.id) === ('' + item.value));
      let dupId = user_groups.find(id => ('' + id) === ('' + item.value));
      if (fItem && !dupId) {
        user_groups.push(fItem.id);
        handleChange({
          target: { type: 'select', name: 'user_groups', value: user_groups }
        });
      }
    }
  }

  handleRemoveUserGroup({ item/*, event*/, form: { values, handleChange } }) {
    if (item && item.id) {
      let { user_groups } = values;
      let fIdx = user_groups.findIndex(id => ('' + id) === ('' + item.id));
      if (fIdx >= 0) {
        user_groups.splice(fIdx, 1);
        handleChange({
          target: { type: 'select', name: 'user_groups', value: user_groups }
        });
      }
    }
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

  handleFormikSubmit(values, formProps) { 
    let { AccountEnt } = this.props;
    let { usrImgBase64 } = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let { birth_day,id_card_date } = values;
    let bdArr = (birth_day && moment(birth_day).format("MM/DD/YYYY")) || '';
    let cdArr = (id_card_date && moment(id_card_date).format("DD/MM/YYYY")) || '';
    let member_id = (AccountEnt && AccountEnt.member_id) ? AccountEnt.member_id : 0;

    // +++
    let formData = Object.assign({}, values, {
      image_avatar: usrImgBase64,
      birth_day: (bdArr.length ? bdArr : ''),
      phone_number: '' + values.phone_number,
      password_confirm: values.password,
      city_id: values.province_id,
      description: values.about_me,
      marital_status: (values.marital_status == true) ? 1 : 0,
      id_card_date:(cdArr.length ? cdArr : ''),
      is_notification: (values.is_notification == true) ? 1: 0,
      is_can_email: (values.is_can_email == true) ? 1: 0,
      is_system: (values.is_system)? 1: 0,
      is_change_password: (member_id > 0) ? 0 : 1,
      is_active: (values.is_active)? 1: 0, 
    });  
    let memberId = (AccountEnt && AccountEnt.member_id) || formData[this._accountModel];
    let apiCall = memberId
      ? this._accountModel.update(memberId, formData)
      : this._accountModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/account');
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
        if (!AccountEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
    ;
  }

  handleFormikReset() { 
    this.setState(state => ({
      _id: 1 + state._id,
      ready: false,
      alerts: [],
      usrImgBase64: null
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
      usrImgBase64,
      genders,
      maritalStatus
    } = this.state;
    let { AccountEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues(); 
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
                <b>{AccountEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} khách hàng {AccountEnt ? AccountEnt.full_name : ''}</b>
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
                >
                  {formikProps => {
                  let {
                    values, 
                    handleSubmit,
                    handleReset, 
                    isSubmitting,
                    /* and other goodies */
                  } = (this.formikProps = window._formikProps = formikProps); 

                  // Render
                  return (
                    <Form 
                      id="form1st" 
                      onSubmit={handleSubmit} 
                      onReset={handleReset}
                    >
                      <Row>
                        <Col xs={12} sm={3}>
                          <FormGroup row>
                            <Col sm={12}>
                              <div className="hidden ps-relative">
                                <Media
                                  object
                                  src={usrImgBase64  || AccountModel.defaultImgBase64}
                                  alt="User image"
                                  className="user-imgage radius-50-percent"
                                />
                                <Input
                                  type="file"
                                  id="user_image_file"
                                  className="input-overlay"
                                  onChange={this.handleUserImageChange}
                                  disabled={noEdit}
                                />
                              </div>
                              <b className="center block">{this.makeAvatarStr(values).map((text, idx) => (text ? <p key={`avatar-text-${idx}`}>{text}</p> : null))}</b>
                            </Col>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={9}>

                            <Row className="mb15">
                                  <Col xs={12}>
                                  <b className="underline">Thông tin tài khoản</b>
                                  </Col>
                            </Row> 

                            <Row>                           
                              <Col xs={12} sm={6}>
                                <FormGroup row>
                                  <Label for="user_name" sm={4}>
                                    Tên đăng nhập <span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                      <Field name="user_name"
                                        render={({ field }) => (
                                          <Input
                                            {...field}
                                            onBlur={null}
                                            type="text" 
                                            disabled={noEdit}
                                          />
                                        )}
                                      />
                                      <ErrorMessage
                                        name="user_name" component={({ children }) => ( <Alert color="danger" className="field-validation-error">{children}</Alert> )}
                                      />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12} sm={6}>
                                <FormGroup row  hidden={!!AccountEnt} className={`${AccountEnt ? 'hidden' : ''}`}>
                                  <Label for="Password" sm={4}>
                                    Mật khẩu<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <InputGroup>
                                      <Field
                                        name="password"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type={`${this.state.passwordVisible ? 'text' : 'password'}`}
                                          name="password"
                                          id="password"
                                          placeholder="******"
                                          disabled={noEdit}
                                        />}
                                      />
                                      <InputGroupAddon addonType="append">
                                        <Button block onClick={() => {
                                          let { passwordVisible } = this.state;
                                          this.setState({ passwordVisible: !passwordVisible });
                                        }}>
                                          <i className={`fa ${this.state.passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`} />
                                        </Button>
                                      </InputGroupAddon>
                                    </InputGroup>
                                    <ErrorMessage name="password" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>                            
                            </Row>

                            <Row>
                              <Col xs={12} sm={6}>
                                <FormGroup row>
                                  <Label for="customer_code" sm={4}>
                                    Mã khách hàng<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="customer_code"
                                      render={({ field /* _form */ }) => <Input
                                        {...field}
                                        readOnly={true}
                                        onBlur={null}
                                        type="text"
                                        name="customer_code"
                                        id="customer_code" 
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="customer_code" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12} sm={6}>
                                <FormGroup row>
                                  <Label for="register_date" sm={4}>
                                    Ngày đăng ký<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                  <Field
                                      name="register_date"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="register_date"
                                            date={values.register_date ? moment(values.register_date, 'DD/MM/YYYY') : null}
                                            onDateChange={date => {
                                              setFieldValue('register_date', date)
                                            }}
                                            disabled={true}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                    <ErrorMessage name="register_date" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row className="mb15">
                              <Col xs={12}>
                                <b className="underline">Thông tin cá nhân</b>
                              </Col>
                            </Row> 

                            <Row>
                              <Col xs={12} sm={6}>
                                <FormGroup row>
                                  <Label for="full_name" sm={4}>
                                    Họ tên<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="full_name"
                                      render={({ field /* _form */ }) => <Input
                                        {...field}
                                        onBlur={null}
                                        type="full_name"
                                        name="full_name"
                                        id="full_name" 
                                        disabled={noEdit}
                                      />}
                                    />
                                    <ErrorMessage name="full_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12} sm={6}>
                                <FormGroup row>
                                  <Label for="birth_day" sm={4}>
                                    Ngày sinh<span className="font-weight-bold red-text">*</span>
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="birth_day"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="birth_day"
                                            date={values.birth_day ? moment(values.birth_day) : null}
                                            onDateChange={dates => {
                                              setFieldValue('birth_day', dates)
                                            }}
                                            disabled={noEdit}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                    <ErrorMessage name="birth_day" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                            </Row>

                          <Row>
                          <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="gender_1" sm={4}>
                                  Giới tính<span className="font-weight-bold red-text">*</span>
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
                                    <ErrorMessage name="gender" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />  
                                  </Row>
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="marital_status" sm={4}>
                                  Tình trạng hôn nhân
                                </Label>
                                <Col sm={8}>
                                  <Row>
                                    {maritalStatus.map(({ name, id }, idx) => {
                                      return (
                                        <Col xs={4} key={`marital-status-${idx}`}>
                                          <FormGroup check>
                                            <Label check>
                                              <Field
                                                name="marital_status"
                                                render={({ field /* _form */ }) => <Input
                                                  {...field}
                                                  onBlur={null}
                                                  value={id}
                                                  type="radio"
                                                  checked={(1 * values.marital_status) === (1 * id)}
                                                  id={`marital_status_${id}`}
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
                          </Row>

                          <Row>
                            <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="phone_number" sm={4}>
                                  Số điện thoại<span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="phone_number"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      name="phone_number"
                                      id="phone_number" 
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="phone_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="email" sm={4}>
                                  Email
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="email"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="email"
                                      name="email"
                                      id="email" 
                                      disabled={noEdit}
                                    />}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                          
                          <Row>
                            <Col xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="id_card" sm={4}>
                                  Số CMND
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="id_card"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      name="id_card"
                                      id="id_card" 
                                      disabled={noEdit}
                                    />}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={12} sm={6}>
                                <FormGroup row>
                                  <Label for="id_card_date" sm={4}>
                                    Ngày cấp
                                  </Label>
                                  <Col sm={8}>
                                    <Field
                                      name="birthdid_card_dateay"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="id_card_date"
                                            date={values.id_card_date ? moment(values.id_card_date) : null}
                                            onDateChange={date => {
                                              setFieldValue('id_card_date', date)
                                            }}
                                            disabled={noEdit}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                          </Row>

                          <Row>
                            <Col  xs={12} sm={6}>
                              <FormGroup row>
                                <Label for="id_card_place" sm={4}>
                                 Nơi cấp
                                </Label>
                                <Col sm={8}>
                                  <Field
                                    name="id_card_place"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      name="id_card_place"
                                      id="id_card_place"
                                      disabled={noEdit}
                                    />}
                                  /> 
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="mb15">
                            <Col xs={12}>
                              <b className="underline">Thông tin cá nhân</b>
                            </Col>
                          </Row> 

                          <Address className="row">{(addrProps) => {
                            let {
                              CountryComponent,
                              ProvinceComponent,
                              DistrictComponent,
                              WardComponent
                            } = addrProps;
                            return (
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Col sm={12}>
                                      <Row>
                                        <Col xs={12} sm={6} className="mb-1">
                                          <Field
                                            name="country_id"
                                            render={({ field, form }) => {
                                              return (
                                                <CountryComponent
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
                                        </Col>
                                        <Col xs={12} sm={6} className="mb-1">
                                          <Field
                                            key={`province_of_${values.country_id}`}
                                            name="province_id"
                                            render={({ field, form }) => {
                                              return (
                                                <ProvinceComponent
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
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col xs={12} sm={6} className="mb-1">
                                          <Field
                                            key={`district_of_${values.province_id}`}
                                            name="district_id"
                                            render={({ field, form }) => {
                                              return (
                                                <DistrictComponent
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
                                        </Col>
                                        <Col xs={12} sm={6} className="mb-1">
                                          <Field
                                            key={`ward_of_${values.district_id}`}
                                            name="ward_id"
                                            render={({ field/*, form*/ }) => {
                                              return (
                                                <WardComponent
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
                                        </Col>
                                      </Row>
                                    </Col>
                                  </FormGroup>
                                </Col>
                              );
                          }}</Address>
                          
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="address" sm={2}>
                                 Số nhà đường
                                </Label>
                                <Col sm={10}>
                                  <Field
                                    name="address"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      name="address"
                                      id="address"
                                      placeholder="Khu phố/ Thôn/ Xóm/ Tổ/ Số nhà/ Đường"
                                      disabled={noEdit}
                                    />}
                                  />
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="mb15">
                            <Col xs={12}>
                              <b className="underline">Thông tin xác nhận kích hoạt</b>
                            </Col>
                          </Row> 

                          <Row>
                            <Col xs={6} sm={4}>
                              <FormGroup row>
                                <Label for="is_confirm" sm={4}></Label>
                                <Col sm={8}>
                                  <Field
                                    name="is_confirm"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_confirm}
                                      type="switch"
                                      id={field.name}
                                      label="Đã xác nhận thông tin tài khoản"
                                      disabled={noEdit}
                                    />}
                                  /> 
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={6} sm={4}>
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
                                      label="Kích hoạt"
                                      disabled={noEdit}
                                    />}
                                  /> 
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={6} sm={4}>
                              <FormGroup row>
                                <Label for="is_system" sm={4}></Label>
                                <Col sm={8}>
                                  <Field
                                    name="is_system"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_system}
                                      type="switch"
                                      id={field.name}
                                      label="Hệ thống"
                                      disabled={noEdit}
                                    />}
                                  /> 
                                </Col>
                              </FormGroup>
                            </Col>
                          </Row>
                         
                          <Row className="mb15">
                            <Col xs={12}>
                              <b className="underline">Thông tin nhận hỗ trợ</b>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs={6} sm={4}>
                              <FormGroup row>
                                <Label for="is_can_sms_or_phone" sm={4}></Label>
                                <Col sm={8}>
                                  <Field
                                    name="is_can_sms_or_phone"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_can_sms_or_phone}
                                      type="switch"
                                      id={field.name}
                                      label="Có nhận SMS và cuộc gọi?"
                                      disabled={noEdit}
                                    />}
                                  /> 
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={6} sm={4}>
                              <FormGroup row>
                                <Label for="is_can_email" sm={4}></Label>
                                <Col sm={8}>
                                  <Field
                                    name="is_can_email"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_can_email}
                                      type="switch"
                                      id={field.name}
                                      label="Có nhận mail?"
                                      disabled={noEdit}
                                    />}
                                  /> 
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col xs={6} sm={4}>
                              <FormGroup row>
                                <Label for="is_notification" sm={4}></Label>
                                <Col sm={8}>
                                  <Field
                                    name="is_notification"
                                    render={({ field /* _form */ }) => <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_notification}
                                      type="switch"
                                      id={field.name}
                                      label="Có nhận thông báo?"
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
                                  <CheckAccess permission="CRM_ACCOUNT_EDIT">
                                    <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/users/edit/${AccountEnt.member_id}`)}>
                                      <i className="fa fa-edit mr-1" />Chỉnh sửa
                                    </Button>
                                  </CheckAccess>
                                ):
                                [ 
                                  (AccountEnt && AccountEnt.member_id) && (<CheckAccess key="buttonUserPassword" permission="SYS_USER_PASSWORD">
                                  <Button color="warning text-white" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/account/account-change-password/${AccountEnt.member_id}`)}>
                                    <i className="fa fa-lock mr-1"></i>Thay đổi mật khẩu
                                  </Button>
                                </CheckAccess>),
                                  <Button 
                                    key="buttonSave" 
                                    type="submit" 
                                    color="primary" 
                                    disabled={isSubmitting} 
                                    onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                    <i className="fa fa-save mr-2" />Lưu
                                  </Button>,
                                  <Button 
                                  key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                    <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                  </Button>
                                ]
                              }
                              <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/account')} className="btn-block-sm mt-md-0 mt-sm-2">
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

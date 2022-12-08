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
  Media,
  InputGroup,
  InputGroupAddon,
  Nav,
  NavItem,
  NavLink,
  TabPane,
  TabContent,
  Table
} from "reactstrap";
import Select from "react-select";
import moment from "moment";
import DatePicker from '../Common/DatePicker';
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

// Assets
import "../Products/styles.scss";
// Component(s) 
import Loading from "../Common/Loading";
import RichEditor from "../Common/RichEditor";

// Util(s)
import { mapDataOptions4Select, readFileAsBase64, readImageBase64CallBack } from "../../utils/html";
// Model(s)
import NewsModel from "../../models/NewsModel";
import NewsCategoryModel from '../../models/NewsCategoryModel';
import NewsStatusModel from '../../models/NewsStatusModel';
/** @var {Object} */
const userAuth = window._$g.userAuth;

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16)
  })
}

/**
 * @class NewsAdd
 */
export default class NewsAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._newsModel = new NewsModel();
    // Bind method(s)
    this._newsCategoryModel = new NewsCategoryModel();
    this._newsStatus = new NewsStatusModel();
    this.handleUserImageChange = this.handleUserImageChange.bind(this);
    //    this.handleAddUserGroup = this.handleAddUserGroup.bind(this);
    //   this.handleRemoveUserGroup = this.handleRemoveUserGroup.bind(this);
    this.handleFormikBeforeRender = this.handleFormikBeforeRender.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    // +++
    let { NewsEnt } = props;
    // let {} = NewsEnt || {};
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      activeTab: "thongtin",
      /** @var {String|null} */
      usrImgBase64: (NewsEnt && NewsEnt.defaultPictureUrl()) || null,
      /** @var {Boolean} */
      ready: false,
      /** @var {Object|null} */
      userData: null,
      /** @var {Object} */
      newsStatus: [{ label: "-- Chọn --", value: "" }],
      /** @var {Object} */
      newsCategory: [{ label: "-- Chọn --", value: "" }],
      /** @var {Object} */
      newsTag: [{ label: "-- Chọn --", value: "" }],
      /** @var {Object} */
      newsMetaKeyword: [{ label: "-- Chọn --", value: "" }],
      /** @var {String} */
      seo_name: "",
      news_date: "",
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      news_title: Yup.string().trim()
        .required("Tiêu đề tin tức là bắt buộc."),
      news_category_id: Yup.string().trim()
        .required("Chuyên mục tin tức là bắt buộc."),
    });
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
    // Active tab
    this._dataActiveTabs[0] && this.toggleTab(this._dataActiveTabs[0]);
  }

  /**
   *
   * @return {Object}
   */
  getInitialValues() {
    let { NewsEnt } = this.props;
    let { accountData = {} } = this.state;
    let values = Object.assign(
      {},
      this._newsModel.fillable(),
      {
        // Set default country to 'VN'
        // country_id: DEFAULT_COUNTRY_ID,
      },
      accountData
    );

    if (NewsEnt) {
      let newsDataTag = []
      let newsDataMetaKeyword = []
      if (NewsEnt.news_tag) {
        const arr = NewsEnt.news_tag.split('|');
        newsDataTag = arr.map(({ session: label, id: value }) => ({ label, value: uuidv4() }));
      }
      if (NewsEnt.meta_key_words) {
        const arr = NewsEnt.meta_key_words.split('|');
        newsDataMetaKeyword = arr.map(({ session: label, id: value }) => ({ label, value: uuidv4() }));
      }

      Object.assign(values, NewsEnt, {
        news_tag: newsDataTag,
        meta_key_words: newsDataMetaKeyword,
      });
    }
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
      // values[key] += '';
      // birthday
      // if (key === 'birth_day') {
      //  let bdArr = values[key].match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
      //  bdArr && (values[key] = `${bdArr[3]}-${bdArr[2]}-${bdArr[1]}`);
      //}
      // user_groups
      if (key === "user_groups") {
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
    let all = [
      // @TODO
      this._newsCategoryModel.getOptions(-1,{})
        .then(data => (bundle['newsCategory'] = mapDataOptions4Select(data))),
      this._newsStatus.getOptions({ is_active: 1 })
        .then(data => (bundle['newsStatus'] = mapDataOptions4Select(data))),
      this._newsModel.getTag()
        .then(data => (bundle['newsTag'] = mapDataOptions4Select(data))),
      this._newsModel.getMetaKeyword()
        .then(data => (bundle['newsMetaKeyword'] = mapDataOptions4Select(data))),

    ];
    await Promise.all(all).catch(err =>
      window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      )
    );

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

  /** @var {Array} */
  _dataActiveTabs = [];

  toggleTab(activeTab) {
    this.setState({ activeTab });
  }

  makeAvatarStr(values = {}) {
    let { positions = [], departments = [] } = this.state;
    let position = positions.find(p => "" + p.id === "" + values.position_id);
    let department = departments.find(
      d => "" + d.id === "" + values.department_id
    );
    return [
      [
        values.user_name,
        [values.first_name, values.last_name].filter(_d => !!_d).join(" ")
      ]
        .filter(_d => !!_d)
        .join(" - "),
      [
        position && position.id ? position && position.name : "",
        department && department.id ? department && department.name : ""
      ]
        .filter(_d => !!_d)
        .join(" - ")
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
  handleSeoNameChange(event) {
    let { target } = event; 
    let seoname = target.value || "";  
    this.setState({ seo_name: seoname});    
  }

  updateURLNews = (item,seoName) => { 
    if(seoName.length == 0){ 
      let news_name_change = item.target.value ? this.ChangeAlias(item.target.value) : ""; 
      this.setState({ seo_name: news_name_change });
    } 
  }

  ChangeAlias = (val) => {
    var str = val;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, "-");
    str = str.replace(/[ ]/g, "-");
    str = str.trim();
    return str;
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
    let { NewsEnt } = this.props;
    let { usrImgBase64,seo_name } = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data
    // +++
    let today = new Date();
    // +++

    let news_tag = ''
    let meta_key_words = ''

    if (values.news_tag != null && values.news_tag.length > 0) {
      for (let k = 0; k < values.news_tag.length; k++) {
        if (news_tag) {
          news_tag += `|${values.news_tag[k].label}`
        } else {
          news_tag += values.news_tag[k].label
        }
      }
    }

    if (values.meta_key_words != null && values.meta_key_words.length > 0) {
      for (let k = 0; k < values.meta_key_words.length; k++) {
        if (meta_key_words) {
          meta_key_words += `|${values.meta_key_words[k].label}`
        } else {
          meta_key_words += values.meta_key_words[k].label
        }
      }
    }

    let { news_date } = values;
    let newsDate = (news_date && moment(news_date, 'DD/MM/YYYY').format("DD/MM/YYYY")) || '';

    let formData = Object.assign({}, values, {
      image_url: usrImgBase64,
      is_video: (values.is_video == true) ? 1 : 0,
      is_show_home: (values.is_show_home == true) ? 1 : 0,
      is_high_light: (values.is_high_light  == true) ? 1 : 0,
      is_show_notify: (values.is_show_notify  == true) ? 1 : 0,
      is_hot_news: (values.is_hot_news  == true) ? 1 : 0,
      is_system: (values.is_system  == true) ? 1 : 0,
      news_tag: news_tag,
      meta_key_words: meta_key_words,
      image_file_id: 0,
      news_date: (newsDate != "") ? newsDate : today.getDate() + '/' + + (today.getMonth() + 1) + '/' + today.getFullYear(),
      seo_name: (seo_name != "") ? seo_name : values.seo_name,
      is_active: (values.is_active  == true) ? 1 : 0,
    });
    // 
    let newsId = (NewsEnt && NewsEnt.news_id) || formData[this._newsModel];
   
    let apiCall = newsId
      ? this._newsModel.update(newsId, formData)
      : this._newsModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/news");
        }
        // Chain
        return data;
      })
      .catch(apiData => {
        // NG
        let { errors, statusText, message } = apiData;
        let msg = [`<b>${statusText || message}</b>`]
          .concat(errors || [])
          .join("<br/>");
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        //
        if (!NewsEnt && !willRedirect && !alerts.length) {
          return this.handleFormikReset();
        }
        this.setState(
          () => ({ alerts }),
          () => {
            window.scrollTo(0, 0);
          }
        );
      });
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

  handleEnterSession(session, data, key, ref) {
    let { values, handleChange } = this.formikProps;
    let value = values[key] || [];
    let newsValue = data.find(d => ('' + d.label) === ('' + session));
    if (newsValue === undefined) {
      let item = { label: session, value: uuidv4() };
      value.push(item);
      handleChange({ target: { name: key, value }});
      ref.blur();
      ref.focus();
    }
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      usrImgBase64,
      newsCategory,
      maritalStatus,
      newsStatus,
      _isVideo,
      seo_name
    } = this.state;
    let { NewsEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return ( 
      <div key={`view-${_id}`} className="animated fadeIn">
      <Row  className="d-flex justify-content-center">
        <Col xs={12}>
          <Card>
            <CardHeader>
              <b>
                {NewsEnt ? (noEdit ? "Chi tiết" : "Chỉnh sửa") : "Thêm mới"}{" "}
                Tin tức {NewsEnt ? NewsEnt.news_title : ""}
              </b>
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
                  onSubmit={this.handleFormikSubmit}
                >
                  {formikProps => {
                    let {
                      values,
                      handleSubmit,
                      handleReset,
                      isSubmitting
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
                      <Col xs={12}>
                        <Row>
                          <Col xs={12}> 
                              <Row>
                                <Col xs={12}>
                                  <Nav tabs>                                  
                                      <NavItem>
                                        <NavLink className={`${this.state.activeTab === "thongtin" ? "active" : ""}`} onClick={() => this.toggleTab("thongtin")} > Thông tin  </NavLink>
                                      </NavItem>                                    
                                
                                      <NavItem>
                                        <NavLink className={`${this.state.activeTab === "thuoctinh" ? "active" : ""}`} onClick={() => this.toggleTab("thuoctinh")}>Thuộc tính </NavLink>
                                      </NavItem>
                                  
                                        <NavItem>
                                          <NavLink
                                            className={`${this.state.activeTab === "seo" ? "active" : ""}`} onClick={() => this.toggleTab("seo")}>
                                            Seo
                                          </NavLink>
                                        </NavItem>
                                        <NavItem>
                                          <NavLink
                                            className={`${this.state.activeTab === "hinhanh" ? "active" : ""}`} onClick={() => this.toggleTab("hinhanh")}>
                                            Hình ảnh
                                          </NavLink>
                                        </NavItem>
                                  </Nav>
                                  <TabContent activeTab={this.state.activeTab} > 
                                      <TabPane tabId="thongtin">
                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="news_title" sm={3} className="text-right" > Tiêu đề{" "} <span className="font-weight-bold red-text">  * </span>
                                              </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="news_title"
                                                  render={({ field }) => (
                                                    <Input
                                                      {...field}
                                                    //  onBlur={(item) => this.updateURLNews(item, values.seo_name)}
                                                      type="text"
                                                      placeholder=""
                                                      disabled={noEdit}
                                                    />
                                                  )}
                                                />
                                                <ErrorMessage name="news_title" component={({ children }) => (<Alert color="danger" className="field-validation-error" > {children} </Alert>)} />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="short_description" sm={3} className="text-right" > Mô tả ngắn
                                              </Label>
                                              <Col sm={9}>
                                                <Field
                                                  name="short_description"
                                                  render={({ field /* _form */ }) => (
                                                    <Input
                                                      {...field}
                                                      onBlur={null}
                                                      type="textarea"
                                                      id="short_description"
                                                      disabled={noEdit}
                                                      maxLength={500}
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
                                              <Label for="description" sm={3} className="text-right" > Mô tả </Label>
                                              <Col sm={9}>
                                                <Field
                                                  name="description"
                                                  render={({
                                                    field /* _form */
                                                  }) => (
                                                      <Input
                                                        {...field}
                                                        onBlur={null}
                                                        type="textarea"
                                                        id="description"
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
                                            <FormGroup>
                                              <Row>
                                                <Label for="content" sm={3} className="text-right" > Nội dung </Label>
                                                <Col sm={9}>
                                                  <RichEditor
                                                    disable={noEdit}
                                                    setContents={values.content}
                                                    onChange={(content) => formikProps.setFieldValue("content", content)}
                                                  />
                                                </Col>
                                              </Row>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="author_full_name" sm={3} className="text-right" > Tác giả </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="author_full_name"
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
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="news_source" sm={3} className="text-right" >Nguồn tin tức </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="news_source"
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
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>
                                        
                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="news_date" sm={3} className="text-right" >Ngày đăng tin</Label>
                                              <Col sm={3}>
                                              <Field
                                                name="news_date"
                                                render={({
                                                  date,
                                                  form: { setFieldValue, setFieldTouched, values },
                                                  field,
                                                  ...props
                                                }) => {
                                                  return (
                                                    <DatePicker
                                                      id="news_date"
                                                      date={values.news_date ? moment(values.news_date, 'DD/MM/YYYY') : null}
                                                      onDateChange={date => {
                                                        setFieldValue('news_date', date)
                                                      }}
                                                      disabled={true} 
                                                    />
                                                  )
                                                }}
                                              />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>
                                      </TabPane>
                                   
                                      <TabPane tabId="thuoctinh">
                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="is_video" sm={3} className="text-right" >Tin video </Label>
                                              <Col sm={3}>
                                                <Field
                                                  name="is_video"
                                                  render={({ field }) => {
                                                    _isVideo = values.is_video ? 0: 1;
                                                    return(
                                                    <CustomInput
                                                      {...field}
                                                      className="pull-left"
                                                      onBlur={null}
                                                      checked={values.is_video}
                                                      type="switch"
                                                      id="is_video"
                                                      label="Tin tức video"
                                                      disabled={noEdit}
                                                    />
                                                  )}}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="video_link" sm={3} className="text-right" > Link video
                                              </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="video_link"
                                                  render={({ field }) => {
                                                    return (
                                                      <Input
                                                        {...field}
                                                        onBlur={null}
                                                        type="text"
                                                        placeholder=""
                                                        disabled={_isVideo}
                                                      />
                                                    )
                                                  }}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="news_status_id" sm={3} className="text-right" > Trạng thái tin tức </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="news_status_id"
                                                  render={({ field/*, form*/ }) => {
                                                    let defaultValue = newsStatus.find(({ value }) => (1 * value) === (1 * field.value));
                                                    let placeholder = (newsStatus[0] && newsStatus[0].newsStatus) || '';
                                                    return (
                                                      <Select
                                                        name={field.name}
                                                        onChange={({ value }) => field.onChange({
                                                          target: { type: "select", name: field.name, value }
                                                        })}
                                                        isSearchable={true}
                                                        placeholder={placeholder}
                                                        value={defaultValue}
                                                        options={newsStatus}
                                                        isDisabled={noEdit}
                                                      />
                                                    );
                                                  }}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="news_category_id" sm={3} className="text-right"> Chuyên mục tin tức  <span className="font-weight-bold red-text">  * </span></Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="news_category_id"
                                                  render={({ field/*, form*/ }) => {
                                                    let defaultValue = newsCategory.find(({ value }) => (1 * value) === (1 * field.value));
                                                    let placeholder = (newsCategory[0] && newsCategory[0].newsCategory) || '';
                                                    return (
                                                      <Select
                                                        name={field.name}
                                                        onChange={({ value }) => field.onChange({
                                                          target: { type: "select", name: field.name, value }
                                                        })}
                                                        isSearchable={true}
                                                        placeholder={placeholder}
                                                        value={defaultValue}
                                                        options={newsCategory}
                                                        isDisabled={noEdit}
                                                      />
                                                    );
                                                  }}
                                                />
                                                <ErrorMessage name="news_category_id" component={({ children }) => (<Alert color="danger" className="field-validation-error" > {children} </Alert>)} />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="news_tag" sm={3} className="text-right"> Thẻ </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="news_tag"
                                                  render={({ field/*, form*/ }) => {
                                                    let { newsTag } = this.state
                                                    let placeholder = (newsTag[0] && newsTag[0].label) || '';
                                                    return (
                                                      <Select
                                                        isMulti
                                                        id={field.name}
                                                        name={field.name}
                                                        ref={(ref) => { this.tag = ref }}
                                                        onChange={(changeItem) => {
                                                          field.onChange({
                                                            target: { type: "select", name: field.name, value: changeItem }
                                                          })
                                                        }}
                                                        onKeyDown={(event) => {
                                                          const { target } = event
                                                          if (event.keyCode === 13) {
                                                            this.handleEnterSession(target.value, newsTag, "news_tag", this.tag)
                                                          }
                                                        }}
                                                        isSearchable={true}
                                                        placeholder={placeholder}
                                                        defaultValue={field.value}
                                                        options={newsTag}
                                                        isDisabled={noEdit}
                                                      />
                                                    );
                                                  }}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                      </TabPane>
                                    
                                      <TabPane tabId="seo">
                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="meta_key_words" sm={3} className="text-right" > Từ khoá</Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="meta_key_words"
                                                  render={({ field/*, form*/ }) => {
                                                    let { newsMetaKeyword } = this.state
                                                    let placeholder = (newsMetaKeyword[0] && newsMetaKeyword[0].label) || '';
                                                    return (
                                                      <Select
                                                        isMulti
                                                        id={field.name}
                                                        name={field.name}
                                                        ref={(ref) => { this.metaKeyword = ref }}
                                                        onChange={(changeItem) => {
                                                          field.onChange({
                                                            target: { type: "select", name: field.name, value: changeItem }
                                                          })
                                                        }}
                                                        onKeyDown={(event) => {
                                                          const { target } = event
                                                          if (event.keyCode === 13) {
                                                            this.handleEnterSession(target.value, newsMetaKeyword, "meta_key_words", this.metaKeyword)
                                                          }
                                                        }}
                                                        isSearchable={true}
                                                        placeholder={placeholder}
                                                        defaultValue={field.value}
                                                        options={newsMetaKeyword}
                                                        isDisabled={noEdit}
                                                      />
                                                    );
                                                  }}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="meta_description" sm={3} className="text-right"> Chi tiết từ khoá mô tả </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="meta_description"
                                                  render={({
                                                    field /* _form */
                                                  }) => (
                                                      <Input
                                                        {...field}
                                                        onBlur={null}
                                                        type="textarea"
                                                        id="meta_description"
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
                                              <Label for="meta_title" sm={3} className="text-right"> Tiêu đề từ khoá mô tả</Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="meta_title"
                                                  render={({
                                                    field /* _form */
                                                  }) => (
                                                      <Input
                                                        {...field}
                                                        onBlur={null}
                                                        type="textarea"
                                                        id="meta_title"
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
                                              <Label for="seo_name" sm={3} className="text-right" > Tên trang tối ưu cho seo</Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="seo_name"
                                                  render={({ field }) => (
                                                    <Input
                                                      {...field} 
                                                      type="text"
                                                      placeholder="" 
                                                      //onBlur={(Item) => this.setState({ seo_name: Item.target.value || "" })}
                                                    // onChange={(Item) =>this.setState({ seo_name: Item.target.value || "" })}
                                                    // value={seo_name || values.seo_name }
                                                      disabled={noEdit}
                                                    />
                                                  )}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>
                                      </TabPane>
                                   
                                      <TabPane tabId="hinhanh">
                                        <Row>
                                          <Col xs={12} sm={3}>
                                            <FormGroup row>
                                              <Col sm={12}>
                                                <div className="hidden ps-relative">
                                                  <Media
                                                    object
                                                    src={usrImgBase64 || NewsModel.defaultImgBase64}
                                                    alt="User image"
                                                    className="user-imgage"
                                                  />
                                                  <Input
                                                    type="file"
                                                    id="image_url"
                                                    className="input-overlay"
                                                    onChange={this.handleUserImageChange}
                                                    disabled={noEdit}
                                                  />
                                                </div>
                                                <b className="center block">{this.makeAvatarStr(values).map((text, idx) => (text ? <p key={`avatar-text-${idx}`}>{text}</p> : null))}</b>
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>
                                      </TabPane>
                                  
                                  </TabContent>
                                </Col>
                              </Row> 
                          </Col>
                        </Row>

                        <Row>
                          <Col xs={12} className="m-t-10">
                            <FormGroup row>
                              <Col sm={3}>
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
                              <Col sm={3}>
                                <Field
                                  name="is_show_home"
                                  render={({ field }) => (
                                    <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_show_home}
                                      type="switch"
                                      id="is_show_home"
                                      label="Hiển thị trang chủ"
                                      disabled={noEdit}
                                    />
                                  )}
                                />
                              </Col>
                              <Col sm={3}>
                                <Field name="is_high_light"
                                  render={({ field }) => (
                                    <CustomInput
                                      {...field}
                                      className="pull-left"
                                      onBlur={null}
                                      checked={values.is_high_light}
                                      type="switch"
                                      id="is_high_light"
                                      label="Làm tin nổi bật"
                                      disabled={noEdit}
                                    />
                                  )}
                                />
                              </Col>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={12} className="m-t-10">
                        <FormGroup row>
                          <Col sm={3}>
                            <Field
                              name="is_system"
                              render={({ field }) => (
                                <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_system}
                                  type="switch"
                                  id="is_system"
                                  label="Hệ thống"
                                  disabled={noEdit}
                                />
                              )}
                            />
                          </Col>
                          <Col sm={3}>
                            <Field name="is_show_notify"
                              render={({ field }) => (
                                <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_show_notify}
                                  type="switch"
                                  id="is_show_notify"
                                  label="Hiển thị thông báo"
                                  disabled={noEdit}
                                />
                              )}
                            />
                          </Col>

                          <Col sm={3}>
                            <Field name="is_hot_news"
                              render={({ field }) => (
                                <CustomInput
                                  {...field}
                                  className="pull-left"
                                  onBlur={null}
                                  checked={values.is_hot_news}
                                  type="switch"
                                  id="is_hot_news"
                                  label="Làm tin hót"
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
                              {noEdit ? ( 
                                  <Button
                                    color="primary"
                                    className="mr-2 btn-block-sm"
                                    onClick={() =>
                                      window._$g.rdr(`/news/edit/${NewsEnt && NewsEnt.id()}`)
                                    } 
                                  >
                                    <i className="fa fa-edit mr-1" />
                                    Chỉnh sửa
                                  </Button> 
                              ) : (
                                  [
                                    false !==
                                      this.props.handleActionSave ? (
                                        <Button
                                          key="buttonSave"
                                          type="submit"
                                          color="primary"
                                          disabled={isSubmitting}
                                          onClick={() =>
                                            this.handleSubmit("savnpme")
                                          }
                                          className="ml-3" >
                                          <i className="fa fa-save mr-2" />{" "} <span className="ml-1">Lưu</span>
                                        </Button>
                                      ) : null,
                                    false !==
                                      this.props.handleActionSaveAndClose ? (
                                        <Button
                                          key="buttonSaveClose"
                                          type="submit"
                                          color="success"
                                          disabled={isSubmitting}
                                          onClick={() =>
                                            this.handleSubmit("save_n_close")
                                          }
                                          className="ml-3"
                                        >
                                          <i className="fa fa-save mr-2" />{" "}
                                          <span className="ml-1"> {" "} Lưu &amp; Đóng{" "} </span>
                                        </Button>
                                      ) : null
                                  ]
                                )}
                              <Button
                                disabled={isSubmitting}
                                onClick={
                                  this.props.handleActionClose ||
                                  (() => window._$g.rdr("/news"))
                                }
                                className="ml-3"
                              >
                                <i className="fa fa-times-circle mr-1" />{" "}
                                <span className="ml-1">Đóng</span>
                              </Button>
                            </div>
                          </Col>
                        </FormGroup>
                      </Col>
                    </Row>

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

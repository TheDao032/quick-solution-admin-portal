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
import SetupServicesModel from "../../models/SetupServicesModel";

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16)
  })
}

/**
 * @class SetupServicesAdd
 */
export default class SetupServicesAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._setupServicesModel = new SetupServicesModel();
    this.handleUserImageChange = this.handleUserImageChange.bind(this);
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // Init state
    // +++
    let { SetupServicesEnt } = props;
    // let {} = SetupServicesEnt || {};
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      activeTab: "thongtin",
      /** @var {String|null} */
      usrImgBase64: (SetupServicesEnt && SetupServicesEnt.defaultPictureUrl()) || null,
      /** @var {Boolean} */
      ready: false,
      /** @var {Object} */
      WebsiteCategoryOptions: [{ label: "-- Ch???n --", id: "" }],
      /** @var {Object} */
      setupServicesMetaKeyword: [{ label: "-- Ch???n --", value: "" }]
    };

    // Init validator
    this.formikValidationSchema = Yup.object().shape({
      setup_service_title: Yup.string().trim().required("Ti??u ????? g??i setup b???t bu???c."),
      webcategory_id: Yup.string().trim().required("Danh m???c websiter l?? b???t bu???c."),
      system_name_setup: Yup.string().trim().required("T??n h??? th???ng l?? b???t bu???c."),
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
    let { SetupServicesEnt } = this.props;
    let values = Object.assign(
      {},
      this._setupServicesModel.fillable(),
    );

    if (SetupServicesEnt) {
      let setupServicesDataMetaKeyword = []
      if (SetupServicesEnt.meta_key_words) {
        const arr = SetupServicesEnt.meta_key_words.split('|');
        setupServicesDataMetaKeyword = arr.map(x => ({ label : x, value: uuidv4() }));
      }
      Object.assign(values, SetupServicesEnt, {
        meta_key_words: setupServicesDataMetaKeyword,
      });
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
    let bundle = {};
    let all = [
      // @TODO
      this._setupServicesModel.getOptions({ is_active: 1 })
        .then(data => (bundle['WebsiteCategoryOptions'] = mapDataOptions4Select(data))),
      this._setupServicesModel.getMetaKeyword()
        .then(data => (bundle['setupServicesMetaKeyword'] = mapDataOptions4Select(data))),

    ];
    await Promise.all(all).catch(err =>
      window._$g.dialogs.alert(
        window._$g._(`Kh???i t???o d??? li???u kh??ng th??nh c??ng (${err.message}).`),
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

  handleUserImageChange(event) {
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
        .then(usrImgBase64 => {
          this.setState({ usrImgBase64 });
        })
        .catch(err => {
          window._$g.dialogs.alert(window._$g._(err.message));
        })
        ;
    }
  }

  ChangeAlias = (val) => {
    var str = val;
    str = str.toLowerCase();
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "a");
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, "e");
    str = str.replace(/??|??|???|???|??/g, "i");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "o");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, "u");
    str = str.replace(/???|??|???|???|???/g, "y");
    str = str.replace(/??/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, "-");
    str = str.replace(/[ ]/g, "-");
    str = str.trim();
    return str;
  }
  /** @var {String} */
  _btnType = null;

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { SetupServicesEnt } = this.props;
    let { usrImgBase64 } = this.state;
    let { setSubmitting } = formProps;
    let willRedirect = false;
    let alerts = [];
    // Build form data

    let meta_key_words = '';

    if (values.meta_key_words != null && values.meta_key_words.length > 0) {
      for (let k = 0; k < values.meta_key_words.length; k++) {
        if (meta_key_words) {
          meta_key_words += `|${values.meta_key_words[k].label}`
        } else {
          meta_key_words += values.meta_key_words[k].label
        }
      }
    }
    let formData = Object.assign({}, values, {
      image_url: usrImgBase64,
      is_active: (values.is_active === true || values.is_active === 1) ? 1 : 0,
      is_system: (values.is_system === true || values.is_system === 1) ? 1 : 0,
      is_show_home: (values.is_show_home === true || values.is_show_home === 1) ? 1 : 0,
      is_service_package: (values.is_service_package === true || values.is_service_package === 1) ? 1 : 0,
      meta_key_words: meta_key_words,
      image_file_id: 0,
      webcategory_id:
        1 * values.webcategory_id > 0
          ? 1 * values.webcategory_id
          : 1 * values.webcategory_id.value || 0,
      seo_name: this.ChangeAlias(values.setup_service_title)
    });
    let setupServiceId = (SetupServicesEnt && SetupServicesEnt.setup_service_id) || formData[this._setupServicesModel];

    let apiCall = setupServiceId
      ? this._setupServicesModel.update(setupServiceId, formData)
      : this._setupServicesModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("L??u th??nh c??ng!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/setup-service");
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
        if (!SetupServicesEnt && !willRedirect && !alerts.length) {
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
    let setupServicesValue = data.find(d => ('' + d.label) === ('' + session));
    if (setupServicesValue === undefined) {
      let item = { label: session, value: uuidv4() };
      value.push(item);
      handleChange({ target: { name: key, value } });
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
      WebsiteCategoryOptions
    } = this.state;
    let { SetupServicesEnt, noEdit } = this.props;
    /** @var {Object} */
    let initialValues = this.getInitialValues();
    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>
                  {SetupServicesEnt ? (noEdit ? "Chi ti???t" : "Ch???nh s???a") : "Th??m m???i"}{" "}
                Tin t???c {SetupServicesEnt ? SetupServicesEnt.setup_service_title : ""}
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
                                        <NavLink className={`${this.state.activeTab === "thongtin" ? "active" : ""}`} onClick={() => this.toggleTab("thongtin")} > Th??ng tin  </NavLink>
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
                                          H??nh ???nh
                                          </NavLink>
                                      </NavItem>
                                    </Nav>
                                    <TabContent activeTab={this.state.activeTab} >
                                      <TabPane tabId="thongtin">
                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label sm={3} className="text-right" > Danh m???c website{" "} <span className="font-weight-bold red-text">{" "}*{" "}</span>
                                              </Label>
                                              <Col sm={9}>
                                                <Field
                                                  name="webcategory_id"
                                                  render={({ field /*, form*/ }) => {
                                                    let defaultValue = WebsiteCategoryOptions.find(
                                                      ({ value }) =>
                                                        1 * value === 1 * field.value
                                                    );
                                                    let placeholder =
                                                      (WebsiteCategoryOptions[0] &&
                                                        WebsiteCategoryOptions[0].label) ||
                                                      "";
                                                    return (
                                                      <Select
                                                        name={field.name}
                                                        onChange={({ value }) =>
                                                          field.onChange({
                                                            target: {
                                                              type: "select",
                                                              name: field.name,
                                                              value
                                                            }
                                                          })
                                                        }
                                                        isSearchable={true}
                                                        placeholder={placeholder}
                                                        defaultValue={defaultValue}
                                                        options={WebsiteCategoryOptions}
                                                        isDisabled={noEdit}
                                                        className="z-index-222"
                                                      />
                                                    );
                                                  }}
                                                />
                                                <ErrorMessage
                                                  name="webcategory_id"
                                                  component={({ children }) => (
                                                    <Alert
                                                      color="danger"
                                                      className="field-validation-error"
                                                    >
                                                      {children}
                                                    </Alert>
                                                  )}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label sm={3} className="text-right" >
                                                T??n h??? th???ng{" "}
                                                <span className="font-weight-bold red-text"> {" "} * {" "} </span>
                                              </Label>
                                              <Col sm={9}>
                                                <Field
                                                  name="system_name_setup"
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
                                                  name="system_name_setup"
                                                  component={({ children }) => (
                                                    <Alert color="danger" className="field-validation-error" >
                                                      {children}
                                                    </Alert>
                                                  )}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label sm={3} className="text-right" >
                                                Ti??u ????? d???ch v??? setup{" "}
                                                <span className="font-weight-bold red-text"> {" "} * {" "} </span>
                                              </Label>
                                              <Col sm={9}>
                                                <Field
                                                  name="setup_service_title"
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
                                                  name="setup_service_title"
                                                  component={({ children }) => (
                                                    <Alert
                                                      color="danger"
                                                      className="field-validation-error"
                                                    >
                                                      {children}
                                                    </Alert>
                                                  )}
                                                />
                                              </Col>
                                            </FormGroup>
                                          </Col>
                                        </Row>

                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="short_description" sm={3} className="text-right" > M?? t??? ng???n
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
                                              <Label for="description" sm={3} className="text-right" > M?? t??? </Label>
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
                                                <Label for="content" sm={3} className="text-right" > N???i dung </Label>
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
                                      </TabPane>

                                      <TabPane tabId="seo">
                                        <Row>
                                          <Col xs={12}>
                                            <FormGroup row>
                                              <Label for="meta_key_words" sm={3} className="text-right" > T??? kho??</Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="meta_key_words"
                                                  render={({ field/*, form*/ }) => {
                                                    let { setupServicesMetaKeyword } = this.state
                                                    let placeholder = (setupServicesMetaKeyword[0] && setupServicesMetaKeyword[0].label) || '';
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
                                                            this.handleEnterSession(target.value, setupServicesMetaKeyword, "meta_key_words", this.metaKeyword)
                                                          }
                                                        }}
                                                        isSearchable={true}
                                                        placeholder={placeholder}
                                                        defaultValue={field.value}
                                                        options={setupServicesMetaKeyword}
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
                                              <Label for="meta_descriptions" sm={3} className="text-right"> Chi ti???t t??? kho?? m?? t??? </Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="meta_descriptions"
                                                  render={({
                                                    field /* _form */
                                                  }) => (
                                                      <Input
                                                        {...field}
                                                        onBlur={null}
                                                        type="textarea"
                                                        id="meta_descriptions"
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
                                              <Label for="meta_title" sm={3} className="text-right"> Ti??u ????? t??? kho?? m?? t???</Label>
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
                                              <Label for="seo_name" sm={3} className="text-right" > T??n trang t???i ??u cho seo</Label>
                                              <Col sm={7}>
                                                <Field
                                                  name="seo_name"
                                                  render={({ field }) => {
                                                    return (
                                                      <Input
                                                        {...field}
                                                        onBlur={null}
                                                        type="text"
                                                        placeholder=""
                                                        value={this.ChangeAlias(values.setup_service_title)}
                                                        disabled={noEdit}
                                                      />)
                                                  }}
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
                                                    src={usrImgBase64 || SetupServicesModel.defaultImgBase64}
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
                                                {/* <b className="center block">{this.makeAvatarStr(values).map((text, idx) => (text ? <p key={`avatar-text-${idx}`}>{text}</p> : null))}</b> */}
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
                              <Col xs={12} className="mt-2">
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
                                          label="K??ch ho???t"
                                          disabled={noEdit}
                                        />
                                      )}
                                    />
                                  </Col>
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
                                          label="H??? th???ng"
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
                                          label="Hi???n th??? trang ch???"
                                          disabled={noEdit}
                                        />
                                      )}
                                    />
                                  </Col>
                                  <Col sm={3}>
                                    <Field name="is_service_package"
                                      render={({ field }) => (
                                        <CustomInput
                                          {...field}
                                          className="pull-left"
                                          onBlur={null}
                                          checked={values.is_service_package}
                                          type="switch"
                                          id="is_service_package"
                                          label="L?? g??i d???ch v???"
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
                                        window._$g.rdr(`/setup-service/edit/${SetupServicesEnt && SetupServicesEnt.id()}`)
                                      }
                                    >
                                      <i className="fa fa-edit mr-1" />
                                    Ch???nh s???a
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
                                              <i className="fa fa-save mr-2" />{" "} <span className="ml-1">L??u</span>
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
                                              <span className="ml-1"> {" "} L??u &amp; ????ng{" "} </span>
                                            </Button>
                                          ) : null
                                      ]
                                    )}
                                  <Button
                                    disabled={isSubmitting}
                                    onClick={
                                      this.props.handleActionClose ||
                                      (() => window._$g.rdr("/setup-service"))
                                    }
                                    className="ml-3"
                                  >
                                    <i className="fa fa-times-circle mr-1" />{" "}
                                    <span className="ml-1">????ng</span>
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

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
  CustomInput
} from "reactstrap";
import Select from 'react-select';
import { DropzoneArea } from 'material-ui-dropzone'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';
// Model(s)
import BannerModel from "../../models/BannerModel";

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

/**
 * @class BannerAdd
 */
export default class BannerAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._BannerModel = new BannerModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Boolean} */
      clearImage: false,
      /** @var {String} */
      urlImageEdit: "",
      /** @var {Array} */
      bannertype_list: [
        { label: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      webcategory_list: [
        { label: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      positon_banner_list: [
        { label: "-- Chọn --", id: "" },
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

  formikValidationSchema = Yup.object().shape({
    banner_type_id: Yup.string().required("Loại banner là bắt buộc."),
    picture_url: Yup.string().required("Hình ảnh là bắt buộc."),
    system_name: Yup.string().required("Vị trí đặt banner là bắt buộc."),
    picture_alias: Yup.string().required("Định dạng ảnh là bắt buộc."),
  });
  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { BannerEnt } = this.props;
    let values = Object.assign(
      {}, this._BannerModel.fillable(),
    );

    if (BannerEnt) {
      Object.assign(values, BannerEnt);
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
    let { BannerEnt } = this.props;
    let bundle = {};
    let all = [
      this._BannerModel.getOptionsBannerType({ is_active: 1 })
        .then(data => { return (bundle['bannertype_list'] = mapDataOptions4Select(data)) }),
      this._BannerModel.getOptionsWebCategory({ is_active: 1 })
        .then(data => { return (bundle['webcategory_list'] = mapDataOptions4Select(data)) }),
      this._BannerModel.getOptionsPositionBanner()
        .then(data => { return (bundle['positon_banner_list'] = mapDataOptions4Select(data)) }),
    ];

    await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ));

    if (BannerEnt && BannerEnt.picture_url) {
      bundle["urlImageEdit"] = BannerEnt.picture_url;
    }
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data);
      }
      bundle[key] = data;
    });
    return bundle;
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
    let { BannerEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    console.log(values);
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active || 0,
      is_slide: 1 * values.is_slide || 0,
      banner_type_id: ((1 * values.banner_type_id) > 0 ? 1 * values.banner_type_id : (1 * values.banner_type_id.value || 0)),
      web_category_id: ((1 * values.web_category_id) > 0 ? 1 * values.web_category_id : (1 * values.web_category_id.value || 0)),
      //system_name: (!values.system_name ? values.system_name : values.system_name.value),
    });

    let BannerID = (BannerEnt && BannerEnt.banner_id) || formData[this._BannerModel];

    let apiCall = BannerID
      ? this._BannerModel.update(BannerID, formData)
      : this._BannerModel.create(formData)
      ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/banner');
        }

        if (this._btnType === 'save' && !BannerID) {
          resetForm();
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
        if (!BannerEnt && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }

        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      })
      ;
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: true,
      alerts: [],
      clearImage: true
    }));
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({
        ...bundle,
        ready: true,
        clearImage: false
      });
    })();
    //.end
  }

  onDropImage(files, field) {
    const reader = new FileReader();
    reader.readAsDataURL(files);
    reader.onload = (event) => {
      field.onChange({
        target: { type: "text", name: field.name, value: event.target.result }
      })
    };
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      bannertype_list,
      webcategory_list,
      positon_banner_list
    } = this.state;

    let { BannerEnt, noEdit } = this.props;
    let initialValues = this.getInitialValues();

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12}>
            <Card >
              <CardHeader>
                <b>{BannerEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} banner {BannerEnt ? BannerEnt.news_category_name : ''}</b>
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
                      isSubmitting
                    } = (this.formikProps = window._formikProps = formikProps);
                    // Render
                    return (
                      <Form
                        id="form1st"
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                      >
                        <Row className="d-flex justify-content-center">
                          <Col xs={12}>
                            <Row className="mb-4">
                              <Col xs={12}>
                                <b className="title_page_h1 text-primary">Thông tin banner</b>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12} sm={12}>
                                <Row>
                                  <Col xs={6}>
                                    <FormGroup row>
                                      <Label sm={4} for="banner_type_id"> Loại Banner <span className="font-weight-bold red-text"> * </span></Label>
                                      <Col sm={8}>
                                        <Field
                                          name="banner_type_id"
                                          render={({ field /*, form*/ }) => {
                                            let defaultValue = bannertype_list.find(({ value }) => 1 * value === 1 * field.value);
                                            let placeholder = (bannertype_list[0] && bannertype_list[0].label) || "";
                                            return (
                                              <Select
                                                name={field.name}
                                                onChange={({ value }) => field.onChange({
                                                  target: { type: "select", name: field.name, value }
                                                })}
                                                isSearchable={true}
                                                placeholder={placeholder}
                                                defaultValue={defaultValue}
                                                options={bannertype_list}
                                                isDisabled={noEdit}
                                                className="z-index-222"
                                              />
                                            );
                                          }}
                                        />
                                        <ErrorMessage name="banner_type_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={6}>
                                    <FormGroup row>
                                      <Label sm={4}> Danh mục website </Label>
                                      <Col sm={8}>
                                        <Field
                                          name="web_category_id"
                                          render={({ field /*, form*/ }) => {
                                            let defaultValue = webcategory_list.find(({ value }) => 1 * value === 1 * field.value);
                                            let placeholder = (webcategory_list[0] && webcategory_list[0].label) || "";
                                            return (
                                              <Select
                                                name={field.name}
                                                onChange={({ value }) => field.onChange({
                                                  target: { type: "select", name: field.name, value }
                                                })}
                                                isSearchable={true}
                                                placeholder={placeholder}
                                                defaultValue={defaultValue}
                                                options={webcategory_list}
                                                isDisabled={noEdit}
                                                className="z-index-222"
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
                                      <Label sm={2}> Ảnh banner <span className="font-weight-bold red-text"> * </span> </Label>
                                      <Col xs={12} sm={10}>
                                        {
                                          !this.state.clearImage &&
                                          <Field
                                            name="picture_url"
                                            render={({ field }) => {
                                              // render image edit
                                              if (this.state.urlImageEdit) {
                                                return <div className="tl-render-image">
                                                  <img src={this.state.urlImageEdit} alt="images" />
                                                  {
                                                    !noEdit ?
                                                      <button onClick={() => this.setState({ urlImageEdit: "" })} >
                                                        <i className="fa fa-trash" aria-hidden="true"></i>
                                                      </button> : null
                                                  }
                                                </div>
                                              }

                                              return <div className="tl-drop-image">
                                                <DropzoneArea
                                                  {...field}
                                                  acceptedFiles={['image/*']}
                                                  filesLimit={1}
                                                  dropzoneText=""
                                                  disabled={noEdit}
                                                  onDrop={(files) => this.onDropImage(files, field)}
                                                  onDelete={() => field.onChange({
                                                    target: { type: "text", name: field.name, value: "" }
                                                  })}
                                                >
                                                </DropzoneArea>
                                              </div>
                                            }}
                                          />
                                        }
                                        <ErrorMessage name="picture_url" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                </Row>

                                <Row>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label sm={2}> Chọn vị trí đặt banner<span className="font-weight-bold red-text"> * </span></Label>
                                      <Col sm={4}>
                                        <Field
                                          name="system_name"
                                          render={({ field /*, form*/ }) => {
                                            let defaultValue = positon_banner_list.find(({ value }) => value === field.value );
                                            let placeholder = (positon_banner_list[0] && positon_banner_list[0].label) || "";
                                            return (
                                              <Select
                                                name={field.name}
                                                onChange={({ value }) => field.onChange({
                                                  target: { type: "select", name: field.name, value }
                                                })}
                                                isSearchable={true}
                                                placeholder={placeholder}
                                                defaultValue={defaultValue}
                                                options={positon_banner_list}
                                                isDisabled={noEdit}
                                              />
                                            );
                                          }}
                                        />
                                        <ErrorMessage name="system_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                      </Col>
                                      <Label sm={2}> Định danh ảnh <span className="font-weight-bold red-text"> * </span> </Label>
                                      <Col sm={4}>
                                        <Field
                                          name="picture_alias"
                                          render={({ field }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="text"
                                            placeholder=""
                                            disabled={noEdit}
                                            maxLength={200}
                                          />}
                                        />
                                        <ErrorMessage name="picture_alias" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                </Row>

                                <Row>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="descriptions" sm={2}>Mô tả</Label>
                                      <Col sm={10}>
                                        <Field
                                          name="descriptions"
                                          render={({ field /* _form */ }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="textarea"
                                            id="descriptions"
                                            disabled={noEdit}
                                            maxLength={400}
                                          />}
                                        />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                </Row>

                                <Row>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label sm={2}></Label>
                                      <Col sm={4}>
                                        <Label for="is_slide" sm={4}></Label>
                                        <Col sm={8}>
                                          <Field
                                            name="is_slide"
                                            render={({ field }) => <CustomInput
                                              {...field}
                                              className="pull-left"
                                              onBlur={null}
                                              checked={values.is_slide}
                                              type="switch"
                                              id="is_slide"
                                              label="Dạng slide"
                                              disabled={noEdit}
                                            />}
                                          />
                                        </Col>
                                      </Col>
                                      <Col sm={4}>
                                        <Label for="is_active" sm={4}></Label>
                                        <Col sm={8}>
                                          <Field
                                            name="is_active"
                                            render={({ field }) => <CustomInput
                                              {...field}
                                              className="pull-left"
                                              onBlur={null}
                                              checked={values.is_active}
                                              type="switch"
                                              id="is_active"
                                              label="Kích hoạt"
                                              disabled={noEdit}
                                            />}
                                          />
                                        </Col>
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Col sm={12} className="text-right">
                                        {
                                          noEdit ? (
                                            <CheckAccess permission="CMS_BANNER_EDIT">
                                              <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/banner/edit/${BannerEnt.banner_id}`)}>
                                                <i className="fa fa-edit mr-1" />Chỉnh sửa
                                                </Button>
                                            </CheckAccess>
                                          ) :
                                            [
                                              <CheckAccess permission={[
                                                "CMS_BANNER_EDIT",
                                                "CMS_BANNER_ADD",
                                              ]} any key={1}
                                              >
                                                <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                                  <i className="fa fa-save mr-2" />Lưu
                                                  </Button>
                                              </CheckAccess>,
                                              <CheckAccess permission={[
                                                "CMS_BANNER_EDIT",
                                                "CMS_BANNER_ADD",
                                              ]} any key={2}
                                              >
                                                <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                                  <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                                  </Button>
                                              </CheckAccess>
                                            ]
                                        }
                                        <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/banner')} className="btn-block-sm mt-md-0 mt-sm-2">
                                          <i className="fa fa-times-circle mr-1" />Đóng
                                          </Button>
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                </Row>
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

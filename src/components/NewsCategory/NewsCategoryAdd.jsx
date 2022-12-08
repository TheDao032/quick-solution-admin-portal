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
import NewsCategoryModel from "../../models/NewsCategoryModel";

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

/**
 * @class NewsCategoryAdd
 */
export default class NewsCategoryAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._newsCategoryModel = new NewsCategoryModel();
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
      /** @var {Number} */
      //parent_id:"",
      /** @var {Array} */
      parent_list: [
        { label: "-- Chọn --", id: "" },
      ],
      /** @var {Number} */
      //category_level:"",
      /** @var {Array} */
      category_level_list: [
        { id: "", name: "-- Chọn --", value: "", label: "-- Chọn --" }
      ],
      disabled_parent_list: false,
      parent_id: ""
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
    news_category_name: Yup.string()
      .required("Tên chuyên mục là bắt buộc."),
    category_level: Yup.string()
      .required("Mức chuyên mục là bắt buộc."),
    pictures: Yup.string()
      .required("Hình ảnh chuyên mục là bắt buộc."),
  });
  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { NewsCategoryEnt } = this.props;
    let values = Object.assign(
      {}, this._newsCategoryModel.fillable(),
    );
    if (NewsCategoryEnt) {
      Object.assign(values, NewsCategoryEnt);
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
    let { NewsCategoryEnt } = this.props;
    let bundle = {};
    if (NewsCategoryEnt && NewsCategoryEnt.pictures) {
      bundle["urlImageEdit"] = NewsCategoryEnt.pictures;
    }
    let category_level_list_Add = [
      { id: "1", name: "Mức 1" },
      { id: "2", name: "Mức 2" },
      { id: "3", name: "Mức 3" },
    ];
    bundle["category_level_list"] = mapDataOptions4Select(category_level_list_Add);
    let level_category_change = NewsCategoryEnt && NewsCategoryEnt.category_level ? NewsCategoryEnt.category_level : 0;
    bundle["disabled_parent_list"] = level_category_change === 1 ? true : false;
    bundle["parent_id"] = (NewsCategoryEnt && NewsCategoryEnt.parent_id) ? NewsCategoryEnt.parent_id : 0;
    let all = [
      this._newsCategoryModel.getOptions(level_category_change, {})
        .then(data => { return (bundle['parent_list'] = mapDataOptions4Select(data)) }),
    ];

    await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ));
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

  handleFormikSubmit(values, formProps) {
    let { NewsCategoryEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];
    console.log(this.state);
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active || 0,
      is_system: 1 * values.is_system || 0,
      is_cate_video: 1 * values.is_cate_video || 0,
      category_level: ((1 * values.category_level) > 0 ? 1 * values.category_level : (1 * values.category_level.value || 0)),
      parent_id: ((1 * this.state.parent_id) > 0 ? 1 * this.state.parent_id : 0),
    });
    console.log(this.state);
    console.log(this.props);
    console.log(formData);
    //return false;
    let newsCategoryID = (NewsCategoryEnt && NewsCategoryEnt.news_category_id) || formData[this._newsCategoryModel];
    let apiCall = newsCategoryID
      ? this._newsCategoryModel.update(newsCategoryID, formData)
      : this._newsCategoryModel.create(formData)
      ;
    apiCall
      .then(data => { // OK 
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/news-category');
        }

        if (this._btnType === 'save' && !newsCategoryID) {
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
        if (!NewsCategoryEnt && !willRedirect && !alerts.length) {
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
      clearImage: true,
    }));
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

  handleChangeCategoryLevel = level => {
    this._newsCategoryModel.getOptions((1 * level.value || 0))
      .then(data => {
        let dataChange = mapDataOptions4Select(data);
        dataChange.unshift({ label: "-- Chọn --", id: "", value: "", name: "-- Chọn --" });
        this.setState({
          disabled_parent_list: false,
          parent_list: dataChange,
          parent_id: 0
        });
        let { values, setValues } = this.formikProps;
        setValues(
          Object.assign(values, {
            category_level: 1 * level.value
          })
        );
        if ((1 * level.value === 1) || level.value === "") {
          this.setState({
            disabled_parent_list: true,
            parent_id: 0
          });
        }
      });
  }
  handleChangeParent = parent_id => {
    this.setState({
      parent_id: 1 * parent_id.value
    });
    let { values, setValues } = this.formikProps;
    setValues(
      Object.assign(values, {
        parent_id: 1 * parent_id.value
      })
    );
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      parent_list,
      category_level_list
    } = this.state;
    let { NewsCategoryEnt, noEdit } = this.props;
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
                <b>{NewsCategoryEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} chuyên mục tin tức {NewsCategoryEnt ? NewsCategoryEnt.news_category_name : ''}</b>
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
                                <b className="title_page_h1 text-primary">Thông tin danh mục</b>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12} sm={8}>
                                <Row >
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="news_category_name" sm={4}>
                                        Tên chuyên mục <span className="font-weight-bold red-text">*</span>
                                      </Label>
                                      <Col sm={8}>
                                        <Field
                                          name="news_category_name"
                                          render={({ field }) => <Input
                                            {...field}
                                            type="text"
                                            placeholder=""
                                            disabled={noEdit}
                                          />}
                                        />
                                        <ErrorMessage name="news_category_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup>
                                      <Row>
                                        <Label for="category_level" sm={4}>Mức chuyên mục  <span className="font-weight-bold red-text">*</span></Label>
                                        <Col sm={4}>
                                          <Field
                                            name="category_level"
                                            render={({ field/*, form*/ }) => {
                                              let defaultValue = category_level_list.find(({ value }) => 1 * value === 1 * field.value);
                                              let placeholder = (category_level_list[0] && category_level_list[0].label) || "";
                                              return (
                                                <Select
                                                  name={field.name}
                                                  onChange={(changeValue) => this.handleChangeCategoryLevel(changeValue)}
                                                  isSearchable={true}
                                                  placeholder={placeholder}
                                                  defaultValue={defaultValue || ""}
                                                  options={category_level_list.map(({ name: label, id: value }) => ({ value, label }))}
                                                  isDisabled={noEdit}
                                                />
                                              );
                                            }}
                                          />
                                          <ErrorMessage name="category_level" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                        </Col>
                                      </Row>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup>
                                      <Row>
                                        <Label for="parent_id" sm={4}> Chuyên mục cha </Label>
                                        <Col sm={8}>
                                          <Field
                                            name="parent_id"
                                            render={({ field /*, form*/ }) => {
                                              let placeholder = (parent_list[0] && parent_list[0].label) || "";
                                              console.log('this.state.parentId=>', this.state.parent_id);
                                              console.log('parent_list=>', parent_list);
                                              console.log('field=>', field);
                                              let defaultValue = 1 * this.state.parent_id !== 0 ?  parent_list.find(({ value }) => 1 * value === 1 * field.value):  parent_list[0];
                                              // let defaultValue = this.state.parent_id !== 0 ? parent_list.find(({ value }) => 1 * value === 1 * field.value) : parent_list.find(({ value }) => 1 * value === 0);
                                              console.log('defaultValue=>', defaultValue)
                                              return (
                                                <Select
                                                  name={field.name}
                                                  onChange={this.handleChangeParent}
                                                  isSearchable={true}
                                                  placeholder={placeholder}
                                                  defaultValue={defaultValue}
                                                  options={parent_list}
                                                  isDisabled={noEdit || this.state.disabled_parent_list}
                                                />
                                              );
                                            }}
                                          />
                                        </Col>
                                      </Row>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="order_index" sm={4}> Thứ tự hiển thị </Label>
                                      <Col sm={4}>
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
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="meta_key_words" sm={4}>
                                        Từ khóa mô tả
                                                </Label>
                                      <Col sm={8}>
                                        <Field
                                          name="meta_key_words"
                                          render={({ field }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="text"
                                            placeholder=""
                                            disabled={noEdit}
                                          />}
                                        />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="meta_descriptions" sm={4}>
                                        Chi tiết từ khóa mô tả
                                                </Label>
                                      <Col sm={8}>
                                        <Field
                                          name="meta_descriptions"
                                          render={({ field }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="textarea"
                                            placeholder=""
                                            disabled={noEdit}
                                          />}
                                        />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="meta_title" sm={4}>
                                        Tiêu đề từ khóa mô tả
                                                </Label>
                                      <Col sm={8}>
                                        <Field
                                          name="meta_title"
                                          render={({ field }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="text"
                                            placeholder=""
                                            disabled={noEdit}
                                          />}
                                        />
                                      </Col>
                                    </FormGroup>
                                  </Col>
                                  <Col xs={12}>
                                    <FormGroup row>
                                      <Label for="seo_name" sm={4}>
                                        Tên trang tối ưu cho SEO
                                                </Label>
                                      <Col sm={8}>
                                        <Field
                                          name="seo_name"
                                          render={({ field }) => <Input
                                            {...field}
                                            onBlur={null}
                                            type="text"
                                            placeholder=""
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
                                          <Label for="description" sm={4}>Mô tả</Label>
                                          <Col sm={8}>
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
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>

                              <Col xs={12} sm={4}>
                                <FormGroup row>
                                  <Col xs={12} sm={12}>
                                    {
                                      !this.state.clearImage &&
                                      <Field
                                        name="pictures"
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
                                    <ErrorMessage name="pictures" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                  </Col>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={4}>
                                <FormGroup row>
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
                                </FormGroup>
                              </Col>
                              <Col sm={4}>
                                <FormGroup row>
                                  <Label for="is_cate_video" sm={4}></Label>
                                  <Col sm={8}>
                                    <Field
                                      name="is_cate_video"
                                      render={({ field }) => <CustomInput
                                        {...field}
                                        className="pull-left"
                                        onBlur={null}
                                        checked={values.is_cate_video}
                                        type="switch"
                                        id="is_cate_video"
                                        label="Là chuyên mục video"
                                        disabled={noEdit}
                                      />}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col sm={4}>
                                <FormGroup row>
                                  <Label for="is_system" sm={4}></Label>
                                  <Col sm={8}>
                                    <Field
                                      name="is_system"
                                      render={({ field }) => <CustomInput
                                        {...field}
                                        className="pull-left"
                                        onBlur={null}
                                        checked={values.is_system}
                                        type="switch"
                                        id="is_system"
                                        label="Hệ thống"
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
                                  noEdit ? (
                                    <CheckAccess permission="NEWS_NEWSCATEGORY_EDIT">
                                      <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/news-category/edit/${NewsCategoryEnt.news_category_id}`)}> <i className="fa fa-edit mr-1" /> Chỉnh sửa </Button>
                                    </CheckAccess>
                                  ) :
                                    [
                                      <CheckAccess permission={[
                                        "NEWS_NEWSCATEGORY_EDIT",
                                        "NEWS_NEWSCATEGORY_ADD",
                                      ]} any key={1}
                                      >
                                        <Button key="buttonSave" type="submit" color="primary" disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm"><i className="fa fa-save mr-2" /> Lưu </Button>
                                      </CheckAccess>,
                                      <CheckAccess permission={[
                                        "NEWS_NEWSCATEGORY_EDIT",
                                        "NEWS_NEWSCATEGORY_ADD",
                                      ]} any key={2}
                                      >
                                        <Button key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2"><i className="fa fa-save mr-2" />Lưu &amp; Đóng</Button>
                                      </CheckAccess>
                                    ]
                                }
                                <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/news-category')} className="btn-block-sm mt-md-0 mt-sm-2"> <i className="fa fa-times-circle mr-1" />Đóng </Button>
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

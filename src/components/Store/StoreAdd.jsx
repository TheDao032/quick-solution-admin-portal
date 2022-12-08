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
  InputGroupAddon,
  InputGroup,
} from "reactstrap";
import Select from 'react-select';

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import Loading from '../Common/Loading';

// Model(s)
import StoreModel from "../../models/StoreModel";
import AreaModel from '../../models/AreaModel';
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address';

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

/**
 * @class StoreAdd
 */
export default class StoreAdd extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._storeModel = new StoreModel();
    this._areaModel = new AreaModel();

    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      areas: [
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

  formikValidationSchema = Yup.object().shape({
    store_name:Yup.string().required("Tên cửa hàng là bắt buộc."),
    area_id: Yup.string().required("Khu vực là bắt buộc."),
    phone_number: Yup.string().required("Số điện thoại là bắt buộc."),
    description: Yup.string().required("Mô tả là bắt buộc."),
    country_id: Yup.string().required("Quốc gia là bắt buộc."),
    province_id: Yup.string().required("Tỉnh/Thành phố là bắt buộc."),
    district_id: Yup.string().required("Quận/Huyện là bắt buộc."),
    ward_id: Yup.string().required("Phường/Xã là bắt buộc."),
    address: Yup.string().required("Địa chỉ là bắt buộc."),
    location_x: Yup.string().matches(/\d+\.\d+/, "Vĩ độ không hợp lệ."),
    location_y: Yup.string().matches(/\d+\.\d+/, "Kinh độ không hợp lệ."),
  });

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
  }

  /** @var {String} */
  _btnType = null;

  getInitialValues() {

    let { StoreEnt } = this.props;
    let values = Object.assign(
      {}, this._storeModel.fillable(),
      {
        country_id: DEFAULT_COUNTRY_ID,
      }
    );

    if (StoreEnt) {
      Object.assign(values, StoreEnt);
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
    let bundle = {};
    let all = [
      // @TODO
      this._areaModel.getOptions()
        .then(data => (bundle['areas'] = mapDataOptions4Select(data))),
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
    return bundle;
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }

  handleFormikSubmit(values, formProps) {
    let { StoreEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;
    
    let willRedirect = false;
    let alerts = []; 
    // Build form data
    let formData = Object.assign({}, values, {
      is_active: 1 * values.is_active,
    });
    let storeId = (StoreEnt && StoreEnt.store_id) || formData[this._storeModel];
    let apiCall = storeId
      ? this._storeModel.edit(storeId, formData)
      : this._storeModel.create(formData)
    ;
    apiCall
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
        if (this._btnType === 'save_n_close') {
          willRedirect = true;
          return window._$g.rdr('/store');
        }

        if (this._btnType === 'save' && !storeId) {
          resetForm();
          this.setState({ area: null });
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
        if (!StoreEnt && !willRedirect && !alerts.length) {
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
      areas,
      area
    } = this.state;
    let { StoreEnt, noEdit } = this.props;
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
                <b>{StoreEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} cửa hàng {StoreEnt ? StoreEnt.store_name : ''}</b>
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
                >{(formikProps) => {
                  let {
                    values,
                    handleSubmit,
                    handleReset,
                    isSubmitting,
                  } = (this.formikProps = window._formikProps = formikProps);
                  // Render
                  return (
                    <Form id="form1st" onSubmit={handleSubmit} onReset={handleReset}>
                      <Row className="mb15 page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Thông tin cửa hàng</b>
                        </Col>
                      </Row>
                      <Row >
                        <Col xs={12} sm={6}>
                          <FormGroup row>
                            <Label for="store_name"  xs={4}>
                              Tên cửa hàng <span className="font-weight-bold red-text">*</span>
                            </Label>
                            <Col xs={8}>
                              <Field
                                name="store_name"
                                render={({ field }) => <Input
                                  {...field}
                                  onBlur={null}
                                  type="text"
                                  placeholder=""
                                  disabled={noEdit}
                                />}
                              />
                              <ErrorMessage name="store_name" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                            </Col>
                          </FormGroup>
                        </Col>

                        <Col xs={12} sm={6}>
                            <FormGroup row>
                              <Label for="phone_number" sm={4}>
                                Điện thoại<span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col sm={7}>
                                <Field
                                  name="phone_number"
                                  render={({ field }) => <Input
                                    {...field}
                                    onBlur={null}
                                    type="text"
                                    name="phone_number"
                                    id="phone_number"
                                    maxLength={15}
                                    placeholder="077.7777.777"
                                    disabled={noEdit}
                                  />}
                                />
                                <ErrorMessage name="phone_number" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </FormGroup>
                          </Col>

                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Row>
                              <Label xs={4}>
                                Tên khu vực <span className="font-weight-bold red-text">*</span>
                              </Label>
                              <Col xs={8}>
                                <Field
                                  name="area_id"
                                  render={({ field/*, form*/ }) => {
                                    let defaultValue = areas.find(({ value }) => (1 * value) === (1 * field.value));
                                    let placeholder = (areas[0] && areas[0].label) || '';
                                    return (
                                      <Select
                                        name={field.name}
                                        isSearchable={true}
                                        placeholder={placeholder}
                                        defaultValue={defaultValue}
                                        options={areas}
                                        value={area}
                                        isDisabled={noEdit}
                                        onChange={({ value }) => field.onChange({
                                          target: { name: "area_id", value }
                                        })}
                                      />
                                    );
                                  }}
                                />
                                <ErrorMessage name="area_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>

                        <Col xs={12}>
                          <Row>
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="description" xs={4} sm={2}>
                                  Mô tả <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col xs={8} sm={10}>
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
                        </Col>
                      </Row>

                      <Row className="mb15 page_title">
                        <Col xs={12}>
                          <b className="title_page_h1 text-primary">Địa chỉ cửa hàng</b>
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
                                  Vĩ độ
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
                                  Kinh độ
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
                                <Label for="country_id" sm={4} className="font-weight-bold">
                                  Quốc gia <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
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
                                  <ErrorMessage name="country_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="province_id" sm={4} className="font-weight-bold">
                                  Tỉnh/Thành phố <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
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
                                  <ErrorMessage name="province_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="district_id" sm={4} className="font-weight-bold">
                                  Quận/Huyện <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
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
                                  <ErrorMessage name="district_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={6}>
                              <FormGroup row>
                                <Label for="ward_id" sm={4} className="font-weight-bold">
                                  Phường/Xã <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={8}>
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
                                  <ErrorMessage name="ward_id" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                </Col>
                              </FormGroup>
                            </Col>
                            <Col sm={12}>
                              <FormGroup row>
                                <Label for="address" sm={2} className="font-weight-bold">
                                  Địa Chỉ <span className="font-weight-bold red-text">*</span>
                                </Label>
                                <Col sm={10}>
                                  <Field
                                    name="address"
                                    render={({ field /* _form */ }) => <Input
                                      {...field}
                                      onBlur={null}
                                      type="text"
                                      id="address"
                                      placeholder="Số nhà, đường - khu phố/thôn/xóm"
                                      disabled={noEdit}
                                    />}
                                  />
                                  <ErrorMessage name="address" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
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
                                  label="Kích hoạt"
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
                            noEdit?(
                              <CheckAccess permission="MD_STORE_EDIT">
                                <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/store/edit/${StoreEnt.store_id}`)}>
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
                          <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/store')} className="btn-block-sm mt-md-0 mt-sm-2">
                            <i className="fa fa-times-circle mr-1" />Đóng
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
    );
  }
}

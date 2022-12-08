import React, { Component } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from 'moment';
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
  Table
} from "reactstrap";
import Select from "react-select";
import { convertToRaw, } from "draft-js"; 
import draftToHtml from "draftjs-to-html"; 
import DatePicker from '../Common/DatePicker';
// Component(s)
import Loading from "../Common/Loading"; 
import { CheckAccess } from '../../navigation/VerifyAccess'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "react-image-lightbox/style.css"; 
import "../Products/styles.scss";
// Model(s)
import CandidateModel from "../../models/CandidateModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";
import PositionModel from '../../models/PositionModel';
// Util(s)
import { mapDataOptions4Select, MOMENT_FORMAT_DATE } from "../../utils/html";

/**
 * @class SegmentAdd
 */
export default class CandidateAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._candidateModel = new CandidateModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
    this._positionModel = new PositionModel();
    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      companies: [{ label: "-- Chọn --", value: "" }],
      /** @var {Array} */
      businessArr: [{ label: "-- Chọn --", value: "" }],
      /** @var {Array}*/
      position:  [{ label: "-- Chọn --", value: "" }],
      /** @var {Array} */
      attachMentNameArr: [{}],
       /** @var {Array} */
       statusArr: [
        { label: "Ứng viên mới", value: "NEWAPPLY" },
        { label: "Đạt yêu cầu", value: "QUALIFIED" },
        { label: "Không đạt yêu cầu", value: "UNQUALIFIED" },
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
    //no check request
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { CandidateEnt } = this.props;
    let values = Object.assign({}, this._candidateModel.fillable());

    if (CandidateEnt) {
      Object.assign(values, CandidateEnt);
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
    let { CandidateEnt } = this.props;
    let bundle = {};
    let all = [
      // @TODO
     // this._companyModel.getOptions({ is_active: 1 })
     //   .then(data => (bundle["companies"] = mapDataOptions4Select(data))),
     // this._positionModel.getOptions()
      //  .then(data => (bundle['position'] = mapDataOptions4Select(data)) ),
    ];
    if (CandidateEnt && CandidateEnt.candidate_id > 0) {
      all.push(
        this._candidateModel.getAttachMent(CandidateEnt.candidate_id)
          .then(data => (bundle["attachMentNameArr"] = mapDataOptions4Select(data)))
      );
    }
    await Promise.all(all).catch(err =>
      window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      )
    );
    //
    //Object.keys(bundle).forEach(key => {
    //  let data = bundle[key];
    //  let stateValue = this.state[key];
    //  if (data instanceof Array && stateValue instanceof Array) {
   //     data = [stateValue[0]].concat(data);
    //  }
    //  bundle[key] = data;
   // });

    return bundle;
  }

  handleChangeCompany(changeValue) {
    let { values, setValues } = this.formikProps;
    let { value: company_id } = changeValue;
    this._businessModel
      .getOptions({ parent_id: company_id || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr, company: changeValue });
        setValues(
          Object.assign(values, {
            company_id,
            department_id: ""
          })
        );
      });
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
    let { CandidateEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];
    // Build form data
    let content;
    let formData = Object.assign({}, values, {
      candidate_content: content,
    });
    let _candidateId =
      (CandidateEnt && CandidateEnt.candidate_id) ||
      formData[this._candidateModel];
    let apiCall = _candidateId
      ? this._candidateModel.edit(_candidateId, formData)
      : this._candidateModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close") {
          willRedirect = true;
          return window._$g.rdr("/candidate");
        }

        if (this._btnType === "save" && !_candidateId) {
          resetForm();
          this.setState({ company: null });
        }

        // Chain
        return data;
      })
      .catch(apiData => {
        // NG
        let { errors, statusText, message } = apiData;
        let msg = [`<b>${statusText || message}</b>`].concat(errors || []).join("<br/>");
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        setSubmitting(false);
        //
        if (!CandidateEnt && !willRedirect && !alerts.length) {
          this.handleFormikReset();
        }

        this.setState(() => ({ alerts }), () => { window.scrollTo(0, 0); });
      });
  }

  handleFormikReset() {
    this.setState(state => ({
      ready: true,
      alerts: []
    }));
  }

  render() {
    let { _id, ready, alerts, attachMentNameArr, statusArr } = this.state;
    let { CandidateEnt, noEdit } = this.props;
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
                <b>{CandidateEnt ? 'Thông tin' : 'Thêm mới'} ứng tuyển {CandidateEnt ? CandidateEnt.candidate_full_name : ''}</b>
              </CardHeader>
              <CardBody>
                {/* general alerts */}
                {alerts.map(({ color, msg }, idx) => {
                  return (
                    <Alert
                      key={`alert-${idx}`}
                      color={color}
                      isOpen={true}
                      toggle={() => this.setState({ alerts: [] })}
                    >
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
                        <Col xs={12}>
                          <Row>
                           <Col xs={12}>
                            <Row className="mb15">
                              <Col xs={12}>
                              <b className="underline">Thông tin tuyển dụng</b>
                              </Col>
                            </Row> 
                           </Col>
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                  <Label for="recruit_title" sm={3} className="text-right"> Tin tức tuyển dụng </Label>
                                    <Col sm={9}>
                                    <Field
                                      name="recruit_title"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={noEdit}
                                          disabled={true}
                                        />
                                      )}
                                    />
                                    </Col> 
                                </Row>
                              </FormGroup>
                            </Col>
                           
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                <Label for="business_name" sm={3} className="text-right"> Cơ sở tuyển dụng</Label>
                                  <Col sm={9}>
                                    <Field
                                      name="business_name"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={true}
                                        />
                                      )}
                                  />
                                  </Col> 
                                </Row>
                              </FormGroup>
                            </Col>
                            
                            <Col xs={12}>
                              <FormGroup row>
                                <Label for="position_name" sm={3} className="text-right"> Vị trí</Label>
                                  <Col sm={2}>
                                    <Field
                                      name="position_name"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={true}
                                        />
                                      )}
                                  />
                                  </Col> 
                              </FormGroup>
                            </Col>
                           
                            <Col xs={12}>
                              <Row className="mb15">
                                <Col xs={12}>
                                <b className="underline">Thông tin ứng tuyển</b>
                                </Col>
                              </Row> 
                            </Col>

                            <Col xs={12}>
                                <FormGroup row>
                                  <Label sm={3} for="create_date"  className="text-right"> Ngày ứng tuyển </Label>
                                  <Col sm={3}>
                                    <Field
                                      name="create_date"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="create_date"
                                            name="create_date"
                                            date={values.create_date ? moment(values.create_date, 'DD/MM/YYYY') : null}            
                                            onDateChange={date => { setFieldValue('create_date', date) }}                     
                                            disabled={true}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                              <Col xs={12}>
                              <FormGroup>
                                <Row>
                                <Label for="candidate_full_name" sm={3} className="text-right"> Họ tên ứng viên</Label>
                                  <Col sm={9}>
                                    <Field
                                      name="candidate_full_name"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={true}
                                        />
                                      )}
                                  />
                                  </Col> 
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                <Label sm={3} for="gender_name" className="text-right"> Giới tính</Label>
                                  <Col sm={9}>
                                    <Field
                                      name="gender_name"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={true}
                                        />
                                      )}
                                  />
                                  </Col> 
                                </Row>
                              </FormGroup>
                            </Col>
                            
                            <Col xs={12}>
                                <FormGroup row>
                                  <Label for="birthday" sm={3} className="text-right"> Ngày sinh </Label>
                                  <Col sm={3}>
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
                                            name="birthday"
                                            date={values.birthday ? moment(values.birthday, 'DD/MM/YYYY') : null}
                                            onDateChange={date => { setFieldValue('birthday', date) }} 
                                            disabled={true}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                  </Col>
                                </FormGroup>
                              </Col>
                            
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                <Label sm={3} for="phone_number" className="text-right"> Số điện thoại</Label>
                                  <Col sm={9}>
                                    <Field
                                      name="phone_number"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={true}
                                        />
                                      )}
                                  />
                                  </Col> 
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                <Label sm={3} for="email" className="text-right"> Email</Label>
                                  <Col sm={9}>
                                    <Field
                                      name="email"
                                      render={({ field }) => (
                                        <Input
                                          {...field}
                                          onBlur={null}
                                          type="text"
                                          placeholder=""
                                          disabled={true}
                                        />
                                      )}
                                  />
                                  </Col> 
                                </Row>
                              </FormGroup>
                            </Col>
                          
                            <Col xs={12}>
                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="introduction" sm={3} className="text-right">Giới thiệu bản thân</Label>
                                    <Col sm={8}>
                                      <Field
                                        name="introduction"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="textarea"
                                          id="introduction"
                                          disabled={true}
                                        />}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>

                            <Col xs={12} className="mt-2">
                              <Row>
                              <Col xs={12}>
                                <FormGroup row>  
                                <Label for="description" sm={3} className="text-right">CV, thư giới thiệu</Label>
                                    <Col sm={8}>
                                    <Table size="sm" bordered striped hover>
                                      <thead>
                                        <tr>
                                          <th style={{ width: '5%' }}>STT</th>
                                          <th style={{ minWidth: '150px' }}>Tên tập tin</th>
                                          
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {attachMentNameArr.map((bus, idx) => (
                                          <tr key={`attackmentN_${idx}`}>
                                            <td>{idx + 1}</td>
                                            <td><a type="_blank" href={bus.attachment_path}>{bus.attachment_name}</a></td> 
                                          </tr>
                                        ))
                                        }
                                      </tbody>
                                    </Table>
                                    </Col>
                                </FormGroup>
                              </Col>
                              </Row>
                            </Col>
                             
                            <Col xs={12}>
                              <Row className="mb15">
                                <Col xs={12}>
                                <b className="underline">Dành cho nhân viên tuyển dụng</b>
                                </Col>
                              </Row> 
                            </Col>

                            <Col xs={12}>
                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="status" sm={3} className="text-right">Trạng thái ứng viên</Label>
                                    <Col sm={3}>
                                    <Field
                                      name="status"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = statusArr.find(({ value }) => value === field.value ); 
                                        let placeholder = (statusArr[0] && statusArr[0].label) ||  "";
                                        console.log(defaultValue);
                                        return (
                                          <Select
                                            id={field.name}
                                            name={field.name}
                                            isSearchable={true}
                                            onChange={({ value }) => field.onChange({
                                              target: { type: "select", name: field.name, value }
                                            })}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options= {statusArr} 
                                            isDisabled={noEdit}
                                          />
                                        );
                                      }} ></Field>
                                    </Col>
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>

                            <Col xs={12}>
                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="hr_description" sm={3} className="text-right">Ghi chú ứng viên</Label>
                                    <Col sm={8}>
                                      <Field
                                        name="hr_description"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="textarea"
                                          id="hr_description"
                                          disabled={noEdit}
                                        />}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>

                             <Col xs={12}>
                             <Row>
                            <Col sm={12} className="text-right">
                              {
                                noEdit?(
                                  <CheckAccess permission="HR_CANĐIATE_EDIT">
                                    <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/users/edit/${CandidateEnt.candidate_id}`)}>
                                      <i className="fa fa-edit mr-1" />Chỉnh sửa
                                    </Button>
                                  </CheckAccess>
                                ):
                                [ 
                                  <Button 
                                    key="buttonSave" 
                                    type="submit" 
                                    color="primary" 
                                    disabled={isSubmitting}   onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                    <i className="fa fa-save mr-2" />Lưu
                                  </Button>,
                                  <Button 
                                  key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                    <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                  </Button>
                                ]
                              }
                              <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/candidate')} className="btn-block-sm mt-md-0 mt-sm-2">
                                <i className="fa fa-times-circle mr-1" />Đóng
                              </Button>
                            </Col>
                          </Row>
                             </Col>
                          </Row>
                        </Col>
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

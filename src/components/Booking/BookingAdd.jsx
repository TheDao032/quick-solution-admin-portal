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
import NumberFormat from '../Common/NumberFormat';
import Products from "./Products";
import { CheckAccess } from '../../navigation/VerifyAccess'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "react-image-lightbox/style.css"; 
import "../Products/styles.scss";

// Model(s)
import BookingModel from "../../models/BookingModel";
import CompanyModel from "../../models/CompanyModel";
import BusinessModel from "../../models/BusinessModel";
import PositionModel from '../../models/PositionModel';
import BookingStatusModel from  '../../models/BookingStatusModel';
// Util(s)
import { mapDataOptions4Select, MOMENT_FORMAT_DATE } from "../../utils/html";

/**
 * @class SegmentAdd
 */
export default class BookingAdd extends Component {
  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._bookingModel = new BookingModel();
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();
    this._positionModel = new PositionModel();
    this._bookingStatusModel = new BookingStatusModel();
    // Bind method(s)
    this.handleFormikSubmit = this.handleFormikSubmit.bind(this);
    this.handleFormikReset = this.handleFormikReset.bind(this);
    this.handleChangeCompany = this.handleChangeCompany.bind(this);
    this.handleFormikValidate = this.handleFormikValidate.bind(this);

    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
       /** @var {String} */
       status: 0,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      ready: false,  
        /** @var {Object}: data to post */
        customers: null,
       /** @var {Array}: data to select */
       customersRender:[],
       /** @var {Array} */
       bookingStatus:[
        { id: 0, name: "-- Chọn --", parent_id: null, label: "-- Chọn --", value: 0 },
      ], 
       /** @var {Array} */
       bookingStatusArr: [
        { id: 0, name: "-- Chọn --", parent_id: null, label: "-- Chọn --", value: 0 },
      ], 
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();

    this.props.ProductEnts && this.handleAdd(this.props.ProductEnts); //CustomerEnts
    //.end
  }

  formikValidationSchema = Yup.object().shape({
    //no check request
    list_booking_detail: Yup.string().required("Sản phẩm là bắt buộc"),
  });

  /** @var {String} */
  _btnType = null;

  getInitialValues() {
    let { BookingEnt, ProductEnts } = this.props;
    let values = Object.assign({}, this._bookingModel.fillable());

    if (BookingEnt) {
      Object.assign(values, BookingEnt);
    }
    if(ProductEnts) {
      Object.assign(values,ProductEnts, {"list_booking_detail": "1"});
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
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { BookingEnt } = this.props;
    let bundle = {};
    let all = [
      // @TODO
     // this._companyModel.getOptions({ is_active: 1 })
     //   .then(data => (bundle["companies"] = mapDataOptions4Select(data))),
      this._bookingStatusModel.getOptions()
        .then(data => (bundle['bookingStatusArr'] = mapDataOptions4Select(data)) ),
    ];
    if (BookingEnt && BookingEnt.booking_id > 0) {
      if(BookingEnt.booking_status_id == null || BookingEnt.booking_status_id){
        BookingEnt.booking_status_id = 1;
      }
      all.push(
       // this._bookingModel.getAttachMent(BookingEnt.booking_id)
        //  .then(data => (bundle["attachMentNameArr"] = mapDataOptions4Select(data)))
      );
    }
    await Promise.all(all).catch(err =>
      window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      )
    );
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

  handleChangeStatus = status => {
    console.log(status);
    this.setState({ status })
  }
 
  toggleCustomer = () => this.setState({toggleCustomer: !this.state.toggleCustomer})

  handleUpdateField= (item, idx) => {
    let { customersRender } = this.state;
    customersRender[idx][1].quantity = 1*item.target.value;
    this.setState({ customersRender: [...customersRender]});
  }

  handleSubmit(btnType) {
    let { submitForm } = this.formikProps;
    this._btnType = btnType;
    return submitForm();
  }
  handleChangeSubmit(btnType) {   
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
    let { BookingEnt } = this.props;
    let { setSubmitting, resetForm } = formProps;

    let willRedirect = false;
    let alerts = [];

     // get list_task_datalead
     let list_booking_detail = [];
    let total_money = 0; 
     for( var key in this.state.customers){
      let _total_money =(this.state.customers[key].price * this.state.customers[key].quantity);
      total_money += _total_money;
      list_booking_detail.push({
         product_id: this.state.customers[key].product_id,
         product_code: key,
         quantity: this.state.customers[key].quantity,
         price: this.state.customers[key].price,
         total_money: "'"+ _total_money + "'"
       }); 
     } 

    // Build form data
    let content;
    let _status = (this._btnType === "change") ? 2 : 1 * this.state.status.value;
    let formData = Object.assign({}, values, {
      booking_status_id:_status ,
      list_booking_detail,
      total_money:  "'"+ total_money + "'",     
    });
 
    let _bookingId =
      (BookingEnt && BookingEnt.booking_id) ||
      formData[this._bookingModel];
    let apiCall = _bookingId
      ? this._bookingModel.edit(_bookingId, formData)
      : this._bookingModel.create(formData);
    apiCall
      .then(data => {
        // OK
        window._$g.toastr.show("Lưu thành công!", "success");
        if (this._btnType === "save_n_close" ||this._btnType === "change") {
          willRedirect = true;
          return window._$g.rdr("/booking");
        }

        if (this._btnType === "save" && !_bookingId) {
          resetForm();
          this.setState({ 
            company: null,
            customers: {},
            customersRender:[], 
          });
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
        if (!BookingEnt && !willRedirect && !alerts.length) {
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

  handleAdd = (customers) => {
    this.setState({
      toggleCustomer: false,
      customersRender: Object.entries(customers),
      customers,
    });

    if(this.formikProps){
      let { values, setValues } = this.formikProps;
      // attributes
      setValues(Object.assign(values, { "list_booking_detail": customers }));
    }
  }


  handleRemoveCustomer = (item, event) => {
    let customers = Object.assign({},this.state.customers);
    delete customers[item[0]];
    this.setState({
      customersRender: Object.entries(customers),
      customers,
    })
    
    if(this.formikProps && Object.keys(customers).length === 0){
      let { values, setValues } = this.formikProps;
      // attributes
      setValues(Object.assign(values, { "list_booking_detail": "" }));
    }
  }


  render() {
    let { _id, ready, alerts, customersRender ,bookingStatusArr } = this.state;
    let { BookingEnt,ProductEnts, noEdit } = this.props; 
    let initialValues = this.getInitialValues(); 
    let _totalPrice = 0;
    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        <Row className="d-flex justify-content-center">
          <Col xs={12} md={12}>
            <Card hidden={this.state.toggleCustomer}>
              <CardHeader>
                <b>{BookingEnt ? (noEdit ? 'Chi tiết' : 'Chỉnh sửa') : 'Thêm mới'} Đơn đặt hàng {BookingEnt ? BookingEnt.booking_title : ''}</b>
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
                              <b className="underline">Đơn đặt hàng</b>
                              </Col>
                            </Row> 
                           </Col>
                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                    <Label for="booking_no" sm={3} className="text-right"> Số đơn đặt  hàng</Label>
                                    <Col sm={9}>
                                    <Field
                                      name="booking_no"
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
                                <Label sm={3} for="booking_date"  className="text-right">Ngày tạo đơn đặt hàng</Label>
                                  <Col sm={4}>
                                    <Field
                                      name="booking_date"
                                      render={({
                                        date,
                                        form: { setFieldValue, setFieldTouched, values },
                                        field,
                                        ...props
                                      }) => {
                                        return (
                                          <DatePicker
                                            id="booking_date" 
                                            date={values.create_date ? moment(values.booking_date, 'DD/MM/YYYY') : null}            
                                            onDateChange={date => { setFieldValue('booking_date', date) }} disabled={true}
                                            maxToday
                                          />
                                        )
                                      }}
                                    />
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>

                            <Col xs={12}>
                              <Row>
                                <Col xs={12}>
                                  <FormGroup row>
                                    <Label for="booking_status_id" sm={3} className="text-right">Trạng thái đơn đặt hàng</Label>
                                    <Col sm={4}>
                                    <Field
                                      name="booking_status_id"
                                      render={({ field /*, form*/ }) => {
                                        let defaultValue = bookingStatusArr.find(({ value }) => 1 * value === 1* field.value ); 
                                        let placeholder = (bookingStatusArr[0] && bookingStatusArr[0].label) ||  ""; 
                                        return (
                                          <Select
                                            name="booking_status_id"
                                            onChange={this.handleChangeStatus}
                                            isSearchable={true}
                                            placeholder={placeholder}
                                            defaultValue={defaultValue}
                                            options= { this.state.bookingStatusArr} 
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
                              <Row className="mb15">
                                <Col xs={12}>
                                <b className="underline">Thông tin khách hàng</b>
                                </Col>
                              </Row> 
                            </Col>

                            <Col xs={12}>
                              <FormGroup>
                                <Row>
                                    <Label for="full_name" sm={3} className="text-right">Họ tên</Label>
                                    <Col sm={9}>
                                    <Field
                                      name="full_name"
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
                                    <Label for="phone_number" sm={3} className="text-right">Số điện thoại</Label>
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
                                    <Label for="email" sm={3} className="text-right">Email</Label>
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
                              <FormGroup>
                                <Row>
                                    <Label for="address" sm={3} className="text-right">Địa chỉ</Label>
                                    <Col sm={9}>
                                    <Field
                                      name="address"
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
                                    <Label for="note" sm={3} className="text-right">Ghi chú</Label>
                                    <Col sm={9}>
                                      <Field
                                        name="note"
                                        render={({ field /* _form */ }) => <Input
                                          {...field}
                                          onBlur={null}
                                          type="textarea"
                                          id="note"
                                          disabled={true}
                                        />}
                                      />
                                    </Col>
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>
 
                            <Col xs={12}>
                              <Row className="mb15">                             
                                <Col xs={12} className="mb-2 d-flex justify-content-end">
                                <Button color="primary" onClick={() => { this.setState({toggleCustomer:true }) } }>
                                  Thêm sản phẩm
                                </Button>
                              </Col> 
                              </Row> 
                            </Col>
                            
                            <Col xs={12}>
                              <Row> 
                                <Col sm={12}>
                                    <FormGroup row hidden={values.is_auto_review} style={{overflowX:'scroll'}}>
                                      <Table size="sm" bordered striped >
                                        <thead>
                                          <tr>
                                            <th style={{ width: '1%' }}>STT</th>
                                            <th style={{ minWidth: '130px' }}>Mã sản phẩm</th>
                                            <th style={{ minWidth: '130px' }}>Tên sản phẩm</th>
                                            <th style={{ minWidth: '90px' }}>Số lượng</th>
                                            <th style={{ minWidth: '130px' }}>Đơn giá</th>
                                            <th style={{ minWidth: '130px' }}>Thành tiền</th> 
                                            <th style={{ width: '1%' }}>Xóa</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {customersRender.map((item, idx) => {
                                            let { 
                                              product_code,
                                              product_name,
                                              quantity,
                                              price,
                                              total_price_item
                                            } = item[1];
                                            //
                                            return item ? (_totalPrice += (price * quantity),
                                            [
                                              <tr key={`campaign_rlevel-0${idx}`}>
                                                <th scope="row" className="text-center align-middle">{idx + 1}</th>
                                                <td className="align-middle">
                                                  <Label>{ product_code }</Label>
                                                </td>
                                                <td className="align-middle">
                                                  <Label>{ product_name }</Label>
                                                </td>
                                                <td className="align-middle"> 
                                                  <Field
                                                    render={({ field }) => <NumberFormat
                                                      name={field.name}
                                                      value={quantity}
                                                      disabled={noEdit}
                                                      onBlur={(item) => this.handleUpdateField(item, idx)}
                                                      style={{ width: 'auto' }}
                                                    />}
                                                  />
                                                </td>
                                                <td className="align-middle">
                                                  <Label>{ price }</Label>
                                                </td>
                                                <td className="align-middle">
                                                  <Label>{ quantity * price }</Label>
                                                </td>
                                                
                                                <td className="text-center align-middle">
                                                  <Button color="danger" disabled={noEdit} size={"sm"} onClick={(event) => this.handleRemoveCustomer(item, event)}>
                                                    <i className="fa fa-minus-circle" />
                                                  </Button>
                                                </td>
                                              </tr>
                                            ]) : null;
                                          })}
                                        </tbody>
                                      </Table>
                                      <Col sm={12}>
                                        <ErrorMessage name="list_booking_detail" component={({ children }) => <Alert color="danger" className="field-validation-error">{children}</Alert>} />
                                      </Col>
                                    </FormGroup> 
                                </Col>
                                <Col sm={12}>
                                  <Row>
                                    <Col xs={12}>
                                      <FormGroup row>
                                        <Label for="note" sm={9} className="text-right">Tổng tiền</Label>
                                        <Col sm={3}>
                                          <Field
                                              render={({ field }) => <NumberFormat 
                                                value={_totalPrice}
                                                disabled={true} 
                                                style={{ width: '100%' }}
                                              />}
                                            />
                                        </Col>
                                      </FormGroup>
                                    </Col>
                                  </Row>                                        
                                </Col>
                              </Row>

                            </Col>
 
                            <Col xs={12}>
                             <Row>
                                  <Col sm={12} className="text-right">
                                    {
                                      noEdit?(
                                        <CheckAccess permission="SL_BOOKING_EDIT">
                                          <Button color="primary" className="mr-2 btn-block-sm" onClick={() => window._$g.rdr(`/booking/edit/${BookingEnt.booking_id}`)}>
                                            <i className="fa fa-edit mr-1" />Chỉnh sửa
                                          </Button>
                                        </CheckAccess>
                                      ):
                                      [ 
                                        <Button 
                                          key="buttonSave" 
                                          type="submit" 
                                          color="primary" 
                                          disabled={isSubmitting} onClick={() => this.handleSubmit('save')} className="mr-2 btn-block-sm">
                                          <i className="fa fa-save mr-2" />Lưu
                                        </Button>,
                                        <Button 
                                        key="buttonSaveClose" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleSubmit('save_n_close')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                          <i className="fa fa-save mr-2" />Lưu &amp; Đóng
                                        </Button>,                                        
                                        <Button 
                                        key="buttonChangeStatus" type="submit" color="success" disabled={isSubmitting} onClick={() => this.handleChangeSubmit('change')} className="mr-2 btn-block-sm mt-md-0 mt-sm-2">
                                          <i className="fa fa-save mr-2" />Huỷ đơn hàng
                                        </Button>
                                      ]
                                    }
                                    <Button disabled={isSubmitting} onClick={() => window._$g.rdr('/booking')} className="btn-block-sm mt-md-0 mt-sm-2">
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
            { 
              this.state.toggleCustomer ? 
              <div className="modal-view">
                <div onClick={this.toggleCustomer}></div>
                <Col xs={12} style={{height:'90%'}} >
                  <Products
                    handleAdd={this.handleAdd}
                    customersSelect={this.state.customers}
                    toggleCustomer={this.toggleCustomer}
                    bookingID={BookingEnt && BookingEnt.booking_id}
                  />
                </Col>
              </div>
            : null
            }
          </Col>
        </Row>
      </div>
    );
  }
}

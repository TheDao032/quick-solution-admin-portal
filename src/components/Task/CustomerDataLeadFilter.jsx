import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Input,
  Button,
  Form,
  FormGroup,
  Label,
  Col,
  Row,
 } from 'reactstrap'
 import Select from 'react-select'

// Component(s)
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address'
import DatePicker from '../Common/DatePicker'
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)
// Constant(s)
import { STATUS_CUSTOMER_DATA_LEAD } from '../../actions/constants/customer_data_lead';

class CustomerDataLeadFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedActive:null,
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      /** @var {Array} */
      isGenders: [
        { name: "-- Chọn --", id: null },
        { name: "Nam", id: 1 },
        { name: "Nữ", id: 0 },
      ],
      /** @var {Array} */
      isMarital:[
        { name: "Tất cả", id: null },
        { name: "Đã kết hôn", id: 1 },
        { name: "Độc thân", id: 0 },
      ],
      initProvince: true,
      statusDataLead: null,
      selectedCountry: {value:DEFAULT_COUNTRY_ID}
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeSelectActive = selectedActive => {
    this.setState({ selectedActive })
  }

  handleChangeSelectGender = selectedGender => {
    this.setState({ selectedGender })
  }

  handleChangeSegment = selectedSegment => {
    this.setState({ selectedSegment })
  }

  handleChangeStatusMarital = selectedStatusMarital => {
    this.setState({ selectedStatusMarital })
  }

  changeStatusDataLead = status => {
    if(status !== this.state.statusDataLead) {
      this.setState({ statusDataLead: status }, () => this.onSubmit());
    }
    // this.setState({ statusDataLead: status === this.state.statusDataLead ? null : status }, () => this.onSubmit());
  }

  handleChangeCountry = selectedCountry => {
    this.setState({
      initProvince: false,
      selectedCountry: null,
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedCountry, initProvince: true }) )
  }

  handleChangeProvince = selectedProvince => {
    this.setState({
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedProvince }) )
  }

  handleChangeDistrict = selectedDistrict => {
    this.setState({
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedDistrict }) )
  }

  handleChangeWard = selectedWard => {
    this.setState({
      selectedWard: null
    }, () => this.setState({ selectedWard }) )
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const {
      inputValue, startDate, endDate, selectedCountry, selectedProvince,
      selectedDistrict, selectedWard, selectedGender, selectedSegment, selectedStatusMarital, selectedActive, statusDataLead
    } = this.state;
    const { handleSubmit, clearData } = this.props;
    if (
      inputValue ||
      startDate ||
      endDate ||
      (selectedCountry && selectedCountry.value) ||
      (selectedProvince && selectedProvince.value) ||
      (selectedDistrict && selectedDistrict.value) ||
      (selectedWard && selectedWard.value) ||
      (selectedGender && selectedGender.value) ||
      (selectedSegment && selectedSegment.value) ||
      (selectedStatusMarital && selectedStatusMarital.value) ||
      (selectedActive && selectedActive.value)
    ) {
      handleSubmit(
        inputValue,
        startDate ? startDate.format('DD/MM/YYYY') : startDate,
        endDate ? endDate.format('DD/MM/YYYY') : endDate,
        selectedCountry ? selectedCountry.value : null,
        selectedProvince ? selectedProvince.value : null,
        selectedDistrict ? selectedDistrict.value : null,
        selectedWard ? selectedWard.value : null,
        selectedGender ? selectedGender.value : null,
        selectedSegment ? selectedSegment.value : null,
        selectedStatusMarital ? selectedStatusMarital.value : null,
        selectedActive ? selectedActive.value : 2,
        statusDataLead,
      )
    }else{
      clearData();
    }
  }

  render() {
    const { segment } = this.props;
    const { statusDataLead } = this.state;
    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Từ khóa
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputValue"
                  placeholder="Nhập tên KH, số điện thoại, email, số CMND"
                  defaultValue={this.state.inputValue}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{
                    name: 'inputValue',
                  }}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={9}>
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
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">Quốc gia</Label>
                              <CountryComponent
                                className="MuiPaper-filter__custom--select"
                                id="country_id"
                                name="country_id"
                                onChange={this.handleChangeCountry}
                                defaultValue={DEFAULT_COUNTRY_ID}
                              />
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">Tỉnh/ Thành phố</Label>
                              {this.state.initProvince
                                ? (
                                  <ProvinceComponent
                                    className="MuiPaper-filter__custom--select"
                                    id="province_id"
                                    name="province_id"
                                    onChange={this.handleChangeProvince}
                                    mainValue={(this.state.selectedCountry && this.state.selectedCountry.value) || DEFAULT_COUNTRY_ID}
                                    // mainValue={this.state.selectedCountry.value}
                                    defaultValue={this.state.selectedProvince}
                                  />
                                ) : (
                                  <Select
                                    className="MuiPaper-filter__custom--select"
                                    placeholder={"-- Tỉnh/Thành phố --"}
                                  />
                                )
                              }
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">Quận/ Huyện</Label>
                              {this.state.selectedProvince
                                ? (
                                  <DistrictComponent
                                    className="MuiPaper-filter__custom--select"
                                    id="district_id"
                                    name="district_id"
                                    onChange={this.handleChangeDistrict}
                                    mainValue={this.state.selectedProvince.value}
                                    defaultValue={this.state.selectedDistrict}
                                  />
                                ) : (
                                  <Select
                                    className="MuiPaper-filter__custom--select"
                                    placeholder={"-- Quận/Huyện --"}
                                  />
                                )
                              }
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">Phường/ Xã</Label>
                              {this.state.selectedDistrict
                                ? (
                                  <WardComponent
                                    className="MuiPaper-filter__custom--select"
                                    id="ward_id"
                                    name="ward_id"
                                    onChange={this.handleChangeWard}
                                    mainValue={this.state.selectedDistrict.value}
                                    defaultValue={this.state.selectedWard}
                                  />
                                ) : (
                                  <Select
                                    className="MuiPaper-filter__custom--select"
                                    placeholder={"-- Phường/Xã --"}
                                  />
                                )
                              }
                            </Col>
                          </Row>
                        </Col>
                      </FormGroup>
                    </Col>
                  );
              }}</Address>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày tạo</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startDate}
                    startDateId="your_unique_start_date_id"
                    endDate={this.state.endDate}
                    endDateId="your_unique_end_date_id"
                    onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })}
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={9}>
              <Row>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">Giới tính</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isGenders"
                      name="isGenders"
                      onChange={this.handleChangeSelectGender}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedGender}
                      options={this.state.isGenders.map(({ name: label, id: value }) => ({ value, label }))}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">Phân khúc khách hàng</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="segment"
                      name="segment"
                      onChange={this.handleChangeSegment}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedSegment}
                      options={segment && segment.map(({ name: label, id: value }) => ({ value, label }))}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">Kích hoạt</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isActives"
                      name="isActives"
                      onChange={this.handleChangeSelectActive}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedActive}
                      options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="statusMarital" className="mr-sm-2">Tình trạng hôn nhân</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="statusMarital"
                      name="statusMarital"
                      onChange={this.handleChangeStatusMarital}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedStatusMarital}
                      options={this.state.isMarital.map(({ name: label, id: value }) => ({ value, label }))}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
        <div className="d-flex align-items-center mt-3">

          <div sm={6} className="table-tags float-left d-inline-flex">
            
            <h5 className="mb-0">
              <Button 
                className={"table-tag pt-1 pb-1 font-weight-bold col-12 " + STATUS_CUSTOMER_DATA_LEAD.ASSIGNED}
                onClick={() => this.changeStatusDataLead(STATUS_CUSTOMER_DATA_LEAD.ASSIGNED)}
              >
                {
                  statusDataLead === STATUS_CUSTOMER_DATA_LEAD.ASSIGNED &&
                  <div className="blackScreenOpacity"></div>
                }
                Đã phân công việc
              </Button>
            </h5>

            <h5 className="mb-0 ml-2">
              <Button 
                className={"table-tag pt-1 pb-1 font-weight-bold col-12 " + STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED}
                onClick={() => this.changeStatusDataLead(STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED)}
              >
                {
                  statusDataLead === STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED &&
                  <div className="blackScreenOpacity"></div>
                }
                Chưa phân công việc
              </Button>
            </h5>
            <h5 className="mb-0 ml-2">
              <Button 
                className={"table-tag pt-1 pb-1 font-weight-bold col-12 " + STATUS_CUSTOMER_DATA_LEAD.IN_PROCESS}
                onClick={() => this.changeStatusDataLead(STATUS_CUSTOMER_DATA_LEAD.IN_PROCESS)}
              >
                {
                  statusDataLead === STATUS_CUSTOMER_DATA_LEAD.IN_PROCESS &&
                  <div className="blackScreenOpacity"></div>
                }
                Đang xử lý
              </Button>
            </h5>
          </div>

          <div sm={6} className="d-flex flex-fill justify-content-end">
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <CheckAccess permission="CRM_CUSDATALEADS_VIEW">
                <Button className="col-12 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
                  <i className="fa fa-search" />
                  <span className="ml-1">Tìm kiếm</span>
                </Button>
              </CheckAccess>
            </FormGroup>
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <Button className="mr-1 col-12 MuiPaper-filter__custom--button" onClick={()=>this.props.handleAdd()} size="sm">
                <i className="fa fa-plus-circle" />
                <span className="ml-1">Thêm</span>
              </Button>
            </FormGroup>
          </div>
        </div>
      </div>
    )
  }
}

CustomerDataLeadFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default CustomerDataLeadFilter

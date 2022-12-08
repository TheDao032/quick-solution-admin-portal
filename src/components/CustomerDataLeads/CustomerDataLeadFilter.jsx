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
// Model(s)
import SegmentModel from '../../models/SegmentModel'
import StatusDataLeadModel from '../../models/StatusDataLeadModel'

class CustomerDataLeadFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedActive: {label: "Có", value: 1},
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      /** @var {Array} */
      isGenders: [
        { name: "Tất cả", id: 2 },
        { name: "Nam", id: 1 },
        { name: "Nữ", id: 0 },
        { name: "Khác", id: -1 },
      ],
      initProvince: true,
      /** @var {Array} */
      segment: [
        { name: "-- Chọn --", id: "" },
      ],
      /** @var {Array} */
      statusDataLead: [
        { name: "-- Chọn --", id: "" },
      ],
    }

    // Init model(s)
    this._segmentModel = new SegmentModel()
    this._statusDataLeadModel = new StatusDataLeadModel()
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

  handleChangeSelectCompany = selectedCompany => {
    this.setState({ selectedCompany })
  }

  handleChangeSelectBusiness = selectedBusiness => {
    this.setState({ selectedBusiness }, () => {
      this._segmentModel.getOptions({ parent_id: selectedBusiness.value, is_active: 1 })
        .then(data => this.setState({ segment: data }))
      this._statusDataLeadModel.getOptions({ parent_id: selectedBusiness.value, is_active: 1, is_won: 2, is_lost: 2 })
        .then(data => this.setState({ statusDataLead: data }))
    })
  }

  handleChangeSegment = selectedSegment => {
    this.setState({ selectedSegment })
  }

  handleChangeStatusDataLead = selectedStatusDataLead => {
    this.setState({ selectedStatusDataLead })
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

  onSubmit(isReset = false) {
    const {
      inputValue, startDate, endDate, selectedCountry, selectedProvince,
      selectedDistrict, selectedWard, selectedGender, selectedBusiness, selectedSegment, selectedStatusDataLead, selectedActive, selectedCompany
    } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      isReset,
      inputValue,
      startDate ? startDate.format('DD/MM/YYYY') : startDate,
      endDate ? endDate.format('DD/MM/YYYY') : endDate,
      selectedCountry ? selectedCountry.value : null,
      selectedProvince ? selectedProvince.value : null,
      selectedDistrict ? selectedDistrict.value : null,
      selectedWard ? selectedWard.value : null,
      selectedGender ? selectedGender.value : null,
      selectedBusiness ? selectedBusiness.value : null,
      selectedSegment ? selectedSegment.value : null,
      selectedStatusDataLead ? selectedStatusDataLead.value : null,
      selectedActive ? selectedActive.value : 2,
      selectedCompany ? selectedCompany.value : null,
    )
  }

  onClear = () => {
    const {
      inputValue, startDate, endDate, selectedCountry, selectedProvince,
      selectedDistrict, selectedWard, selectedGender, selectedBusiness, selectedSegment, selectedStatusDataLead, selectedActive, selectedCompany
    } = this.state
    if (
      inputValue || startDate || endDate || selectedCountry || selectedProvince ||
      selectedDistrict || selectedWard || selectedGender || selectedBusiness || selectedSegment || selectedStatusDataLead || selectedActive || selectedCompany
    ) {
      this.setState({
        inputValue: '',
        startDate: null,
        endDate: null,
        selectedCountry: 0,
        selectedProvince: null,
        selectedDistrict: null,
        selectedWard: null,
        selectedGender: null,
        selectedBusiness: { label: "-- Chọn --", value: "" },
        selectedSegment: { label: "-- Chọn --", value: "" },
        selectedStatusDataLead: { label: "-- Chọn --", value: "" },
        selectedCompany: { label: "-- Chọn --", value: "" },
        segment: [
          { name: "-- Chọn --", id: "" },
        ],
        statusDataLead: [
          { name: "-- Chọn --", id: "" },
        ],
        selectedActive: {label: "Có", value: 1},
      }, () => {
        this.onSubmit(true)
      })
    }
  }

  render() {
    const { segment, statusDataLead } = this.state
    const { businessArr, companies } = this.props
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
                  placeholder="Nhập tên KH, SĐT, email, số CMND"
                  value={this.state.inputValue}
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
                    <Label for="" className="mr-sm-2">Công ty</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isGenders"
                      name="isGenders"
                      onChange={this.handleChangeSelectCompany}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedCompany}
                      options={companies && companies.map(({ name: label, id: value }) => ({ value, label }))}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">Cơ sở phòng tập</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isGenders"
                      name="isGenders"
                      onChange={this.handleChangeSelectBusiness}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedBusiness}
                      options={businessArr && businessArr.map(({ name: label, id: value }) => ({ value, label }))}
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
                    <Label for="" className="mr-sm-2">Trạng thái khách hàng</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="statusDataLead"
                      name="statusDataLead"
                      onChange={this.handleChangeStatusDataLead}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedStatusDataLead}
                      options={statusDataLead && statusDataLead.map(({ name: label, id: value }) => ({ value, label }))}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            <Col xs={12} sm={3} className="mt-3">
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
            <Col xs={12} sm={9}>
              <Row>
                <Col xs={12} sm={3} className="mt-3">
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
              </Row>
            </Col>
          </Row>
        </Form>
        <div className="d-flex align-items-center mt-3">
          <div className="d-flex flex-fill justify-content-end">
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <Button className="col-12 MuiPaper-filter__custom--button" onClick={() => this.onSubmit()} color="primary" size="sm">
                <i className="fa fa-search" />
                <span className="ml-1">Tìm kiếm</span>
              </Button>
            </FormGroup>
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <Button className="mr-1 col-12 MuiPaper-filter__custom--button" onClick={this.onClear} size="sm">
                <i className="fa fa-refresh" />
                <span className="ml-1">Làm mới</span>
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

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
import Address from '../Common/Address'
import DatePicker from '../Common/DatePicker'
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)

class TaskCustomerDataLeadDetailFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      /** @var {Array} */
      isGenders: [
        { name: "Nam", id: 1 },
        { name: "Nữ", id: 0 },
      ],
      statusArr: [
        {id:3, name: "Đang xử lý"},
        {id:1, name: "Chốt đơn hàng thành công"},
        {id:2, name: "Không chốt được đơn hàng"},
        {id:0, name:"Tất cả"},
      ],
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeCountry = selectedCountry => {
    this.setState({
      selectedCountry: null,
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedCountry }) )
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

  setStatus = id => {
    let status = this.state.status !== id ? id : null;
    this.setState({status}, () => this.onSubmit({alwaySubmit: true}));
  }

  onClear = () => {
    const { inputValue, startDate, endDate, selectedCountry, selectedProvince,
      selectedDistrict, selectedWard, status } = this.state;
    if (
      inputValue ||
      startDate ||
      endDate ||
      (selectedCountry && selectedCountry.value) ||
      (selectedProvince && selectedProvince.value) ||
      (selectedDistrict && selectedDistrict.value) ||
      (selectedWard && selectedWard.value) || 
      status !== null
    ) {
      
      this.setState({
        inputValue: '',
        startDate:null,
        endDate:null,
        selectedCountry:null,
        selectedProvince:null,
        selectedDistrict:null,
        selectedWard:null,
        status: null,
      }, () => {
        this.props.handleSubmit()
      })
    }
  }

  onSubmit = (data,alwaySubmit) => {
    const {
      inputValue, startDate, endDate, selectedCountry, selectedProvince,
      selectedDistrict, selectedWard, status
    } = this.state;
    console.log("Dsads", alwaySubmit, status);
    const { handleSubmit } = this.props;
    if (
      inputValue ||
      startDate ||
      endDate ||
      (selectedCountry && selectedCountry.value) ||
      (selectedProvince && selectedProvince.value) ||
      (selectedDistrict && selectedDistrict.value) ||
      (selectedWard && selectedWard.value) || 
      (alwaySubmit || status != null)
    ) {
      handleSubmit(
        inputValue,
        startDate ? startDate.format('DD/MM/YYYY') : startDate,
        endDate ? endDate.format('DD/MM/YYYY') : endDate,
        selectedCountry ? selectedCountry.value : null,
        selectedProvince ? selectedProvince.value : null,
        selectedDistrict ? selectedDistrict.value : null,
        selectedWard ? selectedWard.value : null,
        status
      )
    }
  }

  render() {
    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
            <Col xs={12} sm={9}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Từ khóa
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputValue"
                  placeholder="Nhập tên KH, số điện thoại, email"
                  value={this.state.inputValue}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{
                    name: 'inputValue',
                  }}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label className="mr-sm-2">Ngày sinh</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startDate}
                    startDateId="birth_day_from"
                    endDate={this.state.endDate}
                    endDateId="birth_day_from"
                    onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })}
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
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
                                defaultValue={this.state.selectedCountry}
                                // defaultValue={0}
                              />
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">Tỉnh/ Thành phố</Label>
                              {this.state.selectedCountry
                                ? (
                                  <ProvinceComponent
                                    className="MuiPaper-filter__custom--select"
                                    id="province_id"
                                    name="province_id"
                                    onChange={this.handleChangeProvince}
                                    mainValue={this.state.selectedCountry.value}
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
          </Row>
        </Form>
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div
            className="d-flex flex-fill justify-content-start"
            style={{
              width: '70%',
              flexWrap: 'wrap',
            }}
          >
            {
              this.state.statusArr.map((value, index) => {
                return (
                  <FormGroup className="mb-2 mr-2" key={index}>
                    <Button
                      onClick={()=> this.setStatus(value.id)}
                      className={"MUIRow_bgColor-"+value.id + "   MuiPaper-filter__custom--button col-12"} 
                      size="sm"
                    >
                      <span className="ml-1">{value.name}</span>
                      {
                        this.state.status === value.id && 
                        <span className="blackScreenOpacity"/>   
                      }
                    </Button>
                  </FormGroup>
                );
              })
            }
          </div>
          <div className="d-flex flex-fill justify-content-end">
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <CheckAccess permission="CRM_CUSDATALEADS_VIEW">
                <Button className="col-12 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
                  <i className="fa fa-search" />
                  <span className="ml-1">Tìm kiếm</span>
                </Button>
              </CheckAccess>
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

TaskCustomerDataLeadDetailFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default TaskCustomerDataLeadDetailFilter

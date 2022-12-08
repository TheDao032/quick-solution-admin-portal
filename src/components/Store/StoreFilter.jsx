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
 import Select from 'react-select';

// Component(s)
import DatePicker from '../Common/DatePicker';
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address';
// Model(s)

class StoreFilter extends PureComponent {
  constructor(props) {
    super(props)


    this.state = {
      inputValue: "",
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ]
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeSelect = selectedOption => {
    this.setState({ selectedOption })
  }

  handleChangeProvince = province => {
    this.setState({ province, district: undefined, ward: undefined })
  }

  handleChangeDistrict = district => {
    this.setState({ district, ward: undefined })
  }

  handleChangeWard = ward => {
    this.setState({ ward })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedOption, from_date, to_date, province, district, ward,} = this.state
    const { handleSubmit } = this.props
    
    handleSubmit(
      inputValue,
      selectedOption ? selectedOption.value : 2,
      from_date ? from_date.format('DD/MM/YYYY') : from_date,
      to_date ? to_date.format('DD/MM/YYYY') : to_date,
      province ? province.value : undefined,
      district ? district.value : undefined,
      ward ? ward.value : undefined,
    )
  }

  onClear = () => {
    const { inputValue, selectedOption, from_date, to_date, province, district, ward} = this.state
    if (inputValue || selectedOption || from_date || to_date || province || district || ward) {
      this.setState({
        inputValue: '',
        selectedOption: 2,
        from_date:null,
        to_date:null,
        province: null,
        district: null,
        ward: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { province, district, ward } = this.state
    return (
      <Address className="ml-3 mr-3 mb-3 mt-3">
      {(addrProps) => {
        let {
          // CountryComponent,
          ProvinceComponent,
          DistrictComponent,
          WardComponent
        } = addrProps;
        return (
          <Form autoComplete="nope" className="zoom-scale-9">
            <Row>
              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="inputValue" className="mr-sm-2">
                    Từ khóa
                  </Label>
                  <Input
                    className="MuiPaper-filter__custom--input"
                    autoComplete="nope"
                    type="text"
                    name="inputValue"
                    placeholder="-- Tìm --"
                    value={this.state.inputValue}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    inputprops={{
                      name: 'inputValue',
                    }}
                  />
                </FormGroup>
              </Col>

              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2 font-weight-bold">Tỉnh thành</Label>
                  <ProvinceComponent
                    key={`province_of_${DEFAULT_COUNTRY_ID}_${!!province}`}
                    name="province"
                    className="MuiPaper-filter__custom--select"
                    onChange={this.handleChangeProvince}
                    mainValue={DEFAULT_COUNTRY_ID}
                    defaultValue={province}
                  />
                </FormGroup>
              </Col>

              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2 font-weight-bold">Quận/Huyện</Label>
                  <DistrictComponent
                    key={`district_of_${(province && province.value) || ''}`}
                    name="district"
                    className="MuiPaper-filter__custom--select"
                    onChange={this.handleChangeDistrict}
                    mainValue={(province && province.value)}
                    defaultValue={district}
                  />
                </FormGroup>
              </Col>

            </Row>

            <Row className="mt-3">

              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Thời gian tạo</Label>
                  <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.from_date} 
                    startDateId="your_unique_start_date_id"
                    endDate={this.state.to_date}
                    endDateId="your_unique_end_date_id"
                    onDatesChange={({ startDate, endDate }) => this.setState({ from_date:startDate, to_date: endDate })}
                    isMultiple
                  />
                  </Col>
                </FormGroup>
              </Col>

              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2 font-weight-bold">Phường/Xã</Label>
                  <WardComponent
                    key={`ward_of_${(district && district.value) || ''}`}
                    name="ward"
                    className="MuiPaper-filter__custom--select"
                    onChange={this.handleChangeWard}
                    mainValue={(district && district.value)}
                    defaultValue={ward}
                  />
                </FormGroup>
              </Col>

              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Kích hoạt</Label>
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="isActives"
                    name="isActives"
                    onChange={this.handleChangeSelect}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.selectedOption}
                    options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </FormGroup>
              </Col>
            </Row>
            <div className="d-flex align-items-center mt-3">
              <div className="d-flex flex-fill justify-content-end">
                <FormGroup className="mb-2 ml-2 mb-sm-0">
                  <Button className="col-12 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
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
          </Form>
        );
      }}</Address>
     )
  }
}

StoreFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default StoreFilter


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
// Model(s)

class CompaniesFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      country: null,
      province: null,
      district: null,
      ward: null,
      is_active: {label: "Có", value: 1},
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeCountries = country => {
    const province = null;
    const district = null;
    const ward = null;
    this.setState({ country, province, district, ward })
    this.props.handleChangeCountries(country.value || null)
  }

  handleChangeProvinces = province => {
    const district = null;
    const ward = null;
    this.setState({ province,district,ward })
    this.props.handleChangeProvinces(province.value || null)
  }

  handleChangeDistricts = district => {
    this.setState({ district })
    this.props.handleChangeDistricts(district.value || null)
  }
  handleChangeWards = ward => {
    this.setState({ ward })
  }
  handleChangeIsActive = is_active => {
    this.setState({ is_active })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, country, province, district, ward, is_active } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      country ? country.value : undefined,
      province ? province.value : undefined,
      district ? district.value : undefined,
      ward ? ward.value : undefined,
      is_active ? is_active.value : undefined
    )
  }

  onClear = () => {
    if (this.state.inputValue || this.state.country || this.state.province || this.state.district || this.state.is_active || this.state.ward) {
      this.setState({
        inputValue: '',
        country: null,
        province: null,
        district: null,
        ward: null,
        is_active: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { countries, provinces, districts, wards } = this.props
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
                  placeholder="Nhập tên công ty, số điện thoại, email"
                  value={this.state.inputValue||''}
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
                <Label for="" className="mr-sm-2">Quốc gia</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="country"
                  name="country_id"
                  onChange={this.handleChangeCountries}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.country}
                  options={countries.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Tỉnh thành</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="province"
                  name="province_id"
                  onChange={this.handleChangeProvinces}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.province}
                  options={provinces.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="district" className="mr-sm-2">Quận huyện</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="district"
                  name="district_id"
                  onChange={this.handleChangeDistricts}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.district}
                  options={districts.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="ward" className="mr-sm-2">Phường/xã</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="ward"
                  name="ward_id"
                  onChange={this.handleChangeWards}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.ward}
                  options={wards.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Kích hoạt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="is_active"
                  name="is_active"
                  onChange={this.handleChangeIsActive}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.is_active}
                  options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
          </Row>
        </Form>
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
      </div>
    )
  }
}

CompaniesFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default CompaniesFilter

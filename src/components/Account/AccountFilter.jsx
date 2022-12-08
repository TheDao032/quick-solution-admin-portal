import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Input, Button, Form, FormGroup, Label, Col, Row } from "reactstrap";
import Select from "react-select";

// Component(s)
import Address, { DEFAULT_COUNTRY_ID } from "../Common/Address";
import DatePicker from "../Common/DatePicker";
// Model(s)
import SegmentModel from "../../models/SegmentModel";
import AccountModel from "../../models/AccountModel";

class AccountFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      selectedActive: { label: "Có", value: 1 },
      selectedTypeRegister: { label: "Tất cả", value: null },
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 }
      ],
      /** @var {Array} */
      isGenders: [
        { name: "Tất cả", id: 2 },
        { name: "Nam", id: 1 },
        { name: "Nữ", id: 0 },
        { name: "Khác", id: -1 }
      ],
      initProvince: true,
      /** @var {Array} */
      segment: [{ name: "-- Chọn --", id: "" }],
      /** @var {Array} */
      typeRegister: [
        { name: "Tất cả", id: null },
        { name: "Trực tiếp", id: 1 },
        { name: "Website", id: 2 },
        { name: "Ứng dụng mobile", id: 3 }
      ],
      initCountry: true,
    };

    // Init model(s)
    this._segmentModel = new SegmentModel();
    this._accountModel = new AccountModel();
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeSelectActive = selectedActive => {
    this.setState({ selectedActive });
  };

  handleChangeSelectGender = selectedGender => {
    this.setState({ selectedGender });
  };

  handleChangeSelectTypeRegister = selectedTypeRegister => {
    this.setState({ selectedTypeRegister });
  };

  handleChangeSelectBusiness = selectedBusiness => {
    this.setState({ selectedBusiness }, () => {
      this._segmentModel
        .getOptions({ parent_id: selectedBusiness.value, is_active: 1 })
        .then(data => this.setState({ segment: data }));
      this._statusDataLeadModel
        .getOptions({
          parent_id: selectedBusiness.value,
          is_active: 1,
          is_won: 2,
          is_lost: 2
        })
        .then(data => this.setState({ statusDataLead: data }));
    });
  };

  handleChangeSegment = selectedSegment => {
    this.setState({ selectedSegment });
  };

  handleChangeStatusDataLead = selectedStatusDataLead => {
    this.setState({ selectedStatusDataLead });
  };

  handleChangeCountry = selectedCountry => {
    this.setState(
      {
        initProvince: false,
        selectedCountry: null,
        selectedProvince: null,
        selectedDistrict: null,
        selectedWard: null
      },
      () => this.setState({ selectedCountry, initProvince: true })
    );
  };

  handleChangeProvince = selectedProvince => {
    this.setState(
      {
        selectedProvince: null,
        selectedDistrict: null,
        selectedWard: null
      },
      () => this.setState({ selectedProvince })
    );
  };

  handleChangeDistrict = selectedDistrict => {
    this.setState(
      {
        selectedDistrict: null,
        selectedWard: null
      },
      () => this.setState({ selectedDistrict })
    );
  };

  handleChangeWard = selectedWard => {
    this.setState(
      {
        selectedWard: null
      },
      () => this.setState({ selectedWard })
    );
  };

  handleKeyDown = event => {
    if (1 * event.keyCode === 13) {
      event.preventDefault();
      this.onSubmit();
    }
  };

  onSubmit(isReset = false) {
    const {
      inputValue,
      
      selectedCountry,
      selectedProvince,
      selectedDistrict,
      selectedWard,
      startDate,
      endDate,
      selectedGender,      
      selectedTypeRegister,
      selectedActive
    } = this.state;
    const { handleSubmit } = this.props;
    handleSubmit(
      isReset,
      inputValue,
      selectedCountry ? selectedCountry.value : null,
      selectedProvince ? selectedProvince.value : null,
      selectedDistrict ? selectedDistrict.value : null,
      selectedWard ? selectedWard.value : null,
      startDate ? startDate.format("DD/MM/YYYY") : startDate,
      endDate ? endDate.format("DD/MM/YYYY") : endDate,      
      selectedTypeRegister ? selectedTypeRegister.value : null,
      selectedGender ? selectedGender.value : null,
      selectedActive ? selectedActive.value : ""      
    );
  }

  onClear = () => {
    const {
      inputValue,
      selectedCountry,
      selectedProvince,
      selectedDistrict,
      selectedWard,
      startDate,
      endDate,
      selectedGender,
      selectedTypeRegister,
      selectedActive      
    } = this.state;
    if (
      inputValue||
      selectedCountry||
      selectedProvince||
      selectedDistrict||
      selectedWard||
      startDate||
      endDate||
      selectedGender||
      selectedTypeRegister||
      selectedActive
    ) {
      this.setState(
        {
          inputValue: "",
          selectedCountry: null,
          selectedProvince: null,
          selectedDistrict: null,
          selectedWard: null,
          startDate: null,
          endDate: null,
          selectedGender: null,
          selectedTypeRegister: { label: "Tất cả", value: null},
          selectedActive: { label: "Có", value: 1 },
          initProvince: false,
          initCountry: false,
        },
        () => {
          this.setState({ initCountry: true })
          this.onSubmit(true);
        }
      );
    }
  };

  render() {
    const { segment,typeRegister } = this.state;
    const { businessArr } = this.props;
    return (
      <div className="ml-3 mr-3 mb-3 mt-3">
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
                  placeholder="Nhập tên người dùng, số điện thoại, email, số CMND"
                  value={this.state.inputValue}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{
                    name: "inputValue"
                  }}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={9}>
              <Address className="row">
                {addrProps => {
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
                              <Label for="" className="mr-sm-2">
                                Quốc gia
                              </Label>
                              {this.state.initCountry ? (
                                <CountryComponent
                                  className="MuiPaper-filter__custom--select"
                                  id="country_id"
                                  name="country_id"
                                  onChange={this.handleChangeCountry}
                                  defaultValue={DEFAULT_COUNTRY_ID}
                                />
                              ) : (
                                <Select
                                  className="MuiPaper-filter__custom--select"
                                  placeholder={"-- Quốc gia --"}
                                />
                              )}
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">
                                Tỉnh/ Thành phố
                              </Label>
                              {this.state.initProvince ? (
                                <ProvinceComponent
                                  className="MuiPaper-filter__custom--select"
                                  id="province_id"
                                  name="province_id"
                                  onChange={this.handleChangeProvince}
                                  mainValue={
                                    (this.state.selectedCountry &&
                                      this.state.selectedCountry.value) ||
                                    DEFAULT_COUNTRY_ID
                                  }
                                  defaultValue={this.state.selectedProvince}
                                />
                              ) : (
                                <Select
                                  className="MuiPaper-filter__custom--select"
                                  placeholder={"-- Tỉnh/Thành phố --"}
                                />
                              )}
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">
                                Quận/ Huyện
                              </Label>
                              {this.state.selectedProvince ? (
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
                              )}
                            </Col>
                            <Col xs={12} sm={3} className="mb-1">
                              <Label for="" className="mr-sm-2">
                                Phường/ Xã
                              </Label>
                              {this.state.selectedDistrict ? (
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
                              )}
                            </Col>
                          </Row>
                        </Col>
                      </FormGroup>
                    </Col>
                  );
                }}
              </Address>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">
                  Ngày sinh
                </Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startDate}
                    startDateId="your_unique_start_date_id"
                    endDate={this.state.endDate}
                    endDateId="your_unique_end_date_id"
                    onDatesChange={({ startDate, endDate }) =>
                      this.setState({ startDate, endDate })
                    }
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={9}>
              <Row>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">
                      Giới tính
                    </Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isGenders"
                      name="isGenders"
                      onChange={this.handleChangeSelectGender}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedGender}
                      options={this.state.isGenders.map(
                        ({ name: label, id: value }) => ({ value, label })
                      )}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">
                      Hình thức đăng ký
                    </Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="typeRegister"
                      name="typeRegister"
                      onChange={this.handleChangeSelectTypeRegister}//handleChangeSelectCompany
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedTypeRegister}//selectedCompany
                      options={
                        this.state.typeRegister.map(({ name: label, id: value }) => ({ value, label }))
                      }
                    />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">
                      Kích hoạt
                    </Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isActives"
                      name="isActives"
                      onChange={this.handleChangeSelectActive}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.selectedActive}
                      options={this.state.isActives.map(
                        ({ name: label, id: value }) => ({ value, label })
                      )}
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
              <Button
                className="col-12 MuiPaper-filter__custom--button"
                onClick={() => this.onSubmit()}
                color="primary"
                size="sm"
              >
                <i className="fa fa-search" />
                <span className="ml-1">Tìm kiếm</span>
              </Button>
            </FormGroup>
            <FormGroup className="mb-2 ml-2 mb-sm-0">
              <Button
                className="mr-1 col-12 MuiPaper-filter__custom--button"
                onClick={this.onClear}
                size="sm"
              >
                <i className="fa fa-refresh" />
                <span className="ml-1">Làm mới</span>
              </Button>
            </FormGroup>
          </div>
        </div>
      </div>
    );
  }
}

AccountFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export default AccountFilter;

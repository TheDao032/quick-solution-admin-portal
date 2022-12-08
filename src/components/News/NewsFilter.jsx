import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Input, Button, Form, FormGroup, Label, Col, Row } from "reactstrap";
import Select from "react-select";

// Component(s)
import DatePicker from "../Common/DatePicker";
// Model(s)
import SegmentModel from "../../models/SegmentModel";
import NewsModel from "../../models/NewsModel";

//import BusinessModel from '../../models/ ';
class NewsFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      selectedActive: { label: "Có", value: 1 },
      selectedTypeStatus: { label: "Tất cả", value: null },
      newsCategory: { label: "Tất cả", value: null },
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
      ]
    };

    // Init model(s)
    this._segmentModel = new SegmentModel();
    this._newsModel = new NewsModel(); 
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

  handleChangeSelectTypeStatus = selectedTypeStatus => {
    this.setState({ selectedTypeStatus });
  };

  handleChangeSelectCategory = selectedCategory => {
    this.setState({ newsCategory : selectedCategory });
  };


  handleChangeSegment = selectedSegment => {
    this.setState({ selectedSegment });
  };

  handleChangeStatusDataLead = selectedStatusDataLead => {
    this.setState({ selectedStatusDataLead });
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
      selectedTypeStatus,
      newsCategory,
      selectedActive,
      startDate,
      endDate, 
      startDateCreateDate,
      endDateCreateDate,
    } = this.state;
    const { handleSubmit } = this.props;
    handleSubmit(
      isReset,
      inputValue,      
      selectedActive ? selectedActive.value : 2,
      selectedTypeStatus ? selectedTypeStatus.value : null, //status
      newsCategory? newsCategory.value: null,
      startDate ? startDate.format("DD/MM/YYYY") : startDate,
      endDate ? endDate.format("DD/MM/YYYY") : endDate, 
      startDateCreateDate ? startDateCreateDate.format("DD/MM/YYYY") : startDateCreateDate,
      endDateCreateDate ? endDateCreateDate.format("DD/MM/YYYY") : endDateCreateDate,      
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
      selectedTypeStatus,
      selectedActive,
      newsCategory,
      startDateCreateDate,
      endDateCreateDate 
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
      selectedTypeStatus||
      selectedActive ||
      newsCategory||
      startDateCreateDate||
      endDateCreateDate 
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
          selectedTypeStatus: { label: "Tất cả", value: null},
          selectedActive: { label: "Có", value: 1 },
          newsCategory: { label: "Tất cả", value: null },
          startDateCreateDate:null,
          endDateCreateDate:null
        },
        () => {
          this.onSubmit(true);
        }
      );
    }
  };

  render() {
    const { segment,typeRegister } = this.state;
    const { newsCategoryArr,newsStatusArr } = this.props;
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
                  placeholder="Nhập từ khoá tiêu đề"
                  value={this.state.inputValue}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{
                    name: "inputValue"
                  }}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">
                  Chuyên mục
                </Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="newsCategory"
                  name="newsCategory"
                  onChange={this.handleChangeSelectCategory}//handleChangeSelectCompany
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.newsCategory}//selectedCompany
                  options={
                    newsCategoryArr.map(({ name: label, id: value }) => ({ value, label }))
                  }
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">
                    Trạng thái
                  </Label>
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="typeRegister"
                    name="typeRegister"
                    onChange={this.handleChangeSelectTypeStatus}//handleChangeSelectCompany
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.selectedTypeStatus}//selectedCompany
                    options={
                      newsStatusArr.map(({ name: label, id: value }) => ({ value, label }))
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

                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">
                      Ngày đăng
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

                <Col xs={12} sm={3}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">
                    Ngày tạo 
                    </Label>
                    <Col className="pl-0 pr-0">
                      <DatePicker
                        startDate={this.state.startDateCreateDate}
                        startDateId="your_unique_start_date_id"
                        endDate={this.state.endDateCreateDate}
                        endDateId="your_unique_end_date_id"
                        onDatesChange={({ startDate, endDate }) =>
                          this.setState({ startDateCreateDate : startDate, endDateCreateDate : endDate })
                        }
                        isMultiple
                      />
                    </Col>
                  </FormGroup>
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

NewsFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export default NewsFilter;

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
import { mapDataOptions4Select } from "../../utils/html";
// Model(s)
import BusinessModel from '../../models/BusinessModel';

class RecruitFilter extends PureComponent {
  constructor(props) {
    super(props)
    this._businessModel = new BusinessModel();
    this.state = {
      inputValue: "",
      businessArr: [{ name: "-- Chọn --", id: "" }],
      selectedOption: {label: "Có", value: 1},
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      isDelete: [
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

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  handleChangeDelete = deleteOption => {
    this.setState({ deleteOption })
  }

  onSubmit = () => {
    console.log( this.state)
    const { inputValue, selectedOption, deleteOption, from_date, to_date, business, company } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedOption ? selectedOption.value : 2,
      deleteOption ? deleteOption.value : 2,
      from_date ? from_date.format('DD/MM/YYYY') : from_date,
      to_date ? to_date.format('DD/MM/YYYY') : to_date,
      company ? company.value : undefined,
      business ? business.value : undefined,
    )
  }

  onClear = () => {
    const { inputValue, selectedOption, deleteOption , from_date, to_date, business, company } = this.state
    if (inputValue || selectedOption || from_date || to_date || deleteOption || business || company) {
      this.setState({
        inputValue: '',
        selectedOption: 2,
        deleteOption: 2,
        from_date:null,
        to_date:null,
        business: null,
        company: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  handleChangeCompany = company => {
    this.setState({ company })

    let { value: company_id } = company;
    this._businessModel
    .getOptions({ parent_id: company_id || -1 })
    .then(data => {
      console.log(data)
      let { businessArr } = this.state; 
      businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
      this.setState({ businessArr, company: company });
    });
  }

  handleChangeBusiness = business => {
    this.setState({ business })
  }

  render() {
    const { companyArr/*, businessArr*/, positionArr } = this.props;
    console.log(positionArr);

    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
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
                  id="inputValue"
                  name="inputValue"
                  placeholder="Tìm kiếm theo tiêu đề tuyển dụng"
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
                <Label for="" className="mr-sm-2">Thời gian tuyển dụng</Label>
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

          <Row className="mt-3">
            
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Công ty áp dụng</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="company"
                  name="company"
                  onChange={this.handleChangeCompany}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.company}
                  options={companyArr.map(({ name: label, id: value }) => ({ value, label }))} />
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Cơ sở áp dụng</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="business"
                  name="business"
                  onChange={this.handleChangeBusiness}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.business}
                  options={this.state.businessArr.map(({ name: label, id: value }) => ({ value, label }))} />
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Vị trí tuyển dụng</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="company"
                  name="company"
                  onChange={this.handleChangeCompany}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.company}
                  options={positionArr.map(({ name: label, id: value }) => ({ value, label }))} />
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

RecruitFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default RecruitFilter


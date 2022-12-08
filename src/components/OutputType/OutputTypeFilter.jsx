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
import DatePicker from '../Common/DatePicker';
// Model(s)

class OutputTypeFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedOption: {label: "Có", value: 1},
      selectedVAT: {label: "Tất cả", value: 2},
      /** @var {Array} */
      isVAT: [
        { name: "Tất cả", id: 2 },
        { name: "Có VAT", id: 1 },
        { name: "Không có VAT", id: 0 },
      ],
      /** @var {Array} */
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

  handleChangeSelect = selectedOption => {
    this.setState({ selectedOption })
  }

  handleChangeVAT = selectedVAT => {
    this.setState({ selectedVAT })
  }

  handleChangeCompany = selectedCompany => {
    this.setState({ selectedCompany })
  }

  handleChangeArea = selectedArea => {
    this.setState({ selectedArea })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedOption, selectedVAT, selectedCompany, selectedArea, startDate, endDate } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedOption ? selectedOption.value : 2,
      selectedVAT ? selectedVAT.value : 2,
      startDate ? startDate.format('DD/MM/YYYY') : startDate,
      endDate ? endDate.format('DD/MM/YYYY') : endDate,
      selectedCompany ? selectedCompany.value : null,
      selectedArea ? selectedArea.value : null,
    )
  }

  onClear = () => {
    const { inputValue, selectedOption , selectedVAT, selectedCompany, selectedArea,  startDate, endDate } = this.state
    if (inputValue || selectedOption || selectedVAT || selectedCompany || selectedArea || startDate || endDate) {
      this.setState({
        inputValue: '',
        selectedOption: {label: "Có", value: 1},
        selectedVAT: {label: "Tất cả", value: 2},
        startDate: null,
        endDate: null,
        selectedCompany: { label: "-- Chọn --", value: "" },
        selectedArea: { label: "-- Chọn --", value: "" },
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { company, areas } = this.props
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
                  name="inputValue"
                  placeholder="Tên hình thức xuất"
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
                <Label for="" className="mr-sm-2">Ngày tạo</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                    startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                    endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                    endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                    onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Có VAT</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isVAT"
                  name="isVAT"
                  onChange={this.handleChangeVAT}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedVAT}
                  options={this.state.isVAT.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Công ty
                </Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="company_id"
                  name="company_id"
                  onChange={this.handleChangeCompany}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedCompany}
                  options={company && company.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Khu vực</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="area_id"
                  name="area_id"
                  onChange={this.handleChangeArea}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedArea}
                  options={areas && areas.map(({ name: label, id: value }) => ({ value, label }))}
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

OutputTypeFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default OutputTypeFilter

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

class CustomerTimeKeepingFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      /** @var {Array} */
      isCompleteTrainPT: [
        { name: "Tất cả", id: 2 },
        { name: "Hoàn thành", id: 1 },
        { name: "Chưa hoàn thành", id: 0 },
      ],
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeBusiness = selectedBusiness => {
    this.setState({ selectedBusiness });
  }

  handleChangePT = selectedTrainPT => {
    this.setState({ selectedTrainPT });
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedBusiness, startDate, endDate, selectedTrainPT } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedBusiness ? selectedBusiness.value : undefined,
      startDate ? startDate.format('DD/MM/YYYY') : startDate,
      endDate ? endDate.format('DD/MM/YYYY') : endDate,
      selectedTrainPT ? selectedTrainPT.value : 2,
    )
  }

  onClear = () => {
    const { inputValue, selectedBusiness, startDate, endDate, selectedTrainPT } = this.state
    if (inputValue || selectedBusiness || startDate || endDate || selectedTrainPT) {
      this.setState({
        inputValue: '',
        selectedBusiness: { label: "-- Chọn --", value: "" },
        startDate: null,
        endDate: null,
        selectedTrainPT: { name: "Tất cả", id: 2 },
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { isCompleteTrainPT } = this.state;
    const { business } = this.props;
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
                  placeholder="Nhập tên hội viên, mã hội viên"
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
                <Label for="" className="mr-sm-2">Cơ sở phòng tập</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="selectedBusiness"
                  name="selectedBusiness"
                  onChange={this.handleChangeBusiness}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedBusiness}
                  options={business.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày đến tập</Label>
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
          </Row>

          <Row className="mt-3">
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Hoàn thành tập với PT
                </Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="company_id"
                  name="company_id"
                  onChange={this.handleChangePT}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedPT}
                  options={isCompleteTrainPT.map(({ name: label, id: value }) => ({ value, label }))}
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

CustomerTimeKeepingFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default CustomerTimeKeepingFilter

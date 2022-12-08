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

class CampaignTypeFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedAutoReview: {label: "Có", value: 1},
      selectedActive: {label: "Có", value: 1},
      /** @var {Array} */
      isReview: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
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

  handleChangeAutoReview = selectedAutoReview => {
    this.setState({ selectedAutoReview })
  }

  handleChangeActive = selectedActive=> {
    this.setState({ selectedActive })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedAutoReview, selectedActive, startDate, endDate } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedAutoReview ? selectedAutoReview.value : 2,
      selectedActive ? selectedActive.value : 2,
      startDate ? startDate.format('DD/MM/YYYY') : startDate,
      endDate ? endDate.format('DD/MM/YYYY') : endDate,
    )
  }

  onClear = () => {
    const { inputValue, selectedAutoReview, selectedActive, startDate, endDate } = this.state
    if (inputValue || selectedAutoReview || selectedActive || startDate || endDate) {
      this.setState({
        inputValue: '',
        selectedAutoReview: {label: "Có", value: 1},
        selectedActive: {label: "Có", value: 1},
        startDate: null,
        endDate: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { isReview, isActives } = this.state;
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
                  placeholder="Nhập tên loại chiến dịch"
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
                <Label for="" className="mr-sm-2">Tự động duyệt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isReview"
                  name="isReview"
                  onChange={this.handleChangeAutoReview}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedAutoReview}
                  options={isReview.map(({ name: label, id: value }) => ({ value, label }))}
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
                  onChange={this.handleChangeActive}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedActive}
                  options={isActives.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày tạo</Label>
                  <DatePicker
                    startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                    startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                    endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                    endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                    onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
                    isMultiple
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

CampaignTypeFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default CampaignTypeFilter


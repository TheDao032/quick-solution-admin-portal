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

class CampaignFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedIsActive: { label: "Có", value: 1 },
      selectedIsReview: { label: "Tất cả", value: 3 },
      /** @var {Array} */
      isActives: [
        { label: "Tất cả", value: 2 },
        { label: "Có", value: 1 },
        { label: "Không", value: 0 },
      ],
      /** @var {Array} */
      isReviewed: [
        { label: "Tất cả", value: 3 },
        { label: "Đã duyệt", value: 1 },
        { label: "Không duyệt", value: 2 },
        { label: "Chưa duyệt", value: 0 },
      ]
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeActive = selectedIsActive => {
    this.setState({ selectedIsActive })
  }

  handleChangeReview = selectedIsReview => {
    this.setState({ selectedIsReview })
  }

  handleChangeCampaignStatus = selectedCampaignStatus => {
    this.setState({ selectedCampaignStatus })
  }

  handleChangeCampaignType = selectedCampaignType => {
    this.setState({ selectedCampaignType })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedIsActive, selectedIsReview, selectedCampaignStatus, selectedCampaignType, startFromDate, endFromDate, startToDate, endToDate } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedIsActive ? selectedIsActive.value : 2,
      selectedIsReview ? selectedIsReview.value : 2,
      selectedCampaignStatus ? selectedCampaignStatus.value : undefined,
      selectedCampaignType ? selectedCampaignType.value : undefined,
      startFromDate ? startFromDate.format('DD/MM/YYYY') : startFromDate,
      endFromDate ? endFromDate.format('DD/MM/YYYY') : endFromDate,
      startToDate ? startToDate.format('DD/MM/YYYY') : startToDate,
      endToDate ? endToDate.format('DD/MM/YYYY') : endToDate,
    )
  }

  onClear = () => {
    const { inputValue, selectedIsActive, selectedIsReview, selectedCampaignStatus, selectedCampaignType, startFromDate, endFromDate, startToDate, endToDate } = this.state
    if (inputValue || selectedIsActive || selectedIsReview || selectedCampaignStatus || selectedCampaignType || startFromDate || endFromDate || startToDate || endToDate) {
      this.setState({
        inputValue: '',
        selectedIsActive: { label: "Có", value: 1 },
        selectedIsReview: { label: "Tất cả", value: 3 },
        selectedCampaignStatus: null,
        selectedCampaignType: null,
        startFromDate: null,
        endFromDate: null,
        startToDate: null,
        endToDate: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { campaignStatus, campaignType } = this.props
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
                  placeholder="Nhập tên chiến dịch, tên công ty, tên cơ sở phòng tập"
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
                <Label for="" className="mr-sm-2">Thời gian bắt đầu</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startFromDate}
                    startDateId="your_unique_start_from_date"
                    endDate={this.state.endFromDate}
                    endDateId="your_unique_end_from_date"
                    onDatesChange={({ startDate, endDate }) => this.setState({ startFromDate: startDate, endFromDate: endDate })} // PropTypes.func.isRequired,
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Thời gian kết thúc</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startToDate}
                    startDateId="your_unique_start_end_date"
                    endDate={this.state.endToDate}
                    endDateId="your_unique_end_date_end_id"
                    onDatesChange={({ startDate, endDate }) => this.setState({ startToDate: startDate, endToDate: endDate })} // PropTypes.func.isRequired,
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col xs={12} sm={2}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Kích hoạt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isActives"
                  name="isActives"
                  onChange={this.handleChangeActive}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedIsActive}
                  options={this.state.isActives}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={2}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Trạng thái duyệt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isReviewed"
                  name="isReviewed"
                  onChange={this.handleChangeReview}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedIsReview}
                  options={this.state.isReviewed}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={2}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Loại chiến dịch</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="campaign_type_id"
                  name="campaign_type_id"
                  onChange={this.handleChangeCampaignType}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedCampaignType}
                  options={campaignType ? campaignType.map(({ name: label, id: value }) => ({ value, label })) : []}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={2}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Trạng thái</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="campaign_status_id"
                  name="campaign_status_id"
                  onChange={this.handleChangeCampaignStatus}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedCampaignStatus}
                  options={campaignStatus ? campaignStatus.map(({ name: label, id: value }) => ({ value, label })) : []}
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

CampaignFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default CampaignFilter

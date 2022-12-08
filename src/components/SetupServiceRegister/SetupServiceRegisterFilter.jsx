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
import DatePicker from '../Common/DatePicker'
// Model(s)

class SetupServiceRegisterFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeSetupServiceRegisterOptions = SetupServiceRegisterOptions => {
    this.setState({ SetupServiceRegisterOptions })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, SetupServiceRegisterOptions, create_date_from, create_date_to } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      SetupServiceRegisterOptions ? SetupServiceRegisterOptions.value : undefined,
      create_date_from ? create_date_from.format('DD/MM/YYYY') : create_date_from,
      create_date_to ? create_date_to.format('DD/MM/YYYY') : create_date_to
    )
  }

  onClear = () => {
    const { inputValue, SetupServiceRegisterOptions, create_date_from, create_date_to } = this.state
    if (inputValue || SetupServiceRegisterOptions || create_date_from || create_date_to) {
      this.setState({
        inputValue: "",
        SetupServiceRegisterOptions: null,
        create_date_from: null,
        create_date_to: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { SetupServiceRegisterOptions } = this.props;

    return (
      <div className="ml-3 mr-3 mb-3 mt-3">
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
                  placeholder="Nhập tên người đăng ký, số điện thoại, email"
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
                <Label for="" className="mr-sm-2">Gói setup</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="SetupServiceRegisterOptions"
                    name="SetupServiceRegisterOptions"
                    onChange={this.handleChangeSetupServiceRegisterOptions}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.SetupServiceRegisterOptions}
                    options={SetupServiceRegisterOptions.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày tạo</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.create_date_from}
                    startDateId="your_unique_start_date_id"
                    endDate={this.state.create_date_to}
                    endDateId="your_unique_end_date_id"
                    onDatesChange={({ startDate, endDate }) => this.setState({ create_date_from: startDate, create_date_to: endDate })} // PropTypes.func.isRequired,
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={12}>
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
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

SetupServiceRegisterFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default SetupServiceRegisterFilter

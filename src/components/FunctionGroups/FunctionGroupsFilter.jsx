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

class FunctionGroupsFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedOption: { label: "Có", value: 1 },
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


  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedOption,created_date_from, created_date_to, created_user } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedOption ? selectedOption.value : 2,
      created_date_from ? created_date_from.format('DD/MM/YYYY') : created_date_from,
      created_date_to ? created_date_to.format('DD/MM/YYYY') : created_date_to,
      created_user ? created_user.value : undefined
    )
  }

  onClear = () => {
    if (this.state.inputValue || this.state.selectedOption|| this.state.created_date_from || this.state.created_date_to ) {
      this.setState({
        inputValue: '',
        selectedOption: null,
        created_date_from: null,
        created_date_to: null
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
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
                  placeholder=" Nhập tên nhóm quyền"
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
                <Label for="" className="mr-sm-2">Kích hoạt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isActive"
                  name="isActive"
                  onChange={this.handleChangeSelect}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedOption}
                  options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Thời gian tạo</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.created_date_from} 
                  startDateId="created_date_from"
                  endDate={this.state.created_date_to}
                  endDateId="created_date_to"
                  onDatesChange={({ startDate, endDate }) => this.setState({ created_date_from:startDate, created_date_to: endDate })}
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

FunctionGroupsFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default FunctionGroupsFilter

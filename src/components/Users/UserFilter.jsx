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

class UserFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      /** @var {Array} */
      genders: [
        { name: "Tất cả", id: undefined },
        { name: "Nam", id: 1 },
        { name: "Nữ", id: 0 },
      ],
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeDepartments = department => {
    this.setState({ department })
  }

  handleChangePositions = position => {
    this.setState({ position })
  }

  handleChangeGender = gender => {
    this.setState({ gender })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, position, department, gender } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      department ? department.value : undefined,
      position ? position.value : undefined,
      gender ? gender.value : undefined
    )
  }

  onClear = () => {
    if (this.state.inputValue || this.state.position || this.state.department || this.state.gender) {
      this.setState({
        inputValue: '',
        position: null,
        department: null,
        gender: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { positions, departments } = this.props
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
                  placeholder="-- Tìm --"
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
                <Label for="" className="mr-sm-2">Phòng ban</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="departments"
                  name="departments"
                  onChange={this.handleChangeDepartments}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.department}
                  options={departments.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Chức vụ</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="positions"
                  name="positions"
                  onChange={this.handleChangePositions}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.position}
                  options={positions.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={2}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Giới tính</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="gender"
                  name="gender"
                  onChange={this.handleChangeGender}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.gender}
                  options={this.state.genders.map(({ name: label, id: value }) => ({ value, label }))}
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

UserFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default UserFilter


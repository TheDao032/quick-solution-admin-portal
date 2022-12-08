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

class ManufacturerFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedActive: {label: "Có", value: 1},
      selectedDelete: {label: "Chưa xóa", value: 0},
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      isDeleted: [
        { name: "Tất cả", id: 2 },
        { name: "Đã xoá", id: 1 },
        { name: "Chưa xoá", id: 0 },
      ]
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeSelect = selectedActive => {
    this.setState({ selectedActive })
  }

  handleChangeSelectDelete = selectedDelete => {
    this.setState({ selectedDelete })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedActive, selectedDelete } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedActive ? selectedActive.value : 2,
      selectedDelete ? selectedDelete.value : 2,
    )
  }

  onClear = () => {
    const { inputValue, selectedActive, selectedDelete } = this.state
    if (inputValue || selectedActive || selectedDelete) {
      this.setState({
        inputValue: '',
        selectedActive: {label: "Có", value: 1},
        selectedDelete: {label: "Chưa xóa", value: 0},
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
                  placeholder="Nhập tên nhà sản xuất, số điện thoại, email"
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
                  id="isActives"
                  name="isActives"
                  onChange={this.handleChangeSelect}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedActive}
                  options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Đã xoá</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isDeleted"
                  name="isDeleted"
                  onChange={this.handleChangeSelectDelete}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedDelete}
                  options={this.state.isDeleted.map(({ name: label, id: value }) => ({ value, label }))}
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

ManufacturerFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default ManufacturerFilter

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

class FunctionFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "",
      selectedOption: {label: "Có", value: 1},
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

  handleChangeFunctionGroup = functionGroup => {
    this.setState({ functionGroup })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    let { inputValue, selectedOption, functionGroup } = this.state;
    const { handleSubmit } = this.props;
    functionGroup = (functionGroup instanceof Array) ? functionGroup : [functionGroup];
    let functionGroupId = functionGroup.filter(_i => !!_i).map(_i => _i.value).join('|');
    handleSubmit(
      inputValue,
      selectedOption ? selectedOption.value : 2,
      functionGroupId || undefined,
    )
  }

  onClear = () => {
    if (this.state.inputValue || this.state.selectedOption || this.state.functionGroup) {
      this.setState({
        inputValue: '',
        selectedOption: null,
        functionGroup: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { functionGroup } = this.props
    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Tên quyền
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputValue"
                  placeholder="Nhập tên quyền"
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
                <Label for="" className="mr-sm-2">Nhóm quyền</Label>
                {functionGroup && (<Select
                  className="MuiPaper-filter__custom--select"
                  id="functionGroup"
                  name="functionGroup"
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  onChange={(valuesItem/*, actionItem*/) => this.handleChangeFunctionGroup(valuesItem)}
                  value={this.state.functionGroup}
                  defaultValue={{
                    'label': functionGroup[0].name,
                    'value': functionGroup[0].id,
                  }}
                  options={functionGroup.map(({ name: label, id: value }) => ({ value, label }))}
                  isMulti
                />)}
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

FunctionFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default FunctionFilter

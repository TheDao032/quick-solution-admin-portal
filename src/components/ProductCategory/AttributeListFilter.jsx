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

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
// Model(s)

class AttributeListFilter extends PureComponent {
  constructor(props) { 
    super(props)
    this.state = {
      inputValue: "",
      selectedActive:null,
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      /** @var {Array} */
      isGenders: [
        { name: "Khác", id: -1 },
        { name: "Nam", id: 1 },
        { name: "Nữ", id: 0 },
      ],
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeSelectActive = selectedActive => {
    this.setState({ selectedActive })
  }

  handleChangeSelectGender = selectedGender => {
    this.setState({ selectedGender })
  }

  handleChangeSegment = selectedSegment => {
    this.setState({ selectedSegment })
  }

  handleChangeStatusMarital = selectedStatusMarital => {
    this.setState({ selectedStatusMarital })
  }

  handleChangeCountry = selectedCountry => {
    this.setState({
      selectedCountry: null,
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedCountry }) )
  }

  handleChangeProvince = selectedProvince => {
    this.setState({
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedProvince }) )
  }

  handleChangeDistrict = selectedDistrict => {
    this.setState({
      selectedDistrict: null,
      selectedWard: null,
    }, () => this.setState({ selectedDistrict }) )
  }

  handleChangeWard = selectedWard => {
    this.setState({
      selectedWard: null
    }, () => this.setState({ selectedWard }) )
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onClear = () => {
    const { inputValue } = this.state;
    if (inputValue) {
      this.setState({
        inputValue: '',
      }, () => {
        this.onSubmit()
      })
    }
  }

  onSubmit = () => { 
    this.props.handleSubmit(this.state.inputValue)
  }

  render() {
    return (
      <div className="ml-3 mr-3 mb-3 mt-3">
          <Row>
            <Col xs={12} sm={8}>
              <Form autoComplete="nope" className="zoom-scale-9">
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="inputValue" className="mr-sm-2">
                    Từ khóa
                  </Label>
                  <Input
                    className="MuiPaper-filter__custom--input"
                    autoComplete="nope"
                    type="text"
                    name="inputValue"
                    placeholder="Nhập tên thuộc tính sản phẩm"
                    value={this.state.inputValue}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    inputprops={{
                      name: 'inputValue',
                    }}
                  />
                </FormGroup>
              </Form>
            </Col>
            <Col xs={12} sm={4} className="flex align-items-end">
              <div className="d-flex flex-fill justify-content-end">
              <FormGroup className="mb-2 ml-2 mb-sm-0">
                <CheckAccess permission="CRM_CUSDATALEADS_VIEW">
                  <Button className="col-12 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
                    <i className="fa fa-search" />
                    <span className="ml-1">Tìm kiếm</span>
                  </Button>
                </CheckAccess>
              </FormGroup>
              <FormGroup className="mb-2 ml-2 mb-sm-0">
                <Button className="mr-1 col-12 MuiPaper-filter__custom--button" onClick={this.onClear} size="sm">
                  <i className="fa fa-refresh" />
                  <span className="ml-1">Làm mới</span>
                </Button>
              </FormGroup>
            </div>
            </Col>
          </Row>
        <div className="d-flex align-items-center mt-3">
          
        </div>
      </div>
    )
  }
}

AttributeListFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default AttributeListFilter

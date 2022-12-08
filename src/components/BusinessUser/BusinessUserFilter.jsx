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
 import Select from 'react-select';

// Component(s) 

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

// Model(s)
import BusinessModel from '../../models/BusinessModel';

class BusinessUserFilter extends PureComponent {
  constructor(props) {
    super(props)

    this._businessModel = new BusinessModel();

    this.state = {
      inputValue: "",
      selectedOption: {label: "Có", value: 1},
      /** @var {Array} */
      businessArr: [
        { name: "-- Chọn --", id: "" },
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

  handleChangeDelete = deleteOption => {
    this.setState({ deleteOption })
  }

  onSubmit = () => {
    const { inputValue, business, company } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      company ? company.value : undefined,
      business ? business.value : undefined,
    )
  }

  onClear = () => {
    const { inputValue, business, company } = this.state
    if (inputValue || business || company) {
      this.setState({
        inputValue: '',
        business: null,
        company: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  handleChangeCompany = company => {
    this._businessModel.getOptions({ parent_id: company.value || -1 })
      .then(data => {
        let { businessArr } = this.state;
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr, company, business: null });
      })
    ;
  }

  handleChangeBusiness = business => {
    this.setState({ business })
  }

  render() {
    const { companyArr } = this.props;
    const { businessArr } = this.state
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
                  placeholder="Nhập tên nhân viên"
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
                <Label for="" className="mr-sm-2">Công ty</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="company_id"
                  name="company_id"
                  onChange={(changeValue) => this.handleChangeCompany(changeValue)}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.company}
                  options={companyArr.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Cơ sở</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="business"
                  name="business"
                  onChange={this.handleChangeBusiness}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.business}
                  options={businessArr.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3} className="d-flex align-items-end justify-content-end">
              <FormGroup className="mb-2 mb-sm-0">
                <Button className="col-12 pt-2 pb-2 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
                  <i className="fa fa-search" />
                  <span className="ml-1">Tìm kiếm</span>
                </Button>
              </FormGroup>
              <FormGroup className="mb-2 ml-2 mb-sm-0">
                <Button className="mr-1 col-12 pt-2 pb-2 MuiPaper-filter__custom--button" onClick={this.onClear} size="sm">
                  <i className="fa fa-refresh" />
                  <span className="ml-1">Làm mới</span>
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </div>
     )
  }
}

BusinessUserFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default BusinessUserFilter


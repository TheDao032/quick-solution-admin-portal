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
import { CheckAccess } from '../../navigation/VerifyAccess'
// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

// Model(s)
import DepartmentModel from "../../models/DepartmentModel";

class BusinessUserAddFilter extends PureComponent {
  constructor(props) {
    super(props)

    this._departmentModel = new DepartmentModel();

    this.state = {
      inputValue: "",
      selectedOption: {label: "Có", value: 1},
      /** @var {Array} */
      departmentArr: [
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
    const { inputValue, company, department } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      company ? company.value : undefined,
      department ? department.value : undefined,
    )
  }

  onClear = () => {
    const { inputValue, department, company } = this.state
    if (inputValue || department || company) {
      this.setState({
        inputValue: '',
        department: null,
        company: null,
      }, () => {
        this.onSubmit()
      })
    }
  }

  handleChangeCompany = company => {
    this._departmentModel.getOptions({ parent_id: company.value || -1, is_active:1, id_deleted:0 })
      .then(data => {
        let { departmentArr } = this.state;
        departmentArr = [departmentArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ company, departmentArr });
      })
  }

  handleChangeDepartment = department => {
    this.setState({ department })
  }

  render() {
    const { companyArr } = this.props;
    const { departmentArr } = this.state
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
                  placeholder="Nhập ID nhân viên,  họ tên, sđt, email"
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
                <Label for="" className="mr-sm-2">Phòng ban</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="department"
                  name="department"
                  onChange={this.handleChangeDepartment}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.department}
                  options={departmentArr.map(({ name: label, id: value }) => ({ value, label }))}
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
                <CheckAccess permission="SYS_BUSINESS_USER_ADD">
                  <Button color="success" className="mr-1 col-12 pt-2 pb-2 MuiPaper-filter__custom--button" onClick={this.props.submitForm} size="sm">
                    <span className="ml-1">Chọn</span>
                  </Button>
                </CheckAccess>
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </div>
     )
  }
}

BusinessUserAddFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default BusinessUserAddFilter


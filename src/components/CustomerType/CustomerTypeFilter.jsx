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
import { mapDataOptions4Select } from "../../utils/html";
// Model(s)
import BusinessModel from '../../models/BusinessModel';

class CustomerTypeFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this);
    this._businessModel = new BusinessModel();

    this.state = {
      inputValue: "",
      selectedActive: 1,
      businessArr: [{ label: "-- Chọn --", value: "" }],
      /** @var {Array} */
      isActives: [
        { label: "Tất cả", value: 2 },
        { label: "Có", value: 1 },
        { label: "Không", value: 0 },
      ],
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeSelectActive = ({ value: selectedActive }) => {
    this.setState({ selectedActive })
  }

  handleChangeSelectCustomerTypeGroup = selectedCustomerTypeGroup => {
    this.setState({ selectedCustomerTypeGroup })
  }

  handleChangeSelectCustomerType = selectCustomerType => {
    this.setState({ selectCustomerType })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }
  handleChangeCompany = ({ value: company_id }) => {
    this.setState({ company_id });
    this._businessModel
      .getOptions({ parent_id: company_id || -1 })
      .then(data => {
        // console.log(data)
        let { businessArr } = this.state;
        // console.log(businessArr);
        businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
        this.setState({ businessArr, company_id });
      });
  }

  handleChangeBusiness = ({ value: business_id }) => {
    this.setState({ business_id });
  }
  onSubmit() {
    // console.log(this.state);
    const { inputValue, startDate, endDate, selectedCustomerTypeGroup, selectCustomerType, selectedActive, company_id, business_id } = this.state
    const { handleSubmit } = this.props
    handleSubmit({
      search: inputValue,
      created_date_from: startDate ? startDate.format('DD/MM/YYYY') : startDate,
      created_date_to: endDate ? endDate.format('DD/MM/YYYY') : endDate,
      customer_type_group_id: selectedCustomerTypeGroup ? selectedCustomerTypeGroup.value : null,
      type: selectCustomerType ? selectCustomerType.value : null,
      is_active: selectedActive,
      company_id,
      business_id
    });
  }

  onClear = () => {
    const { inputValue, startDate, endDate,  selectedCustomerTypeGroup, selectCustomerType, selectedActive } = this.state
    if ( inputValue || startDate || endDate || selectedCustomerTypeGroup || selectCustomerType || selectedActive ) {
      this.setState({
        inputValue: '',
        startDate: null,
        endDate: null,
        selectedActive: 1,
      }, () => {
        this.onSubmit(true)
      })
    }
  }

  render() {
    const { customertypegroup, customertype,companyArr } = this.props
    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
          <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="inputValue" className="mr-sm-2 font-weight-bold">
                    Từ khóa
                  </Label>
                  <Input
                    className="MuiPaper-filter__custom--input"
                    autoComplete="nope"
                    type="text"
                    name="inputValue"
                    placeholder="Tìm kiếm theo tên loại khách hàng"
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
                    <FormGroup  className="mb-2 mb-sm-0">
                        <Label for="" className="mr-sm-2">Nhóm khách hàng</Label>
                        <Select
                        className="MuiPaper-filter__custom--select"
                        id="customer_type_group_id"
                        name="customer_type_group_id"
                        onChange={this.handleChangeSelectCustomerTypeGroup}
                        isSearchable={true}
                        placeholder={"-- Chọn --"}
                        value={this.state.selectedCustomerTypeGroup}
                        options={customertypegroup.map(({ name: label, id: value }) => ({ value, label }))}
                        />
                </FormGroup>                    
            </Col>
               
            <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Dạng khách hàng</Label>
                <Select
                    className="MuiPaper-filter__custom--select"
                    id="type"
                    name="type"
                    onChange={this.handleChangeSelectCustomerType}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.selectCustomerType}
                    options={customertype.map(({ name: label, id: value }) => ({ value, label }))}
                />
                </FormGroup>
            </Col>
            <Col xs={12} sm={2}>
                  <FormGroup className="mb-2 mb-sm-0">
                    <Label for="" className="mr-sm-2">Kích hoạt</Label>
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="isActives"
                      name="isActives"
                      onChange={this.handleChangeSelectActive}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={this.state.isActives.find(item => '' + item.value === '' + this.state.selectedActive)}
                      options={this.state.isActives}
                      {...this.props.controlIsActiveProps}
                    />
                  </FormGroup>
                </Col>
          </Row>

          <Row> 
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0 mt-3">
                <Label for="" className="mr-sm-2">Ngày tạo</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.startDate}
                    startDateId="your_unique_start_date_id"
                    endDate={this.state.endDate}
                    endDateId="your_unique_end_date_id"
                    onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })}
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>

            
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0  mt-3">
                <Label for="" className="mr-sm-2">Công ty áp dụng</Label>
                {(() => {
                  let props = {
                    className: "MuiPaper-filter__custom--select",
                    id: "company",
                    name: "company",
                    onChange: this.handleChangeCompany,
                    isSearchable: true,
                    placeholder: "-- Chọn --",
                    value: this.state.company,
                    options: companyArr.map(({ name: label, id: value }) => ({ value, label }))
                  };
                  if (this.props.alterCompanySelectProps) {
                    this.props.alterCompanySelectProps(props);
                  }
                  return (<Select {...props} />);
                })()}
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0 mt-3">
                <Label for="" className="mr-sm-2">Cơ sở áp dụng</Label>
                {(() => {
                  let props = {
                    className: "MuiPaper-filter__custom--select",
                    id: "business",
                    name: "business",
                    onChange: this.handleChangeBusiness,
                    isSearchable: true,
                    placeholder: "-- Chọn --",
                    value: this.state.business,
                    options: this.state.businessArr
                  };
                  if (this.props.alterBusinessSelectProps) {
                    this.props.alterBusinessSelectProps(props);
                  }
                  return (<Select {...props} />);
                })()}
              </FormGroup>
            </Col>
          </Row>
          <div className="d-flex align-items-center mt-3">
              <div className="d-flex flex-fill justify-content-end">
                <FormGroup className="mb-2 ml-2 mb-sm-0">
                  <Button className="col-12 MuiPaper-filter__custom--button" onClick={this.onSubmit} color="primary" size="sm">
                    <i className="fa fa-search mr-1" />
                    Tìm kiếm
                  </Button>
                </FormGroup>
                <FormGroup className="mb-2 ml-2 mb-sm-0">
                  <Button className="mr-1 col-12 MuiPaper-filter__custom--button" onClick={this.onClear} size="sm">
                    <i className="fa fa-refresh mr-1" />
                    Làm mới
                  </Button>
                </FormGroup>
              </div>
            </div>
        </Form>
       
      </div>
    )
  }
}

CustomerTypeFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default CustomerTypeFilter

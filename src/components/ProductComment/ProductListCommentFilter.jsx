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

class ProductListCommentFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: "", 
      selectedIsActive: {label: "Có", value: 1},
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      isServices: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      isShowWeb: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ]
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleChangeActive = selectedIsActive => {
    this.setState({ selectedIsActive })
  }

  handleChangeProductCategory = selectedProductCategory => {
    this.setState({ selectedProductCategory })
  }

  handleChangeStatusProduct = selectedStatusProduct => {
    this.setState({ selectedStatusProduct })
  }

  handleChangeManufacturer = selectedManufacturer => {
    this.setState({ selectedManufacturer })
  }

  handleChangeShowWeb = selectedIsShowWeb => {
    this.setState({ selectedIsShowWeb })
  }

  handleChangeService = selectedIsService => {
    this.setState({ selectedIsService })
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, selectedProductCategory, selectedStatusProduct, selectedManufacturer, createdFromDate, createdToDate ,selectedIsService, selectedIsActive  } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      selectedProductCategory ? selectedProductCategory.value : undefined,
      selectedStatusProduct ? selectedStatusProduct.value : undefined,
      selectedManufacturer ? selectedManufacturer.value : undefined,
      createdFromDate ? createdFromDate.format('DD/MM/YYYY') : createdFromDate,
      createdToDate ? createdToDate.format('DD/MM/YYYY') : createdToDate,
      selectedIsService ? selectedIsService.value : 2,
      selectedIsActive ? selectedIsActive.value : 2
    )
  }

  onClear = () => {
    const { inputValue, selectedProductCategory, selectedStatusProduct, selectedManufacturer, createdFromDate, createdToDate ,selectedIsService, selectedIsActive } = this.state
    if (inputValue || selectedProductCategory || selectedStatusProduct || selectedManufacturer || createdFromDate || createdToDate || selectedIsService || selectedIsActive) {
      this.setState({
        inputValue: "",
        selectedProductCategory: null,
        selectedStatusProduct: null,
        selectedManufacturer: null,
        createdFromDate: null,
        createdToDate: null,
        selectedIsService: 2,
        selectedIsActive: {label: "Có", value: 1},
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    const { productCategoryOptions, statusProducts, manufacturerOptions } = this.props;

    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
            <Col xs={12} sm={3} className="form-group">
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Từ khóa
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputValue"
                  placeholder="Nhập mã sản phẩm, tên sản phẩm"
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
                <Label for="" className="mr-sm-2">Danh mục sản phẩm</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="productCategory"
                    name="product_category_id"
                    onChange={this.handleChangeProductCategory}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.selectedProductCategory}
                    options={productCategoryOptions.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Hãng sản xuất</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="manufacturerOptions"
                    name="manufacturerOptions"
                    onChange={this.handleChangeManufacturer}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.selectedManufacturer}
                    options={manufacturerOptions.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày tạo từ</Label>
                <Col className="pl-0 pr-0">
                  <DatePicker
                    startDate={this.state.createdFromDate}
                    startDateId="your_unique_create_from_date"
                    endDate={this.state.createdToDate}
                    endDateId="your_unique_create_from_date"
                    onDatesChange={({ startDate, endDate }) => this.setState({ createdFromDate: startDate, createdToDate: endDate })} // PropTypes.func.isRequired,
                    isMultiple
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Sản phẩm dịch vụ</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isService"
                  name="isService"
                  onChange={this.handleChangeService}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedIsService}
                  options={this.state.isServices.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Trạng thái sản phẩm</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="status_product_id"
                  name="status_product_id"
                  onChange={this.handleChangeStatusProduct}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedStatusProduct}
                  options={statusProducts.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
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
                  options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                  {...this.props.controlIsActiveProps}
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

ProductListCommentFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default ProductListCommentFilter

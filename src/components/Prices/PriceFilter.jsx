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

 // Constant(s)
import { PRICE_REVIEW_ARRAY } from "../../actions/constants/price"

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

// Model(s)
import AreaModel from "../../models/AreaModel";


class PriceFilter extends PureComponent {
  _areaModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._areaModel = new AreaModel()

    this.state = {
      /** @var {Array} */
      isServiceArray: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      isOutputForWebArray: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      /** @var {Array} */
      areas: [{ name: "-- Chọn --", id: "" }],
    }
  }

  componentDidMount(){
    this._areaModel.getOptions()
      .then(data => {
        let { areas } = this.state;
        areas = [areas[0]].concat(mapDataOptions4Select(data));
        this.setState({ areas });
      })
    ;
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit = () => {
    const { inputValue, outPutType, area, business, isService, isReview, start_date, end_date, isOutputForWeb } = this.state;
    const { handleSubmit } = this.props;
    handleSubmit(
      inputValue,
      outPutType ? outPutType.value : undefined,
      area ? area.value : undefined,
      business ? business.value : undefined,
      isService ? isService.value : 2,
      isReview ? isReview.value : undefined,
      start_date || undefined,
      end_date || undefined,
      isOutputForWeb ? isOutputForWeb.value : undefined,
    )
  }

  onClear = () => {
    const { inputValue, outPutType, area, business, isService, isReview, start_date, end_date, isOutputForWeb } = this.state
    if (inputValue || outPutType || area || business || isService || isReview || start_date || end_date || isOutputForWeb) {
      this.setState({
        inputValue: "",
        isService: 2,
        outPutType: null,
        area: null,
        business: null,
        isReview: null,
        start_date: null,
        end_date: null,
        isOutputForWeb: null
      }, () => {
        this.onSubmit()
      })
    }
  }

  render() {
    // const {  } = this.props;
    const { areas, isServiceArray, isOutputForWebArray, isOutputForWeb } = this.state;
    const { businesses, outputType } = this.props;
    return (
      <div className="ml-3 mr-3 mb-3 mt-3">
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
                  placeholder="Nhập mã sản phẩm, tên sản phẩm"
                  value={this.state.inputValue}
                  onChange={(event) => this.setState({ inputValue: event.target.value }) }
                  onKeyDown={this.handleKeyDown}
                  inputprops={{
                    name: 'inputValue',
                  }}
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Hình thức xuất</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    name="output_type_id"
                    onChange={(value) => this.setState({outPutType: value})}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.outPutType}
                    options={outputType.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Khu vực</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    name="area"
                    onChange={(value) => this.setState({area:value})}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.area}
                    options={areas.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Cơ sở phòng tập</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    name="business"
                    onChange={(value) => this.setState({business:value})}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.business}
                    options={businesses.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Trạng thái</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    name="is_review"
                    onChange={(value) => this.setState({isReview: value})}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.isReview}
                    options={PRICE_REVIEW_ARRAY.map((value, key) => ({ value:key, label:value }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Sản phẩm dịch vụ</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    name="is_service"
                    onChange={(value) => this.setState({isService: value})}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this.state.isService}
                    options={isServiceArray.map(({ name: label, id: value }) => ({ value, label }))}
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày áp dụng</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.start_date} 
                  startDateId="your_unique_start_date_id"
                  endDate={this.state.end_date}
                  endDateId="your_unique_end_date_id"
                  onDatesChange={({ startDate, endDate }) => this.setState({
                    start_date:startDate,
                    end_date: endDate
                  })}
                  isMultiple
                />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Giá hiển thị web</Label>
                <Col className="pl-0 pr-0">
                  <Select
                    className="MuiPaper-filter__custom--select"
                    name="is_service"
                    onChange={(value) => this.setState({isOutputForWeb: value})}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={isOutputForWeb}
                    options={isOutputForWebArray.map(({ name: label, id: value }) => ({ value, label }))}
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

PriceFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default PriceFilter

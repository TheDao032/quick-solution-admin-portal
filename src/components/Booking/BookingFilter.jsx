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
import DatePicker from '../Common/DatePicker';
import { mapDataOptions4Select } from "../../utils/html";
// Model(s)


class BookingFilter extends PureComponent {
  constructor(props) {
    super(props) 
    this.state = {
      inputValue: "",
      bookingStatus:"",
      /** @var {Array} */
      bookingStatusArr: [
     //   { name: "Tất cả", id: "" },
        { name: "Đơn đặt hàng mới", id: "1" }, 
      ],
      /** @var {Boolean} */
      toggleCustomer: false,
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  handleChangeBookingStatus = bookingstatus => {
    this.setState({ bookingstatus })  
  }

  handleChangeBusiness = business => {
    this.setState({ business })
  }
  handleChangePosition = positionOption => {
    this.setState({ positionOption })
  }

  onSubmit = () => { 
    const { inputValue, bookingstatus, from_date, to_date} = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      bookingstatus ? bookingstatus.value : undefined,
      from_date ? from_date.format('DD/MM/YYYY') : from_date,
      to_date ? to_date.format('DD/MM/YYYY') : to_date, 
    )
  }

  onClear = () => {
    const { inputValue, bookingstatus , from_date, to_date  } = this.state
    if (inputValue || bookingstatus || from_date || to_date  ) {
      this.setState({
        inputValue: '',
        bookingstatus: null, 
        from_date:null,
        to_date:null, 
      }, () => {
        this.onSubmit()
      })
    }
  }



  render() {
    const { bookingStatusArr, positionArr} = this.props;

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
                  id="inputValue"
                  name="inputValue"
                  placeholder="Số đơn hàng, tên khách hàng, số điện thoại, email"
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
                <Label for="" className="mr-sm-2">Ngày tạo</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.from_date} 
                  startDateId="your_unique_start_date_id"
                  endDate={this.state.to_date}
                  endDateId="your_unique_end_date_id"
                  onDatesChange={({ startDate, endDate }) => this.setState({ from_date:startDate, to_date: endDate })}
                  isMultiple
                />
                </Col>
              </FormGroup>
            </Col>

            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Trạng thái đơn hàng</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="bookingstatus"
                  name="bookingstatus"
                  onChange={this.handleChangeBookingStatus}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.bookingStatus.value}
                  options={bookingStatusArr.map(({ name: label, id: value }) => ({ value, label }))} />

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

BookingFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default BookingFilter


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
import NewsStatusModel from '../../models/NewsStatusModel';

class NewsStatusFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this);
    this._newsStatusModel = new NewsStatusModel();

    this.state = {
      inputValue: "",
      selectedActive: 1,
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

  handleKeyDown = event => {
    if ((1 * event.keyCode) === 13) {
      event.preventDefault()
      this.onSubmit()
    }
  }

  onSubmit() {
    const { inputValue, selectedActive } = this.state
    const { handleSubmit } = this.props
    handleSubmit({
      search: inputValue,
      is_active: selectedActive
    });
  }

  onClear = () => {
    const { inputValue, selectedActive } = this.state
    if (inputValue || selectedActive) {
      this.setState({
        inputValue: '',
        selectedActive: 1,
      }, () => {
        this.onSubmit(true)
      })
    }
  }

  render() {
    return (
      <div className="ml-3 mr-3 mb-3 mt-3">
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
                  placeholder="Nhập tên trạng thái"
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
            <Col xs={12} sm={3}>
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

NewsStatusFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default NewsStatusFilter


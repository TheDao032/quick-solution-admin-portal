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

// Material
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  button: {
    display: 'block',
    marginTop: 16,
    paddingTop: 0,
    paddingBottom: 0,
    height: 32,
  },
  formControl: {
    margin: 8,
    minWidth: 120,
  },
  formControlBtn: {
    margin: 8,
    minWidth: 80,
  }
})

class MenuFilter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      /** @var {Array} */
      is_actives: [
        { name: "Tất cả", id: undefined },
        { name: "Có", id: "1" },
        { name: "Không", id: "0" },
      ],
      selectedOption: {label: "Có", value: 1},
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

  onSubmit = () => {
    const { inputValue, inputFunction, selectedOption, is_bussiness, is_system } = this.state;
   
    const { handleSubmit } = this.props;
    console.log(selectedOption);
    handleSubmit(inputValue, 
      inputFunction, 
      selectedOption ? selectedOption.value : 2, 
      is_bussiness, 
      is_system)
  }

  onClear = () => {
    this.setState({
      inputValue: '',
      inputFunction: '',
      selectedOption: {label: "Có", value: 1},
      is_bussiness: undefined,
      is_system: undefined,
    }, () => {
      this.onSubmit()
    })
  }

  render() {
    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Tên menu
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputValue"
                  placeholder="Nhập tên menu"
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
                <Label for="inputFunction" className="mr-sm-2">
                  Quyền
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputFunction"
                  placeholder="Nhập tên quyền"
                  value={this.state.inputFunction}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{
                    name: 'inputFunction',
                  }}
                />
              </FormGroup>
            </Col>

            {/* <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Business</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="is_bussiness"
                name="is_bussiness"
                onChange={item => {
                  let event = {
                    target: {
                      type: "select",
                      name: "is_bussiness",
                      value: item.value,
                    }
                  };
                  this.handleChange(event)
                }}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                defaultValue={this.state.is_bussiness}
                options={this.state.is_actives.map(({ name: label, id: value }) => ({ value, label }))}
              />
            </FormGroup> */}
            <Col xs={12} sm={4}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Kích hoạt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="is_active"
                  name="is_active"
                  onChange={this.handleChangeSelect}
                  isSearchable={true}
                  placeholder={this.state.is_actives[0].name}
                  value={this.state.selectedOption}
                  options={this.state.is_actives.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>

            {/* <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label for="" className="mr-sm-2">System</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="is_system"
                name="is_system"
                onChange={item => {
                  let event = {
                    target: {
                      type: "select",
                      name: "is_system",
                      value: item.value,
                    }
                  };
                  this.handleChange(event)
                }}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                defaultValue={this.state.is_system}
                options={this.state.is_actives.map(({ name: label, id: value }) => ({ value, label }))}
              />
            </FormGroup> */}
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

MenuFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default withStyles(styles)(MenuFilter)


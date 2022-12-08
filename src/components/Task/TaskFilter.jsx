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
// Model(s)
import TaskTypeModel from '../../models/TaskTypeModel';
import TaskModel from '../../models/TaskModel';

import { mapDataOptions4Select } from '../../utils/html';

class TaskFilter extends PureComponent {
  constructor(props) {
    super(props)

    this._TaskTypeModel = new TaskTypeModel()
    this._TaskModel = new TaskModel()

    this.state = {
      inputValue: "",
      /** @var {Array} */
      isActives: [
        { name: "Tất cả", id: 2 },
        { name: "Có", id: 1 },
        { name: "Không", id: 0 },
      ],
      isComplete: [
        { name: "Tất cả", id: 2 },
        { name: "Đã hoàn thành", id: 1 },
        { name: "Chưa hoàn thành", id: 0 },
      ],
      selectedOption: {label: "Có", value: 1},
      /** @var {Array} */
      taskTypeArr: [],
      taskParentArr: [],
    }
  }

  componentDidMount() {
    // Get bundle data
    (async () => {
      let bundle = await this._getBundleData();
      const { taskTypeArr, taskParentArr = [] } = bundle;
      // const task_type_id  = taskTypeArr[0];

      this.setState({
        taskTypeArr,
        taskParentArr,
        // task_type_id
      })
    })();
      
    //   this.setState({
    //     taskTypeArr,
    //     taskParentArr,
    //     // task_type_id
    //   },()=> {
    //     this.onSubmit();
    //   })
    // })();
    //.end
  }

  async _getBundleData() {
    let bundle = {}
    let all = [
      this._TaskTypeModel.getOptionsForList()
        .then(data => {
          (bundle['taskTypeArr'] = mapDataOptions4Select(data));
          // this._TaskModel.getOptions({parent_id:data[0].id })
          // .then(data2 => (bundle['taskParentArr'] = data2));
      }),
    ]
    await Promise.all(all)
      .catch(err => {
        window._$g.dialogs.alert(
          window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
          () => {
            window.location.reload();
          }
        )
      });

    // if(bundle['taskTypeArr'][0]){
    //   let getDependentData = [
    //     this._TaskModel.getOptions({parent_id:bundle['taskTypeArr'][0].id })
    //       .then(data => (bundle['taskParentArr'] = data)),
    //   ];
    //   await Promise.all(getDependentData)
    //   .catch(err => {
    //     window._$g.dialogs.alert(
    //       window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
    //       () => {
    //         window.location.reload();
    //       }
    //     )
    //   });
    // }
    return bundle
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

  handleChangeComplete = completeOption => {
    this.setState({ completeOption })
  }

  onSubmit = () => {
    const { inputValue, start_date_from, start_date_to, task_type_id, parent_id, end_date_from, end_date_to, selectedOption, completeOption } = this.state
    const { handleSubmit } = this.props
    handleSubmit(
      inputValue,
      start_date_from ? start_date_from.format('DD/MM/YYYY') : start_date_from,
      start_date_to ? start_date_to.format('DD/MM/YYYY') : start_date_to,
      task_type_id,
      parent_id ? parent_id.value : parent_id,
      end_date_from ? end_date_from.format('DD/MM/YYYY') : end_date_from,
      end_date_to ? end_date_to.format('DD/MM/YYYY') : end_date_to,
      selectedOption ? selectedOption.value : 2,
      completeOption ? completeOption.value : 2,
    )
  }

  onClear = () => {
    const { inputValue, start_date_from, start_date_to, task_type_id, parent_id, end_date_from, end_date_to, selectedOption, completeOption, taskTypeArr } = this.state;
    if (inputValue || selectedOption || start_date_from || start_date_to || completeOption || task_type_id || parent_id || end_date_from || end_date_to) {
      this.setState({
        inputValue: '',
        selectedOption: {label: "Có", value: 1},
        completeOption: null,
        start_date_from:null,
        start_date_to:null,
        task_type_id: taskTypeArr[0],
        parent_id: null,
        end_date_from:null,
        end_date_to:null
      }, () => {
        this.onSubmit()
      })
    }
  }

  handleChangeTaskType = task_type_id => {
    this._TaskModel.getOptions({ parent_id: task_type_id.id })
    .then(data => {
      this.setState({ taskParentArr: data, task_type_id });
    });
  }

  handleChangeParent = parent_id => {
    this.setState({ parent_id })
  }

  render() {
    const { taskTypeArr, taskParentArr } = this.state;
    return (
      <div  className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <Row>
            <Col xs={12} sm={6}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="inputValue" className="mr-sm-2">
                  Từ khóa
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input"
                  autoComplete="nope"
                  type="text"
                  name="inputValue"
                  placeholder="Nhập tên công việc, tên nhân viên xử lý, tên người giám sát"
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
                <Label for="" className="mr-sm-2">Ngày bắt đầu</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.start_date_from} 
                  startDateId="start_date_from"
                  endDate={this.state.start_date_to}
                  endDateId="start_date_to"
                  onDatesChange={({ startDate, endDate }) => this.setState({ start_date_from:startDate, start_date_to: endDate })}
                  isMultiple
                />
                </Col>
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Kích hoạt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isActives"
                  name="isActives"
                  onChange={this.handleChangeSelect}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.selectedOption}
                  options={this.state.isActives.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>

          </Row>

          <Row className="mt-3">

          <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Loại công việc</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="task_type_id"
                  name="task_type_id"
                  onChange={this.handleChangeTaskType}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.task_type_id}
                  options={taskTypeArr}
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Thuộc công việc</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="parent_id"
                  name="parent_id"
                  onChange={this.handleChangeParent}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.parent_id}
                  options={taskParentArr.map(({ name: label, id: value }) => ({ value, label }))}
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày kết thúc</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.end_date_from} 
                  startDateId="end_date_from"
                  endDate={this.state.end_date_to}
                  endDateId="end_date_to"
                  onDatesChange={({ startDate, endDate }) => this.setState({ end_date_from:startDate, end_date_to: endDate })}
                  isMultiple
                />
                </Col>
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Đã hoàn thành</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isCompleted"
                  name="isCompleted"
                  onChange={this.handleChangeComplete}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this.state.completeOption}
                  options={this.state.isComplete.map(({ name: label, id: value }) => ({ value, label }))}
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

TaskFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default TaskFilter


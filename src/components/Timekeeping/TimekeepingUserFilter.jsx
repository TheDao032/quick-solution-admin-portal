import React from 'react';
import {
  Input,
  FormGroup,
  Label,
  Col,
  Row,
 } from 'reactstrap';
import Select from 'react-select';
// import moment from 'moment';

// Util(s)
import {
  mapDataOptions4Select,
  MOMENT_FORMAT_DATE
} from '../../utils/html';

// Component(s)
import CommonMUIGridFilter from '../Common/MUIGrid/Filter';
import DatePicker from '../Common/DatePicker'

// Model(s)
import TimekeepingUserModel from '../../models/TimekeepingUserModel';
import ShiftModel from '../../models/ShiftModel';
import DepartmentModel from '../../models/DepartmentModel';
import BusinessModel from '../../models/BusinessModel';

/**
 * @class TimekeepingUserFilter
 */
export default class TimekeepingUserFilter extends CommonMUIGridFilter {

  constructor(props) {
    super(props);

    // Init models
    this._timekeepingUserModel = new TimekeepingUserModel();
    this._shiftModel = new ShiftModel();
    this._departmentModel = new DepartmentModel();
    this._businessModel = new BusinessModel();

    // Init state
    Object.assign(this._orgState, this.state, {
      // @var {Number|String}
      timekeeping_from: props.timekeeping_from,
      // @var {Number|String}
      timekeeping_to: props.timekeeping_to,
      // @var {Number|String}
      business_id: props.business_id || "",
      // @var {Number|String}
      department_id: props.department_id || "",
      // @var {Number|String}
      shift_id: props.shift_id || "",
    });
    // ...extends?!
    Object.assign(this.state, this._orgState, {
      /** @var {Array} */
      _optsShift: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      _optsDepartment: [
        { label: "-- Chọn --", value: "" },
      ],
      /** @var {Array} */
      _optsBusiness: [
        { label: "-- Chọn --", value: "" },
      ],
    });
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  _getBundleData = async () => {
    let bundle = {};
    let all = [
      this._shiftModel.getOptions()
        .then(data => (bundle['_optsShift'] = mapDataOptions4Select(data))),
      this._departmentModel.getOptions()
        .then(data => (bundle['_optsDepartment'] = mapDataOptions4Select(data))),
      this._businessModel.getOptions()
        .then(data => (bundle['_optsBusiness'] = mapDataOptions4Select(data))),
    ];
    if (all.length) {
      await this._callBundleData(all);
    }
    return bundle;
  };

  _formatSubmitData = (value, prop) => {
    switch (prop) {
      case 'timekeeping_from':
      case 'timekeeping_to':
        value = value ? value.format(MOMENT_FORMAT_DATE) : value;
        break;
      default:
    }
    return value;
  };

  _formatClearData = (value, prop) => {
    return value;
  };

  _renderRows = () => {
    const {
      search,
      shift_id,
      _optsShift,
      department_id,
      _optsDepartment,
      business_id,
      _optsBusiness,
      timekeeping_from,
      timekeeping_to
    } = this.state;

    return (
      <div className="clearfix">
        <Row>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="search" className="mr-sm-2">Từ khóa</Label>
              <Input
                className="MuiPaper-filter__custom--input"
                autoComplete="nope"
                type="text"
                name="search"
                placeholder="Nhập mã nhân viên, tên nhân viên,..."
                value={search}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                inputprops={{ name: 'search' }}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Cơ sở phòng tập</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsBusiness"
                name="_optsBusiness"
                onChange={({ value: business_id }) => this.setState({ business_id })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={_optsBusiness.find(({ value }) => ('' + value) === ('' + business_id))}
                options={_optsBusiness}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Phòng ban</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsDepartment"
                name="_optsDepartment"
                onChange={({ value: department_id }) => this.setState({ department_id })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={_optsDepartment.find(({ value }) => ('' + value) === ('' + department_id))}
                options={_optsDepartment}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs={12} sm={4}>
            <FormGroup>
              <Label for="" className="mr-sm-2">Ngày chấm công</Label>
              <DatePicker
                startDate={timekeeping_from}
                startDateId="timekeeping_from"
                endDate={timekeeping_to}
                endDateId="timekeeping_to"
                onDatesChange={({ startDate, endDate }) => this.setState({ timekeeping_from: startDate, timekeeping_to: endDate })}
                isMultiple
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Ca làm</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsShift"
                name="_optsShift"
                onChange={({ value: shift_id }) => this.setState({ shift_id })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={_optsShift.find(({ value }) => ('' + value) === ('' + shift_id))}
                options={_optsShift}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={4}>
            <FormGroup className="mb-2 mb-sm-0" />
          </Col>
        </Row>
      </div>
    );
  }
}

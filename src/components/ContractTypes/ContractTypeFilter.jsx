import React from 'react';
import {
  Input,
  FormGroup,
  Label,
  Col,
  Row,
 } from 'reactstrap';
import Select from 'react-select';

// Util(s)
import {
  MOMENT_FORMAT_DATE
} from '../../utils/html';

// Component(s)
import CommonMUIGridFilter from '../Common/MUIGrid/Filter';
import DatePicker from '../Common/DatePicker'

// Model(s)
import ContractTypeModel from '../../models/ContractTypeModel';

/**
 * @class ContractTypeFilter
 */
export default class ContractTypeFilter extends CommonMUIGridFilter {

  constructor(props) {
    super(props);

    // Init models
    const _contractTypeModel = (this._contractTypeModel = new ContractTypeModel());

    /** @var {Array} */
    this._optsStatus = _contractTypeModel._entity.genStatusOpts();
    this._optsType = _contractTypeModel._entity.genConstractTypeOpts();


    // Init state
    Object.assign(this._orgState, this.state, {
      // @var {Number|String}
      created_date_from: props.created_date_from,
      // @var {Number|String}
      created_date_to: props.created_date_to,
      // @var {Number|String}
      contract_type: props.contract_type || "",
      // @var {Number|String}
      is_active: props.is_active || "",
    });
    // ...extends?!
    Object.assign(this.state, this._orgState);
  }

    /**
   * Goi API, lay toan bo data lien quan,...
   */
  _getBundleData = async () => [];

  _formatSubmitData = (value, prop) => {
    switch (prop) {
      case 'created_date_from':
      case 'created_date_to':
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
      contract_type,
      created_date_from,
      created_date_to,
      is_active
    } = this.state;

    return (
      <div className="clearfix">
        <Row>
          <Col xs={12} sm={3}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="search" className="mr-sm-2">Từ khóa</Label>
              <Input
                className="MuiPaper-filter__custom--input"
                autoComplete="nope"
                type="text"
                name="search"
                placeholder="Tìm kiếm theo tên loại hợp đồng"
                value={search}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                inputprops={{ name: 'search' }}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={3}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Loại hợp đồng</Label>
              <Col className="pl-0 pr-0">
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="_optsType"
                  name="_optsType"
                  onChange={({ value: contract_type }) => { this.setState({ contract_type }); }}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={this._optsType.find(({ value }) => ('' + value) === ('' + contract_type))}
                  options={this._optsType}
                />
              </Col>
            </FormGroup>
          </Col>
          <Col xs={12} sm={3}>
            <FormGroup>
              <Label for="" className="mr-sm-2">Ngày tạo</Label>
              <DatePicker
                startDate={created_date_from}
                startDateId="created_date_from"
                endDate={created_date_to}
                endDateId="created_date_to"
                onDatesChange={({ startDate, endDate }) => this.setState({ created_date_from: startDate, created_date_to: endDate })}
                isMultiple
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={2}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Kích hoạt</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsStatus"
                name="_optsStatus"
                onChange={({ value: is_active }) => this.setState({ is_active })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={this._optsStatus.find(({ value }) => ('' + value) === ('' + is_active))}
                options={this._optsStatus}
              />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

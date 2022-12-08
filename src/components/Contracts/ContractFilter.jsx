import React from 'react';
import {
  Input,
  FormGroup,
  Label,
  Col,
  Row,
 } from 'reactstrap';
import Select from 'react-select';
import moment from 'moment';

// Util(s)
import {
  mapDataOptions4Select,
  MOMENT_FORMAT_DATE
} from '../../utils/html';

// Component(s)
import CommonMUIGridFilter from '../Common/MUIGrid/Filter';
import DatePicker from '../Common/DatePicker'

// Model(s)
import ContractModel from '../../models/ContractModel';
import ContractTypeModel from '../../models/ContractTypeModel';
import BusinessModel from '../../models/BusinessModel';

/**
 * @class ContractFilter
 */
export default class ContractFilter extends CommonMUIGridFilter {

  constructor(props) {
    super(props);

    // Init models
    const _contractModel = (this._contractModel = new ContractModel());
    this._contractTypeModel = new ContractTypeModel();
    this._businessModel = new BusinessModel();

    /** @var {Array} */
    this._optsIsRenew = _contractModel._entity.genIsRenewOpts();
    /** @var {Array} */
    this._optsPayType = _contractModel._entity.genPayTypeOpts();
    /** @var {Array} */
    this._optsStatus = _contractModel._entity.genStatusOpts();

    // Init state
    Object.assign(this._orgState, this.state, {
      // @var {Number|String}
      is_renew: props.is_renew || _contractModel._entity.IS_RENEW_ALL,
      // @var {Number|String}
      created_date_from: props.created_date_from,
      // @var {Number|String}
      created_date_to: props.created_date_to,
      // @var {Number|String}
      contract_type_id: props.contract_type_id || "",
      // @var {Object|String}
      is_pay: props.is_pay || _contractModel._entity.PAY_TYPE_3,
      // @var {Object|String}
      contract_status: props.contract_status || _contractModel._entity.STATUS_3,
      // @var {Number|String}
      business_id: props.business_id || "",
    });
    // ...extends?!
    Object.assign(this.state, this._orgState, {
      /** @var {Array} */
      _optsContractType: [
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
      this._contractTypeModel.getOptions()
        .then(data => (bundle['_optsContractType'] = mapDataOptions4Select(data))),
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
      is_renew,
      is_pay,
      contract_status,
      contract_type_id,
      _optsContractType,
      business_id,
      _optsBusiness,
      created_date_from,
      created_date_to
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
                placeholder="Nhập số hợp đồng hợp đồng, mã khách hàng, tên khách hàng,..."
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
          <Col xs={12} sm={2}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Loại hợp đồng</Label>
              <Col className="pl-0 pr-0">
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="_optsContractType"
                  name="_optsContractType"
                  onChange={({ value: contract_type_id }) => { this.setState({ contract_type_id }); }}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={_optsContractType.find(({ value }) => ('' + value) === ('' + contract_type_id))}
                  options={_optsContractType}
                />
              </Col>
            </FormGroup>
          </Col>
          <Col xs={12} sm={2}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Hợp đồng gia hạn</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsIsRenew"
                name="_optsIsRenew"
                onChange={({ value: is_renew }) => this.setState({ is_renew })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={this._optsIsRenew.find(({ value }) => ('' + value) === ('' + is_renew))}
                options={this._optsIsRenew}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs={12} sm={4}>
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
              <Label for="" className="mr-sm-2">Hình thức thanh toán</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsPayType"
                name="_optsPayType"
                onChange={({ value: is_pay }) => this.setState({ is_pay })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={this._optsPayType.find(({ value }) => ('' + value) === ('' + is_pay))}
                options={this._optsPayType}
              />
            </FormGroup>
          </Col>
          <Col xs={12} sm={2}>
            <FormGroup className="mb-2 mb-sm-0">
              <Label for="" className="mr-sm-2">Trạng thái duyệt</Label>
              <Select
                className="MuiPaper-filter__custom--select"
                id="_optsStatus"
                name="_optsStatus"
                onChange={({ value: contract_status }) => this.setState({ contract_status })}
                isSearchable={true}
                placeholder={"-- Chọn --"}
                value={this._optsStatus.find(({ value }) => ('' + value) === ('' + contract_status))}
                options={this._optsStatus}
              />
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }
}

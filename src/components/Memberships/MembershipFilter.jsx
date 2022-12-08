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
import { mapDataOptions4Select } from '../../utils/html';

// Component(s)
import CommonMUIGridFilter from '../Common/MUIGrid/Filter';
import Address, { DEFAULT_COUNTRY_ID } from '../Common/Address';

// Model(s)
import BusinessModel from '../../models/BusinessModel';

/**
 * @class MembershipFilter
 */
export default class MembershipFilter extends CommonMUIGridFilter {
  constructor(props) {
    super(props);

    // Init models
    this._businessModel = new BusinessModel();

    // Init state
    Object.assign(this._orgState, this.state, {
      // @var {Number|String}
      age_from: props.age_from || "",
      // @var {Number|String}
      age_to: props.age_to || "",
      // @var {Number|String} // 1 : nam, 0 : nu, "" : tat ca
      gender: props.gender || "",
      // @var {Object|String}
      province_id: props.province_id || "",
      // @var {Object|String}
      district_id: props.district_id || "",
      // @var {Object|String}
      ward_id: props.ward_id || "",
      // @var {Number|String}
      business_id: props.business_id || "",
    });
    // ...extends?!
    Object.assign(this.state, this._orgState, {
      /** @var {Array} */
      _optsGender: [
        { label: "Tất cả", value: "" },
        { label: "Nam", value: "1" },
        { label: "Nữ", value: "0" }
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
      this._businessModel.getOptions()
        .then(data => (bundle['_optsBusiness'] = mapDataOptions4Select(data))),
    ];
    if (all.length) {
      await this._callBundleData(all);
    }
    return bundle;
  };

  _formatSubmitData = (value, prop) => {
    return value;
  };

  _formatClearData = (value, prop) => {
    return value;
  };

  _renderRows = () => {
    const {
      search,
      is_active,
      province_id,
      district_id,
      ward_id,
      gender,
      _optsGender,
      business_id,
      _optsBusiness
    } = this.state;

    return (
      <Address className="clearfix m-3">
      {(addrProps) => {
        let {
          // CountryComponent,
          ProvinceComponent,
          DistrictComponent,
          WardComponent
        } = addrProps;
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
                    placeholder="Nhập tên hội viên, số điện thoại, email, số CMND,..."
                    value={search}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    inputprops={{ name: 'search' }}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={2}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Tỉnh/Thành phố</Label>
                  <ProvinceComponent
                    key={`province_id_of_${DEFAULT_COUNTRY_ID}_${!!province_id}`}
                    name="province_id"
                    className="MuiPaper-filter__custom--select"
                    onChange={({ value: province_id }) => {
                      let match = ('' + province_id) === ('' + this.state.province_id);
                      this.setState({
                        province_id,
                        district_id: match ? this.state.district_id : "",
                        ward_id: match ? this.state.ward_id : ""
                      });
                    }}
                    mainValue={DEFAULT_COUNTRY_ID}
                    value={province_id}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={2}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Quận/Huyện</Label>
                  <DistrictComponent
                    key={`district_id_of_${province_id || ''}`}
                    name="district_id"
                    className="MuiPaper-filter__custom--select"
                    onChange={({ value: district_id }) => {
                      let match = ('' + district_id) === this.state.district_id;
                      this.setState({
                        district_id,
                        ward_id: match ? this.state.ward_id : undefined
                      });
                    }}
                    mainValue={province_id}
                    value={district_id}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={2}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Phường/Xã</Label>
                  <WardComponent
                    key={`ward_id_of_${district_id || ''}`}
                    name="ward_id"
                    className="MuiPaper-filter__custom--select"
                    onChange={({ value: ward_id }) => this.setState({ ward_id })}
                    mainValue={district_id}
                    value={ward_id}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={2}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Kích hoạt</Label>
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="_optsActive"
                    name="_optsActive"
                    onChange={({ value: is_active }) => this.setState({ is_active })}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={this._optsActive.find(({ value }) => ('' + value) === ('' + is_active))}
                    options={this._optsActive}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Độ tuổi (từ - đến)</Label>
                  <Col className="pl-0 pr-0">
                    <Row>
                      <Col xs={12} sm={6}>
                        <Input
                          className="MuiPaper-filter__custom--input text-right"
                          autoComplete="nope"
                          type="number"
                          name="age_from"
                          placeholder="0"
                          value={this.state.age_from}
                          min={0}
                          onChange={this.handleChange}
                          inputprops={{ name: 'age_from' }}
                        />
                      </Col>
                      <Col xs={12} sm={6}>
                        <Input
                          className="MuiPaper-filter__custom--input text-right"
                          autoComplete="nope"
                          type="number"
                          name="age_to"
                          placeholder="0"
                          min={0}
                          value={this.state.age_to}
                          onChange={this.handleChange}
                          inputprops={{ name: 'age_to' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} sm={2}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Giới tính</Label>
                  <Col className="pl-0 pr-0">
                    <Select
                      className="MuiPaper-filter__custom--select"
                      id="_optsGender"
                      name="_optsGender"
                      onChange={({ value: gender }) => { this.setState({ gender }); }}
                      isSearchable={true}
                      placeholder={"-- Chọn --"}
                      value={_optsGender.find(({ value }) => ('' + value) === ('' + gender))}
                      options={_optsGender}
                    />
                  </Col>
                </FormGroup>
              </Col>
              <Col xs={12} sm={4}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Cơ sở</Label>
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
            </Row>
          </div>
        );
      }}</Address>
    );
  }
}

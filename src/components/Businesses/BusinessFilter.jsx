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
import CompanyModel from '../../models/CompanyModel';

/**
 * @class BusinessFilter
 */
export default class BusinessFilter extends CommonMUIGridFilter {
  constructor(props) {
    super(props);

    // Init models
    this._companyModel = new CompanyModel();

    // Init state
    Object.assign(this._orgState, this.state, {
      // @var {Object|String}
      company_id: props.company_id || "",
      // @var {Object|String}
      province_id: props.province_id || "",
      // @var {Object|String}
      district_id: props.district_id || "",
      // @var {Object|String}
      ward_id: props.ward_id || ""
    });
    // ...extends?!
    Object.assign(this.state, this._orgState, {
      /** @var {Array} */
      _optsCompany: [
        { label: "-- Chọn --", value: "" },
      ]
    });
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  _getBundleData = async () => {
    let bundle = {};
    let all = [
      this._companyModel.getOptions()
        .then(data => (bundle['_optsCompany'] = mapDataOptions4Select(data))),
    ];
    if (all.length) {
      await this._callBundleData(all);
    }
    return bundle;
  };

  _renderRows = () => {
    const {
      search,
      is_active,
      province_id,
      district_id,
      ward_id,
      company_id,
      _optsCompany
    } = this.state;
    const { handleActionSelect } = this.props;

    return (
      <Address className="clearfix">
      {(addrProps) => {
        let {
          // CountryComponent,
          ProvinceComponent,
          DistrictComponent,
          WardComponent
        } = addrProps;

        return (
          <div className="clearfix">
            {!handleActionSelect && (<Row>
              <Col xs={12} sm={6}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="search" className="mr-sm-2 font-weight-bold">
                    Từ khóa
                  </Label>
                  <Input
                    className="MuiPaper-filter__custom--input"
                    autoComplete="nope"
                    type="text"
                    name="search"
                    placeholder="Nhập tên cơ sở, số điện thoại, email"
                    value={search}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    inputprops={{ name: 'search' }}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2 font-weight-bold">Trực thuộc công ty</Label>
                  <Select
                    className="MuiPaper-filter__custom--select"
                    id="company_id"
                    name="company_id"
                    onChange={({ value: company_id }) => this.setState({ company_id })}
                    isSearchable={true}
                    placeholder={"-- Chọn --"}
                    value={_optsCompany.find(({ value }) => ('' + value) === ('' + company_id))}
                    options={_optsCompany}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={3}>
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
            </Row>)}
            {!handleActionSelect && (<Row className="mt-3">
              <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Tỉnh/Thành phố</Label>
                  <ProvinceComponent
                    key={`province_of_${DEFAULT_COUNTRY_ID}_${!!province_id}`}
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
              <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Quận/Huyện</Label>
                  <DistrictComponent
                    key={`district_of_${province_id || ''}`}
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
              <Col xs={12} sm={3}>
                <FormGroup className="mb-2 mb-sm-0">
                  <Label for="" className="mr-sm-2">Phường/Xã</Label>
                  <WardComponent
                    key={`ward_of_${district_id || ''}`}
                    name="ward_id"
                    className="MuiPaper-filter__custom--select"
                    onChange={({ value: ward_id }) => this.setState({ ward_id })}
                    mainValue={district_id}
                    value={ward_id}
                  />
                </FormGroup>
              </Col>
            </Row>)}
            <div className="d-flex align-items-center mt-3">
              {handleActionSelect && (<div className="d-flex flex-fill justify-content-start">
                <Label for="search" className="mr-sm-2 font-weight-bold col-sm-2 mb-0 pl-0 d-flex align-items-center">
                  Từ khóa
                </Label>
                <Input
                  className="MuiPaper-filter__custom--input col-sm-10"
                  autoComplete="nope"
                  type="text"
                  name="search"
                  placeholder="Nhập tên câu lạc bộ, số điện thoại, email"
                  value={search}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{ name: 'search' }}
                />
              </div>)}
            </div>
          </div>
        );
      }}</Address>
    )
  }
}



import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Input,
  Button,
  Form,
  FormGroup,
  Label,
  Col,
  // Row,
 } from 'reactstrap'
 import Select from 'react-select';

// Component(s)
import DatePicker from '../Common/DatePicker';
import { mapDataOptions4Select } from "../../utils/html";

// Model(s)
import PromotionOfferModel from '../../models/PromotionOfferModel';
import CompanyModel from '../../models/CompanyModel';
import BusinessModel from '../../models/BusinessModel';
// ...

class PromotionOffersFilter extends PureComponent {
  constructor(props) {
    super(props)

    // Init models
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Init state
    this.state = {
      inputValue: "",
      selectedOption: 1,
      /** @var {Array} */
      companies: [{ label: "-- Chọn --", value: "" }],
      /** @var {String|Number} */
      company_id: this.props.company_id || "",
      /** @var {Array} */
      businessArr: [{ label: "-- Chọn --", value: "" }],
      /** @var {String|Number} */
      business_id: "",
      /** @var {Array} */
      offerTypeOpts: [{ label: "-- Chọn --", value: "" }].concat(
        PromotionOfferModel.getOfferTypeOptsStatic()
      ),
      /** @var {String|Number} */
      offer_type: "",
      /** @var {Array} */
      isActives: [
        { label: "Tất cả", value: 2 },
        { label: "Có", value: 1 },
        { label: "Không", value: 0 },
      ],
    }
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle });
    })();
    //.end
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let bundle = {};
    let all = [
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = mapDataOptions4Select(data))),
    ];
    await Promise.all(all).catch(console.error);
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data).filter(_i => !!_i);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
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

  onSubmit = () => {
    const {
      inputValue: search,
      selectedOption: is_active,
      company_id,
      business_id,
      offer_type,
      create_date_from, create_date_to
    } = this.state
    const { handleSubmit } = this.props
    handleSubmit({
      search,
      company_id,
      business_id,
      offer_type,
      is_active,
      create_date_from: create_date_from ? create_date_from.format('DD/MM/YYYY') : create_date_from,
      create_date_to: create_date_to ? create_date_to.format('DD/MM/YYYY') : create_date_to
    });
  }

  onClear = () => {
    // const { inputValue, selectedOption, create_date_from, create_date_to } = this.state
    // if (inputValue || selectedOption || create_date_from || create_date_to) {
      this.setState({
        inputValue: '',
        selectedOption: 1,
        company_id: "",
        business_id: "",
        offer_type: "",
        create_date_from: null,
        create_date_to: null
      }, () => {
        this.onSubmit()
      })
    // }
  }

  render() {
    let {
      companies, company_id,
      businessArr, business_id,
      offerTypeOpts, offer_type,
      selectedOption, isActives,
    } = this.state;
    let isActive = isActives.find(item => ('' + item.value) === ('' + selectedOption));
    // let isDelete = isDeletes.find(item => ('' + item.value) === ('' + deleteOption));

    return (
      <div className="ml-3 mr-3 mb-3 mt-3">
        <Form autoComplete="nope" className="zoom-scale-9">
          <FormGroup row>
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
                  placeholder="Tên ưu đãi khuyến mại"
                  value={this.state.inputValue}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  inputprops={{ name: 'inputValue' }}
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Công ty</Label>
                {(() => {
                  let value = companies.find(item => '' + item.value === '' + company_id);
                  let props = {
                    className: "MuiPaper-filter__custom--select",
                    name: "company_id",
                    onChange: ({ value: company_id }) => {
                      this.setState({ company_id, business_id: "" });
                      this._businessModel.getOptions({ is_active: 1, parent_id: company_id || -1  })
                        .then(data => {
                          let { businessArr } = this.state;
                          businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
                          this.setState({ businessArr });
                        })
                    },
                    isSearchable: true,
                    placeholder: companies[0].label,
                    value,
                    options: companies
                  };
                  if (this.props.alterCompanySelectProps) {
                    this.props.alterCompanySelectProps(props);
                  }
                  return (<Select {...props} />);
                })()}
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Cơ sở phòng tập</Label>
                {(() => {
                  let value = businessArr.find(item => '' + item.value === '' + business_id);
                  let props = {
                    key: `business_id-${company_id}`,
                    className: "MuiPaper-filter__custom--select",
                    name: "business_id",
                    onChange: ({ value: business_id }) => this.setState({ business_id }),
                    isSearchable: true,
                    placeholder: businessArr[0].label,
                    value,
                    options: businessArr
                  };
                  if (this.props.alterBusinessSelectProps) {
                    this.props.alterBusinessSelectProps(props);
                  }
                  return (<Select {...props} />);
                })()}
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ưu đãi khuyến mại</Label>
                {(() => {
                  let value = offerTypeOpts.find(item => '' + item.value === '' + offer_type);
                  return (
                    <Select
                      className="MuiPaper-filter__custom--select"
                      name="offer_type"
                      onChange={({ value: offer_type }) => this.setState({ offer_type })}
                      isSearchable={true}
                      placeholder={offerTypeOpts[0].label}
                      value={value}
                      options={offerTypeOpts}
                    />
                  );
                })()}
              </FormGroup>
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Kích hoạt</Label>
                <Select
                  className="MuiPaper-filter__custom--select"
                  id="isActives"
                  name="isActives"
                  onChange={({ value: selectedOption }) => this.setState({ selectedOption })}
                  isSearchable={true}
                  placeholder={"-- Chọn --"}
                  value={isActive}
                  options={this.state.isActives}
                  {...this.props.controlIsActiveProps}
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Thời gian tạo</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.create_date_from} 
                  startDateId="your_unique_start_date_id"
                  endDate={this.state.create_date_to}
                  endDateId="your_unique_end_date_id"
                  onDatesChange={({ startDate, endDate }) => this.setState({
                    create_date_from:startDate,
                    create_date_to: endDate
                  })}
                  isMultiple
                />
                </Col>
              </FormGroup>
            </Col>
          </FormGroup>
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

PromotionOffersFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default PromotionOffersFilter


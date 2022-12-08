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
import PromotionModel from '../../models/PromotionModel';
import CompanyModel from '../../models/CompanyModel';
import BusinessModel from '../../models/BusinessModel';
// ...

class PromotionFilter extends PureComponent {
  constructor(props) {
    super(props)

    // Init models
    this._companyModel = new CompanyModel();
    this._businessModel = new BusinessModel();

    // Bind method(s)
    this.onSubmit = this.onSubmit.bind(this);

    // Init state
    this.state = {
      inputValue: "",
      selectedOption: 1,
      /** @var {Array} */
      companies: [{ label: "-- Chọn --", value: "" }],
      /** @var {String|Number} */
      company_id: "",
      /** @var {Array} */
      businessArr: [{ label: "-- Chọn --", value: "" }],
      /** @var {String|Number} */
      business_id: "",
      /** @var {Array} */
      reviewOpts: PromotionModel.getReviewOptsStatic(),
      /** @var {String|Number} */
      is_review: "3",
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
      is_review,
      begin_date, end_date
    } = this.state
    const { handleSubmit } = this.props
    handleSubmit({
      search,
      company_id,
      business_id,
      is_review,
      is_active,
      begin_date: begin_date ? begin_date.format('DD/MM/YYYY') : begin_date,
      end_date: end_date ? end_date.format('DD/MM/YYYY') : end_date
    });
  }

  onClear = () => {
    // const { inputValue, selectedOption, begin_date, end_date } = this.state
    // if (inputValue || selectedOption || begin_date || end_date) {
      this.setState({
        inputValue: '',
        selectedOption: "1",
        company_id: "",
        business_id: "",
        is_review: "3",
        begin_date: null,
        end_date: null
      }, () => {
        this.onSubmit()
      })
    // }
  }

  render() {
    let {
      companies, company_id,
      businessArr, business_id,
      reviewOpts, is_review,
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
                  placeholder="Tên chương trình KM"
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
                  return (
                    <Select
                      className="MuiPaper-filter__custom--select"
                      name="company_id"
                      onChange={({ value: company_id }) => {
                        this.setState({ company_id, business_id: "" });
                        this._businessModel.getOptions({ is_active: 1, parent_id: company_id || -1  })
                          .then(data => {
                            let { businessArr } = this.state;
                            businessArr = [businessArr[0]].concat(mapDataOptions4Select(data));
                            this.setState({ businessArr });
                          })
                      }}
                      isSearchable={true}
                      placeholder={companies[0].label}
                      value={value}
                      options={companies}
                    />
                  );
                })()}
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Cơ sở</Label>
                {(() => {
                  let value = businessArr.find(item => '' + item.value === '' + business_id);
                  return (
                    <Select
                      key={`business_id-${company_id}`}
                      className="MuiPaper-filter__custom--select"
                      name="business_id"
                      onChange={({ value: business_id }) => this.setState({ business_id })}
                      isSearchable={true}
                      placeholder={businessArr[0].label}
                      value={value}
                      options={businessArr}
                    />
                  );
                })()}
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Đã duyệt</Label>
                {(() => {
                  let value = reviewOpts.find(item => '' + item.value === '' + is_review);
                  return (
                    <Select
                      className="MuiPaper-filter__custom--select"
                      name="is_review"
                      onChange={({ value: is_review }) => this.setState({ is_review })}
                      isSearchable={true}
                      placeholder={reviewOpts[0].label}
                      value={value}
                      options={reviewOpts}
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
                />
              </FormGroup>
            </Col>

            <Col xs={12} sm={3}>
              <FormGroup className="mb-2 mb-sm-0">
                <Label for="" className="mr-sm-2">Ngày áp dụng</Label>
                <Col className="pl-0 pr-0">
                <DatePicker
                  startDate={this.state.begin_date} 
                  startDateId="your_unique_start_date_id"
                  endDate={this.state.end_date}
                  endDateId="your_unique_end_date_id"
                  onDatesChange={({ startDate, endDate }) => this.setState({
                    begin_date:startDate,
                    end_date: endDate
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

PromotionFilter.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default PromotionFilter


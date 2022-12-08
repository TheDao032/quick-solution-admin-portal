import React, { Component, PureComponent } from "react";
import Select from "react-select";

// Model(s)
import CountryModel from "../../../models/CountryModel";
import ProvinceModel from "../../../models/ProvinceModel";
import DistrictModel from "../../../models/DistrictModel";
import WardModel from "../../../models/WardModel";

// Init model(s)
const countryModel = new CountryModel();
const provinceModel = new ProvinceModel();
const districtModel = new DistrictModel();
const wardModel = new WardModel();

/** @var {Number} */
export const DEFAULT_COUNTRY_ID = CountryModel.ID_VN;

/**
 * Helper: map remote data
 * @param {Array} data
 * @return {Array}
 */
function mapData(data) {
  return data.map(({ name, id, ...props }) => ({ label: name, value: id, ...props }));
}

/**
 * Helper: format parent_id
 * @param {Number} parent_id
 * @return {Number}
 */
function parentId(parent_id) {
  return (parent_id || -1);
}

/**
 * Helper: convert (default) value
 * @param {any} value
 * @param {Array} options
 * @return {Array}
 */
function convertValue(value, options) {
  if (!(typeof value === 'object') && (options && options.length)) {
    value = (_val => {
      return options.find((item) => ('' + item.value) === ('' + _val));
    })(value);
  }
  return value;
}

/**
 * Helper: format <Select /> props
 * @param {Object} selectProps
 * @param {Object} selectOpts Select's options
 * @return {Object}
 */
function convertSelectProps(selectProps, selectOpts) {
  let { value, defaultValue, ...props } = selectProps;
  let _props = {
    isSearchable: true,
    placeholder: (selectOpts[0] && selectOpts[0].label) || '',
    value: (undefined !== value) ? convertValue(value, selectOpts) : undefined,
    defaultValue: (undefined !== defaultValue) ? convertValue(defaultValue, selectOpts) : undefined,
    options: selectOpts,
    ...props
  };
  return _props;
}

/**
 * Get remote country data
 * @return Promise<Array>
 */
export function getCountryData() {
  return countryModel.getOptions().then(mapData);
}
/**
 * Get remote province data
 * @param {number} parent_id 
 * @return Promise<Array>
 */
export function getProvinceData(parent_id) {
  let data = getProvinceData.cache[parent_id = parentId(parent_id)];
  if (data) {
    return Promise.resolve(data);
  }
  return provinceModel.getOptions(parent_id)
    .then(data => (getProvinceData.cache[parent_id] = mapData(data)))
  ;
}
getProvinceData.cache = {};
/**
 * Get remote district data
 * @param {number} parent_id 
 * @return Promise
 */
export function getDistrictData(parent_id) {
  let data = getDistrictData.cache[parent_id = parentId(parent_id)];
  if (data) {
    return Promise.resolve(data);
  }
  return districtModel.getOptions(parent_id)
    .then(data => (getDistrictData.cache[parent_id] = mapData(data)))
  ;
}
getDistrictData.cache = {};
/**
 * Get remote ward data
 * @param {number} parent_id 
 * @return Promise
 */
export function getWardData(parent_id) {
  let data = getWardData.cache[parent_id = parentId(parent_id)];
  if (data) {
    return Promise.resolve(data);
  }
  return wardModel.getOptions(parent_id)
    .then(data => (getWardData.cache[parent_id] = mapData(data)))
  ;
}
getWardData.cache = {};

/**
 * @class CountryComponent
 */
export class CountryComponent extends PureComponent {
  constructor(props) {
    super(props);
    // Init state
    this.state = {
      /** @var {Array} */
      options: [{ label: "-- Quốc gia --", value: "" }]
    };
  }

  componentDidMount() {
    (async () => {
      let { options } = this.state;
      let data = await getCountryData();
      options = [options[0]].concat(data);
      this.setState({ options });
    })();
  }

  render() {
    let props = convertSelectProps(this.props, this.state.options);
    return <Select {...props} />;
  }
}

/**
 * @class ProvinceComponent
 */
export class ProvinceComponent extends PureComponent {
  constructor(props) {
    super(props);
    // Init state
    this.state = {
      /** @var {Array} */
      options: [{ label: "-- Tỉnh/Thành phố --", value: "" }]
    };
  }

  componentDidMount() {
    (async () => {
      let { options } = this.state;
      let data = await getProvinceData(this.props.mainValue);
      options = [options[0]].concat(data);
      this.setState({ options });
    })();
  }

  render() {
    let props = convertSelectProps(this.props, this.state.options);
    return <Select {...props} />;
  }
}

/**
 * @class DistrictComponent
 */
export class DistrictComponent extends PureComponent {
  constructor(props) {
    super(props);
    // Init state
    this.state = {
      /** @var {Array} */
      options: [{ label: "-- Quận/Huyện --", value: "" }]
    };
  }

  componentDidMount() {
    (async () => {
      let { options } = this.state;
      let data = await getDistrictData(this.props.mainValue);
      options = [options[0]].concat(data);
      this.setState({ options });
    })();
  }

  render() {
    let props = convertSelectProps(this.props, this.state.options);
    return <Select {...props} />;
  }
}

/**
 * @class WardComponent
 */
export class WardComponent extends PureComponent {
  constructor(props) {
    super(props);
    // Init state
    this.state = {
      /** @var {Array} */
      options: [{ label: "-- Phường/Xã --", value: "" }]
    };
  }

  componentDidMount() {
    (async () => {
      let { options } = this.state;
      let data = await getWardData(this.props.mainValue);
      options = [options[0]].concat(data);
      this.setState({ options });
    })();
  }

  render() {
    let props = convertSelectProps(this.props, this.state.options);
    return <Select {...props} />;
  }
}

/**
 * @class Address
 */
export default class Address extends Component {
  render() {
    let { children, ...props } = this.props;
    return (
      <div {...props}>{children({
        CountryComponent: CountryComponent,
        ProvinceComponent: ProvinceComponent,
        DistrictComponent: DistrictComponent,
        WardComponent: WardComponent
      })}</div>
    );
  }
}
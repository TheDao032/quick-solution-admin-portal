import React, { PureComponent } from "react";
import Select from "react-select";

// Model(s)
import UserModel from "../../../models/UserModel";

// Init model(s)
const userModel = new UserModel();

/**
 * Helper: map remote data
 * @param {Array} data
 * @return {Array}
 */
function mapData(data) {
  return data.map(item => {
    let { user_name, full_name, user_id } = item;
    return ({ label: `[${user_name}] ${full_name}`, value: user_id, user_name, ...item });
  });
}

/**
 * Helper: convert (default) value
 * @param {any} value
 * @param {Array} options
 * @return {Array}
 */
function convertValue(value, options) {
  if (!(typeof value === 'object') && (options && options.length)) {
    value = options.find((item) => ('' + item.value) === ('' + value));
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
 * Get remote user data
 * @return Promise<Array>
 */
export function getUserData() {
  return userModel.getOptionsFull({ _opts: { raw: true } }).then(mapData);
}

/**
 * @class UserComponent
 */
export default class UserComponent extends PureComponent {
  constructor(props) {
    super(props);
    // Init state
    this.state = {
      /** @var {Array} */
      options: [{ label: "-- Chọn --", value: "", user_name: "" }]
    };
  }

  componentDidMount() {
    (async () => {
      let { options } = this.state;
      let data = await getUserData();
      options = [options[0]].concat(data);
      this.setState({ options });
    })();
  }

  render() {
    let props = convertSelectProps(this.props, this.state.options);
    return <Select {...props} />;
  }
}

import React, { Component } from 'react'
import 'react-datetime/css/react-datetime.css'
import Datetime from "react-datetime";
// import moment from 'moment'

// Util(s)
import {
  MOMENT_FORMAT_DATE,
  MOMENT_FORMAT_DATETIME,
  MOMENT_FORMAT_TIME
} from '../../utils/html';

/**
 * @class DatetimePicker
 */
export default class DatetimePicker extends Component {
  render() {
    let { inputProps, ...props } = this.props;
    //
    inputProps = Object.assign({
      placeholder: MOMENT_FORMAT_DATETIME
    }, inputProps);

    return <Datetime
      dateFormat={MOMENT_FORMAT_DATE}
      timeFormat={MOMENT_FORMAT_TIME}
      closeOnSelect={true}
      inputProps={inputProps}
      {...props}
    />;
  }
}

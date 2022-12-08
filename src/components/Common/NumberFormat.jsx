import React, { Component } from 'react'
import ReactNumberFormat from 'react-number-format';
import {
  Input
} from 'reactstrap';

/**
 * @class NumberFormat
 */
export default class NumberFormat extends Component {
  render() {
    let { ...props } = this.props;

    return <ReactNumberFormat
      thousandSeparator=","
      decimalSeparator="."
      decimalScale={0}
      fixedDecimalScale={false}
      isNumericString
      mask="_"
      type="text"
      placeholder="0"
      className="text-right"
      customInput={Input}
      {...props}
    />;
  }
}

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import { SingleDatePicker, DateRangePicker } from 'react-dates'
import moment from 'moment'

const propTypes = {
  isMultiple: PropTypes.bool,
}

const defaultProps = {
  isMultiple: false,
}

/**
 * @class DatePicker
 */
class DatePicker extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { isMultiple, minToday, maxToday, ...other } = this.props;
    const now = moment();

    if (isMultiple) {
      return (
        <DateRangePicker
          {...other}
          focusedInput={this.state.focusedInput}
          onFocusChange={focusedInput => this.setState({ focusedInput })}
          isOutsideRange={(day) => {
            let result = false;
            minToday && (result = day.isBefore(now));
            maxToday && (result = day.isAfter(now));
            return result;
          }}
          displayFormat="DD/MM/YYYY"
          startDatePlaceholderText="dd/mm/yyyy"
          endDatePlaceholderText="dd/mm/yyyy"
          showDefaultInputIcon
          block
      />
      )
    }

    return (
      <SingleDatePicker
        {...other}
        focused={this.state.focused}
        onFocusChange={({ focused }) => this.setState({ focused })}
        displayFormat="DD/MM/YYYY"
        placeholder="dd/mm/yyyy"
        numberOfMonths={1}
        isOutsideRange={(day) => {
          let result = false;
          minToday && (result = day.isBefore(now));
          maxToday && (result = day.isAfter(now));
          return result;
        }}
        showDefaultInputIcon
        block
      />
    )
  }
}

DatePicker.propTypes = propTypes;
DatePicker.defaultProps = defaultProps;

export default DatePicker

import React, { PureComponent } from 'react';

// Component(s)
import BookingEdit from './BookingEdit';

/**
 * @class TaskDetail
 */
export default class BookingDetail extends PureComponent {
  render() {
    return <BookingEdit {...this.props} noEdit={true} />
  }
}

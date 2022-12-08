import React, { PureComponent } from 'react';

// Component(s)
import TimekeepingUserEdit from './TimekeepingUserEdit';

/**
 * @class TimekeepingUserDetail
 */
export default class TimekeepingUserDetail extends PureComponent {
  render() {
    return <TimekeepingUserEdit {...this.props} noEdit={true} />
  }
}

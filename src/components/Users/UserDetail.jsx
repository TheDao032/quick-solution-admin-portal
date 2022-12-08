import React, { PureComponent } from 'react';

// Component(s)
import UserEdit from './UserEdit';

/**
 * @class UserDetail
 */
export default class UserDetail extends PureComponent {
  render() {
    return <UserEdit {...this.props} noEdit={true} />
  }
}

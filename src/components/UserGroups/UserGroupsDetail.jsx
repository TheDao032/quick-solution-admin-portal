import React, { PureComponent } from 'react';

// Component(s)
import UserGroupsEdit from './UserGroupsEdit';

/**
 * @class UserGroupsDetail
 */
export default class UserGroupsDetail extends PureComponent {
  render() {
    return <UserGroupsEdit {...this.props} noEdit={true} />
  }
}
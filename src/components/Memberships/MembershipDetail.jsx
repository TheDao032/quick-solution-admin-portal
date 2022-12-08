import React, { PureComponent } from 'react';

// Component(s)
import MembershipEdit from './MembershipEdit';

/**
 * @class MembershipDetail
 */
export default class MembershipDetail extends PureComponent {
  render() {
    return <MembershipEdit {...this.props} noEdit={true} />
  }
}

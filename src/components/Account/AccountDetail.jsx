import React, { PureComponent } from 'react';

// Component(s)
import AccountEdit from './AccountEdit';

/**
 * @class AccountEditDetail
 */
export default class AccountEditDetail extends PureComponent {
  render() {
    return <AccountEdit {...this.props} noEdit={true} />
  }
}

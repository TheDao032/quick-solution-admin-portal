import React, { PureComponent } from 'react';

// Component(s)
import SetupServiceRegisterEdit from './SetupServiceRegisterEdit';

/**
 * @class SetupServiceRegisterDetail
 */
export default class SetupServiceRegisterDetail extends PureComponent {
  render() {
    return <SetupServiceRegisterEdit {...this.props} noEdit={true} />
  }
}

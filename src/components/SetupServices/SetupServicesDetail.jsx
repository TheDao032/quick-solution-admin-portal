import React, { PureComponent } from 'react';

// Component(s)
import SetupServicesEdit from './SetupServicesEdit';

/**
 * @class SetupServicesEdDetail
 */
export default class SetupServicesDetail extends PureComponent {
  render() {
    return <SetupServicesEdit {...this.props} noEdit={true} />
  }
}

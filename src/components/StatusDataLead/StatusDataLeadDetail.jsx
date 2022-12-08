import React, { PureComponent } from 'react';

// Component(s)
import StatusDataLeadEdit from './StatusDataLeadEdit';

/**
 * @class BusinessDetail
 */
export default class BusinessDetail extends PureComponent {
  render() {
    return <StatusDataLeadEdit {...this.props} noEdit={true} />
  }
}


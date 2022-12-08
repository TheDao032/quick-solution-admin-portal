import React, { PureComponent } from 'react';

// Component(s)
import CustomerDataLeadEdit from './CustomerDataLeadEdit';

/**
 * @class CustomerDataLeadDetail
 */
export default class CustomerDataLeadDetail extends PureComponent {
  render() {
    return <CustomerDataLeadEdit {...this.props} noEdit={true} />
  }
}

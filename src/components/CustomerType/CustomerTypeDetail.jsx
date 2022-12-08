import React, { PureComponent } from 'react';

// Component(s)
import CustomerTypeEdit from './CustomerTypeEdit';

/**
 * @class CustomerTypeDetail
 */
export default class CustomerTypeDetail extends PureComponent {
  render() {
    return <CustomerTypeEdit {...this.props} noEdit={true} />
  }
}

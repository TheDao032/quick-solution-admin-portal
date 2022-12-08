import React, { PureComponent } from 'react';

// Component(s)
import BusinessTypeEdit from './BusinessTypeEdit';

/**
 * @class BusinessTypeDetail
 */
export default class BusinessTypeDetail extends PureComponent {
  render() {
    return <BusinessTypeEdit {...this.props} noEdit={true} />
  }
}

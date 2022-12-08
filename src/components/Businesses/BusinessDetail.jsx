import React, { PureComponent } from 'react';

// Component(s)
import BusinessEdit from './BusinessEdit';

/**
 * @class BusinessDetail
 */
export default class BusinessDetail extends PureComponent {
  render() {
    return <BusinessEdit {...this.props} noEdit />
  }
}


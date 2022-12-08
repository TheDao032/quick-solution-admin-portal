import React, { PureComponent } from 'react';

// Component(s)
import StoreEdit from './StoreEdit';

/**
 * @class StoreDetail
 */
export default class StoreDetail extends PureComponent {
  render() {
    return <StoreEdit {...this.props} noEdit={true} />
  }
}

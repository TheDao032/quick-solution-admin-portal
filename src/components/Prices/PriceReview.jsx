import React, { PureComponent } from 'react';

// Component(s)
import PriceEdit from './PriceEdit';

/**
 * @class PriceDetail
 */
export default class PriceDetail extends PureComponent {
  render() {
    return <PriceEdit {...this.props} isReview={true} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import PromotionEdit from './PromotionEdit';

/**
 * @class PromotionDetail
 */
export default class PromotionDetail extends PureComponent {
  render() {
    return <PromotionEdit {...this.props} noEdit={true} />
  }
}


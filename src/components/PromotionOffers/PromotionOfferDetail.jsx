import React, { PureComponent } from 'react';

// Component(s)
import PromotionOfferEdit from './PromotionOfferEdit';

/**
 * @class PromotionOfferDetail
 */
export default class PromotionOfferDetail extends PureComponent {
  render() {
    let { props } = this;
    return <PromotionOfferEdit {...props} noEdit={true} />
  }
}

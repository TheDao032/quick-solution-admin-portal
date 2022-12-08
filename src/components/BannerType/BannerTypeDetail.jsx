import React, { PureComponent } from 'react';

// Component(s)
import BannerTypeEdit from './BannerTypeEdit';

/**
 * @class BannerTypeDetail
 */
export default class BannerTypeDetail extends PureComponent {
  render() {
    return <BannerTypeEdit {...this.props} noEdit={true} />
  }
}

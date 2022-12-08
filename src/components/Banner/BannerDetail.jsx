import React, { PureComponent } from 'react';

// Component(s)
import BannerEdit from './BannerEdit';

/**
 * @class BannerDetail
 */
export default class BannerDetail extends PureComponent {
  render() {
    return <BannerEdit {...this.props} noEdit={true} />
  }
}

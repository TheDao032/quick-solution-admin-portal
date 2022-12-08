import React, { PureComponent } from 'react';

// Component(s)
import WebsiteCategoryEdit from './WebsiteCategoryEdit';

/**
 * @class WebsiteCategoryDetail
 */
export default class WebsiteCategoryDetail extends PureComponent {
  render() {
    return <WebsiteCategoryEdit {...this.props} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import MenuEdit from './MenuEdit';

/**
 * @class MenuDetail
 */
export default class MenuDetail extends PureComponent {
  render() {
    return <MenuEdit {...this.props} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import NewsStatusEdit from './NewsStatusEdit';

/**
 * @class NewsStatusDetail
 */
export default class NewsStatusDetail extends PureComponent {
  render() {
    return <NewsStatusEdit {...this.props} noEdit={true} />
  }
}

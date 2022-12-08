import React, { PureComponent } from 'react';

// Component(s)
import NewsEdit from './NewsEdit';

/**
 * @class NewsEditDetail
 */
export default class NewsDetail extends PureComponent {
  render() {
    return <NewsEdit {...this.props} noEdit={true} />
  }
}

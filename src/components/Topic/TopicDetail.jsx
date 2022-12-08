import React, { PureComponent } from 'react';

// Component(s)
import TopicEdit from './TopicEdit';

/**
 * @class BusinessTypeDetail
 */
export default class TopicDetail extends PureComponent {
  render() {
    return <TopicEdit {...this.props} noEdit={true} />
  }
}


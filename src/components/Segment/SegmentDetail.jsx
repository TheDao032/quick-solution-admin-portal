import React, { PureComponent } from 'react';

// Component(s)
import SegmentEdit from './SegmentEdit';

/**
 * @class SegmentDetail
 */
export default class SegmentDetail extends PureComponent {
  render() {
    return <SegmentEdit {...this.props} noEdit={true} />
  }
}

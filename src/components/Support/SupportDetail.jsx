import React, { PureComponent } from 'react';

// Component(s)
import SupportEdit from './SupportEdit';

/**
 * @class SupportDetail
 */
export default class SupportDetail extends PureComponent {
  render() {
    return <SupportEdit {...this.props} noEdit={true} />
  }
}

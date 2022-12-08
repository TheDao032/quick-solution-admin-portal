import React, { PureComponent } from 'react';

// Component(s)
import StaticContentEdit from './StaticContentEdit';

/**
 * @class StaticContentDetail
 */
export default class StaticContentDetail extends PureComponent {
  render() {
    return <StaticContentEdit {...this.props} noEdit={true} />
  }
}

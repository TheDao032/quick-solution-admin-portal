import React, { PureComponent } from 'react';

// Component(s)
import AreaEdit from './AreaEdit';

/**
 * @class AreaDetail
 */
export default class AreaDetail extends PureComponent {
  render() {
    return <AreaEdit {...this.props} noEdit={true} />
  }
}

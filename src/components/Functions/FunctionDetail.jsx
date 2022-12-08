import React, { PureComponent } from 'react';

// Component(s)
import FunctionEdit from './FunctionEdit';

/**
 * @class FunctionDetail
 */
export default class FunctionDetail extends PureComponent {
  render() {
    return <FunctionEdit {...this.props} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import FunctionGroupEdit from './FunctionGroupEdit';

/**
 * @class FunctionGroupDetail
 */
export default class FunctionGroupDetail extends PureComponent {
  render() {
    return <FunctionGroupEdit {...this.props} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import OutputTypeEdit from './OutputTypeEdit';

/**
 * @class OutputTypeDetail
 */
export default class OutputTypeDetail extends PureComponent {
  render() {
    return <OutputTypeEdit {...this.props} noEdit={true} />
  }
}

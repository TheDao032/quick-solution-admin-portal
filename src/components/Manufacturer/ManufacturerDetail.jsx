import React, { PureComponent } from 'react';

// Component(s)
import ManufacturerEdit from './ManufacturerEdit';

/**
 * @class ManufacturerDetail
 */
export default class ManufacturerDetail extends PureComponent {
  render() {
    return <ManufacturerEdit {...this.props} noEdit={true} />
  }
}

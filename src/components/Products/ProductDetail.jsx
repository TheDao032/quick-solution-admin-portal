import React, { PureComponent } from 'react';

// Component(s)
import ProductEdit from './ProductEdit';

/**
 * @class ProductDetail
 */
export default class ProductDetail extends PureComponent {
  render() {
    return <ProductEdit {...this.props} noEdit={true} />
  }
}

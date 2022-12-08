import React, { PureComponent } from 'react';

// Component(s)
import ProductAttributeEdit from './ProductAttributeEdit';

/**
 * @class ProductAttributeDetail
 */
export default class ProductAttributeDetail extends PureComponent {
  render() {
    let { props } = this;
    return <ProductAttributeEdit {...props} noEdit />
  }
}

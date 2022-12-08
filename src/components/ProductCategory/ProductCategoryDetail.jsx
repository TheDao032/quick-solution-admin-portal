import React, { PureComponent } from 'react';

// Component(s)
import ProductCategoryEdit from './ProductCategoryEdit';

/**
 * @class ProductCategoryDetail
 */
export default class ProductCategoryDetail extends PureComponent {
  render() {
    return <ProductCategoryEdit {...this.props} noEdit={true} />
  }
}

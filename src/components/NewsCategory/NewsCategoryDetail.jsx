import React, { PureComponent } from 'react';

// Component(s)
import NewsCategoryEdit from './NewsCategoryEdit';

/**
 * @class NewsCategoryDetail
 */
export default class NewsCategoryDetail extends PureComponent {
  render() {
    return <NewsCategoryEdit {...this.props} noEdit={true} />
  }
}

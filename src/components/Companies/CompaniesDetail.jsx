import React, { PureComponent } from 'react';

// Component(s)
import CompaniesAdd from './CompaniesAdd';

/**
 * @class CompaniesDetail
 */
export default class CompaniesDetail extends PureComponent {
  render() {
    return <CompaniesAdd {...this.props} noEdit={true} />
  }
}

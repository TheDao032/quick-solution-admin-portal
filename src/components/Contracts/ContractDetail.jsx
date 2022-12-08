import React, { PureComponent } from 'react';

// Component(s)
import ContractEdit from './ContractEdit';

/**
 * @class ContractDetail
 */
export default class ContractDetail extends PureComponent {
  render() {
    return <ContractEdit {...this.props} noEdit={true} />
  }
}

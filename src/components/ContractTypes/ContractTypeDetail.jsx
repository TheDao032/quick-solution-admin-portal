import React, { PureComponent } from 'react';

// Component(s)
import ContractTypeEdit from './ContractTypeEdit';

/**
 * @class ContractTypeDetail
 */
export default class ContractTypeDetail extends PureComponent {
  render() {
    return <ContractTypeEdit {...this.props} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import CandidateEdit from './CandidateEdit';

/**
 * @class CandidateDetail
 */
export default class CandidateDetail extends PureComponent {
  render() {
    return <CandidateEdit {...this.props} noEdit={true} />
  }
}


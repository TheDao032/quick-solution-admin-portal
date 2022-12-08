import React, { PureComponent } from 'react';

// Component(s)
import RecruitEdit from './RecruitEdit';

/**
 * @class BusinessDetail
 */
export default class RecruitDetail extends PureComponent {
  render() {
    return <RecruitEdit {...this.props} noEdit={true} />
  }
}


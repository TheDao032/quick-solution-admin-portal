import React, { Component } from 'react';

// Component(s)
import DepartmentEdit from './DepartMentEdit';

/**
 * @class BusinessDetail
 */
export default class DepartmentDetail extends Component {
  render() {
    return <DepartmentEdit {...this.props} noEdit={true} detail={true}/>
  }
}


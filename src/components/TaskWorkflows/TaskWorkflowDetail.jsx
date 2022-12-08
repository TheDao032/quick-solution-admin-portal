import React, { PureComponent } from 'react';

// Component(s)
import TaskWorkflowEdit from './TaskWorkflowEdit';

/**
 * @class TaskWorkflowDetail
 */
export default class TaskWorkflowDetail extends PureComponent {
  render() {
    let { props } = this;
    return <TaskWorkflowEdit {...props} noEdit />
  }
}

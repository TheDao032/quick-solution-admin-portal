import React, { PureComponent } from 'react';

// Component(s)
import TaskTypeEdit from './TaskTypeEdit';

/**
 * @class TaskTypeDetail
 */
export default class TaskTypeDetail extends PureComponent {
  render() {
    let { props } = this;
    return <TaskTypeEdit {...props} noEdit />
  }
}

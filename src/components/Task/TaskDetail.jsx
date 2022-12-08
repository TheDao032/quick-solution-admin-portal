import React, { PureComponent } from 'react';

// Component(s)
import TaskEdit from './TaskEdit';

/**
 * @class TaskDetail
 */
export default class TaskDetail extends PureComponent {
  render() {
    return <TaskEdit {...this.props} noEdit={true} />
  }
}

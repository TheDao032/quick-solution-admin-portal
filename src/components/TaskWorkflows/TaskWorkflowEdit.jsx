import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import TaskWorkflowAdd from './TaskWorkflowAdd';

// Model(s)
import TaskWorkflowModel from "../../models/TaskWorkflowModel";

/**
 * @class TaskWorkflowEdit
 */
export default class TaskWorkflowEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._taskWorkflowModel = new TaskWorkflowModel();

    // Init state
    this.state = {
      /** @var {TaskWorkflowEntity} */
      taskWorkflowEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let taskWorkflowEnt = await this._taskWorkflowModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      taskWorkflowEnt && this.setState({ taskWorkflowEnt });
    })();
    //.end
  }

  render() {
    let { taskWorkflowEnt } = this.state;

    // Ready?
    if (!taskWorkflowEnt) {
      return <Loading />;
    }

    return <TaskWorkflowAdd taskWorkflowEnt={taskWorkflowEnt} noEdit={this.props.noEdit} />
  }
}

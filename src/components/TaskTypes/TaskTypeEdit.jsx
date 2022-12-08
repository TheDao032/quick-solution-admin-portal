import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import TaskTypeAdd from './TaskTypeAdd';

// Model(s)
import TaskTypeModel from "../../models/TaskTypeModel";

/**
 * @class TaskTypeEdit
 */
export default class TaskTypeEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._taskTypeModel = new TaskTypeModel();

    // Init state
    this.state = {
      /** @var {TaskTypeEntity} */
      taskTypeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let taskTypeEnt = await this._taskTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      taskTypeEnt && this.setState({ taskTypeEnt });
    })();
    //.end
  }

  render() {
    let {
      taskTypeEnt,
    } = this.state;

    // Ready?
    if (!taskTypeEnt) {
      return <Loading />;
    }

    return <TaskTypeAdd taskTypeEnt={taskTypeEnt} {...this.props} />
  }
}

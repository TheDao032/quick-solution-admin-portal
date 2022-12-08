import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CustomerDataLeadCare from './CustomerDataLeadCare';

// Model(s)
import CustomerDataLeadModel from "../../models/CustomerDataLeadModel";
import TaskModel from "../../models/TaskModel";
import DataLeadsTaskModel from "../../models/DataLeadsTaskModel";

/**
 * @class CustomerDataLeadCareByTask
 */
export default class CustomerDataLeadCareByTask extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._taskModel = new TaskModel();
    this._dataLeadsTaskModel = new DataLeadsTaskModel();

    // Init state
    this.state = {
      /** @var {customerDataLeadEntity} */
      customerDataLeadEnt: null,
      /** @var {TaskEntity} */
      taskEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let { taskid: task_id, id: data_leads_id } = this.props.match.params;
      let all = [
        this._customerDataLeadModel.read(data_leads_id),
        this._taskModel.read(task_id),
        this._dataLeadsTaskModel.getNextPrevious({ task_id, data_leads_id })
          .then(data => {
            let { current } = data || {};
            if (!current) {
              throw new Error('current "DataLeadsTask" NOT FOUND!');
            }
            return data;
          })
      ];
      let data = await Promise.all(all)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      if (data) {
        let customerDataLeadEnt = data[0];
        let taskEnt = data[1];
        Object.assign(taskEnt, {
          _dataLeadsTask: data[2]
        });
        this.setState({ customerDataLeadEnt, taskEnt });
      }
    })();
    //.end
  }

  render() {
    let { customerDataLeadEnt, taskEnt } = this.state;
    // console.log(customerDataLeadEnt, taskEnt);

    // Ready?
    if (!(customerDataLeadEnt && taskEnt)) {
      return <Loading />;
    }

    return <CustomerDataLeadCare customerDataLeadEnt={customerDataLeadEnt} taskEnt={taskEnt} {...this.props} />
  }
}

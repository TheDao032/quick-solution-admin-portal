import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import TaskAdd from './TaskAdd';

// Model(s)
import TaskModel from "../../models/TaskModel";

/**
 * @class TaskEdit
 */
export default class TaskEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._TaskModel = new TaskModel();

    // Init state
    this.state = {
      /** @var {TaskEntity} */
      segmentEnt: null,
      /** @var {CustomerDatalead} */
      CustomerEnts: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let TaskEnt = await this._TaskModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;

      let CustomerEnts = {};
      if(!this.props.noEdit){
        let customerItems = await this._TaskModel.getDataLeads({ task_id: ID })
          .catch(() => {
            // setTimeout(() => window._$g.rdr('/404'));
          })
        ;
        console.log('customerItems',customerItems);
        if(customerItems){
          customerItems.items.map((item)=> {
            return CustomerEnts[item.data_leads_id] = Object.assign({},item,{
              full_name: item.full_name_customer,
              birthday: item.birth_day,
            });
          });
        }
      }
      
      TaskEnt && this.setState({ TaskEnt, CustomerEnts });
    })();
    //.end
  }

  render() {
    let {
      TaskEnt,
      CustomerEnts,
    } = this.state;

    // Ready?
    if (!TaskEnt) {
      return <Loading />;
    }
    console.log('TaskEnt',CustomerEnts);
    return <TaskAdd TaskEnt={TaskEnt} CustomerEnts={CustomerEnts}  {...this.props} />
  }
}

import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CustomerTypeAdd from './CustomerTypeAdd';

// Model(s)
import CustomerTypeModel from "../../models/CustomerTypeModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class SegmentEdit
 */
export default class CustomerTypeEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._customerTypeModel = new CustomerTypeModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      CustomerTypeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let CustomerTypeEnt = await this._customerTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      
      CustomerTypeEnt.color_text = CustomerTypeEnt.color;
      CustomerTypeEnt.note_color_text = CustomerTypeEnt.color_text;
      CustomerTypeEnt.customertype = (CustomerTypeEnt.is_member_type == 1) ? 1 : ((CustomerTypeEnt.is_sell == 1)? 2 : 0);
      CustomerTypeEnt && this.setState({ CustomerTypeEnt });
      console.log(CustomerTypeEnt)
    })();
    //.end
  }

  render() {
    let {
      CustomerTypeEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!CustomerTypeEnt) {
      return <Loading />;
    }
    return <CustomerTypeAdd CustomerTypeEnt={CustomerTypeEnt} noEdit={noEdit || (!userAuth._isAdministrator() && CustomerTypeEnt.is_system !== 0)} {...this.props}/>
    
  }
}

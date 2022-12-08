import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import AccountAdd from './AccountAdd';

// Model(s)
import AccountModel from "../../models/AccountModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class SegmentEdit
 */
export default class AccountEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._accountModel = new AccountModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      AccountEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let AccountEnt = await this._accountModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      
     // CustomerTypeEnt.color_text = CustomerTypeEnt.color;
     // CustomerTypeEnt.note_color_text = CustomerTypeEnt.color_text;
     // CustomerTypeEnt.customertype = (CustomerTypeEnt.is_member_type == 1) ? 1 : ((CustomerTypeEnt.is_sell == 1)? 2 : 0);
     AccountEnt && this.setState({ AccountEnt });
      console.log(AccountEnt)
    })();
    //.end
  }

  render() {
    let {
        AccountEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!AccountEnt) {
      return <Loading />;
    }
    return <AccountAdd AccountEnt={AccountEnt} noEdit={noEdit || (!userAuth._isAdministrator() && AccountEnt.is_system !== 0)} {...this.props}/>
    
  }
}

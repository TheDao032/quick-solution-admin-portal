import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import SetupServiceRegisterAdd from './SetupServiceRegisterAdd';

// Model(s)
import SetupServiceRegisterModel from "../../models/SetupServiceRegisterModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class SetupServiceRegisterEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._SetupServiceRegisterModel = new SetupServiceRegisterModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      SetupServiceRegisterEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let SetupServiceRegisterEnt = await this._SetupServiceRegisterModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      SetupServiceRegisterEnt && this.setState({ SetupServiceRegisterEnt });
    })();
    //.end
  }

  render() {
    let {
      SetupServiceRegisterEnt,
    } = this.state;
    
    // Ready?
    if (!SetupServiceRegisterEnt) {
      return <Loading />;
    }
    return <SetupServiceRegisterAdd SetupServiceRegisterEnt={SetupServiceRegisterEnt} {...this.props}  noEdit={true}/>    
  }
}

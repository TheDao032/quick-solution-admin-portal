import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import StatusDataLeadAdd from './StatusDataLeadAdd';

// Model(s)
import StatusDataLeadModel from "../../models/StatusDataLeadModel";

/**
 * @class SegmentEdit
 */
export default class StatusDataLeadEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._statusDataLeadModel = new StatusDataLeadModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      StatusDataLeadEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let StatusDataLeadEnt = await this._statusDataLeadModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      StatusDataLeadEnt && this.setState({ StatusDataLeadEnt });
    })();
    //.end
  }

  render() {
    let {
        StatusDataLeadEnt,
    } = this.state;

    // Ready?
    if (!StatusDataLeadEnt) {
      return <Loading />;
    }
    return <StatusDataLeadAdd StatusDataLeadEnt={StatusDataLeadEnt} {...this.props}/>
    
  }
}

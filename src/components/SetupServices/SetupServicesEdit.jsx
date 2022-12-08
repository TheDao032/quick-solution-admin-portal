import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import SetupServicesAdd from './SetupServicesAdd';

// Model(s)
import SetupServicesModel from "../../models/SetupServicesModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class SetupServicesEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._setupServicesModel = new SetupServicesModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      SetupServicesEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let SetupServicesEnt = await this._setupServicesModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
        ;
        SetupServicesEnt && this.setState({ SetupServicesEnt });
    })();
    //.end
  }

  render() {
    let {
      SetupServicesEnt,
    } = this.state;
    // Ready?
    if (!SetupServicesEnt) {
      return <Loading />;
    }
    console.log(this.state)
    return <SetupServicesAdd SetupServicesEnt={SetupServicesEnt} {...this.props} />
  }
}

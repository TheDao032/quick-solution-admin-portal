import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import SupportAdd from './SupportAdd';

// Model(s)
import SupportModel from "../../models/SupportModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class CustomerTypeEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._supportModel = new SupportModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      SupportEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let SupportEnt = await this._supportModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      SupportEnt && this.setState({ SupportEnt });
    })();
    //.end
  }

  render() {
    let {
      SupportEnt,
    } = this.state;
    
    // Ready?
    if (!SupportEnt) {
      return <Loading />;
    }
    return <SupportAdd SupportEnt={SupportEnt} {...this.props}  noEdit={true}/>    
  }
}

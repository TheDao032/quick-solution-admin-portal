import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CandidateAdd from './CandidateAdd';

// Model(s)
import CandidateModel from "../../models/CandidateModel";

/**
 * @class SegmentEdit
 */
export default class CandidateEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._CandidateModel = new CandidateModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      CandidateEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let CandidateEnt = await this._CandidateModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      CandidateEnt && this.setState({ CandidateEnt });
    })();
    //.end
  }

  render() {
    let {
      CandidateEnt,
    } = this.state;

    // Ready?
    if (!CandidateEnt) {
      return <Loading />;
    }
    return <CandidateAdd CandidateEnt={CandidateEnt} {...this.props}/>
    
  }
}

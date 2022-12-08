import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import RecruitAdd from './RecruitAdd';

// Model(s)
import RecruitModel from "../../models/RecruitModel";

/**
 * @class SegmentEdit
 */
export default class RecruitEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._RecruitModel = new RecruitModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      RecruitEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let RecruitEnt = await this._RecruitModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      RecruitEnt && this.setState({ RecruitEnt });
    })();
    //.end
  }

  render() {
    let {
        RecruitEnt,
    } = this.state;

    // Ready?
    if (!RecruitEnt) {
      return <Loading />;
    }
    return <RecruitAdd RecruitEnt={RecruitEnt} {...this.props}/>
    
  }
}

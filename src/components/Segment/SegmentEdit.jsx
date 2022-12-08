import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import SegmentAdd from './SegmentAdd';

// Model(s)
import SegmentModel from "../../models/SegmentModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class SegmentEdit
 */
export default class SegmentEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._SegmentModel = new SegmentModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      segmentEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let SegmentEnt = await this._SegmentModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      SegmentEnt && this.setState({ SegmentEnt });
    })();
    //.end
  }

  render() {
    let {
      SegmentEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!SegmentEnt) {
      return <Loading />;
    }
    return <SegmentAdd SegmentEnt={SegmentEnt} noEdit={noEdit || (!userAuth._isAdministrator() && SegmentEnt.is_system !== 0)} {...this.props} />
  }
}

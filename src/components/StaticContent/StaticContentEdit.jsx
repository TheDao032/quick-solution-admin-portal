import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import StaticContentAdd from './StaticContentAdd';

// Model(s)
import StaticContentModel from "../../models/StaticContentModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class StaticContentEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._StaticContentModel = new StaticContentModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      StaticContentEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let StaticContentEnt = await this._StaticContentModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
        ;
      StaticContentEnt && this.setState({ StaticContentEnt });
    })();
    //.end
  }

  render() {
    let {
      StaticContentEnt,
    } = this.state;
    // Ready?
    if (!StaticContentEnt) {
      return <Loading />;
    }
    return <StaticContentAdd StaticContentEnt={StaticContentEnt} {...this.props} />
  }
}

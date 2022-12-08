import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import BannerAdd from './BannerAdd';

// Model(s)
import BannerModel from "../../models/BannerModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class BannerEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._BannerModel = new BannerModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      BannerEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let BannerEnt = await this._BannerModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      BannerEnt && this.setState({ BannerEnt });
    })();
    //.end
  }

  render() {
    let {
      BannerEnt,
    } = this.state;

    // Ready?
    if (!BannerEnt) {
      return <Loading />;
    }
    return <BannerAdd BannerEnt={BannerEnt} {...this.props}/>    
  }
}

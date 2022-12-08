import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import BannerTypeAdd from './BannerTypeAdd';

// Model(s)
import BannerTypeModel from "../../models/BannerTypeModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class CustomerTypeEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._bannerTypeModel = new BannerTypeModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      BannerTypeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let BannerTypeEnt = await this._bannerTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      BannerTypeEnt && this.setState({ BannerTypeEnt });
    })();
    //.end
  }

  render() {
    let {
      BannerTypeEnt,
    } = this.state;
    // Ready?
    if (!BannerTypeEnt) {
      return <Loading />;
    }
    return <BannerTypeAdd BannerTypeEnt={BannerTypeEnt} {...this.props}/>    
  }
}

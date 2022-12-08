import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import WebsiteCategoryAdd from './WebsiteCategoryAdd';

// Model(s)
import WebsiteCategoryModel from "../../models/WebsiteCategoryModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class WebsiteCategoryEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._WebsiteCategoryModel = new WebsiteCategoryModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      WebsiteCategoryEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let WebsiteCategoryEnt = await this._WebsiteCategoryModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      WebsiteCategoryEnt && this.setState({ WebsiteCategoryEnt });
    })();
    //.end
  }

  render() {
    let {
      WebsiteCategoryEnt,
    } = this.state;
    
    // Ready?
    if (!WebsiteCategoryEnt) {
      return <Loading />;
    }
    return <WebsiteCategoryAdd WebsiteCategoryEnt={WebsiteCategoryEnt} {...this.props}/>    
  }
}

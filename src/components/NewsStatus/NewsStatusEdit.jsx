import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import NewsStatusAdd from './NewsStatusAdd';

// Model(s)
import NewsStatusModel from "../../models/NewsStatusModel";

/** @var {Object} */

/**
 * @class SegmentEdit
 */
export default class NewsStatusEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._newsStatusModel = new NewsStatusModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      NewsStatusEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let NewsStatusEnt = await this._newsStatusModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
        ;
      NewsStatusEnt && this.setState({ NewsStatusEnt });
    })();
    //.end
  }

  render() {
    let {
      NewsStatusEnt,
    } = this.state;

    // Ready?
    if (!NewsStatusEnt) {
      return <Loading />;
    }
    return <NewsStatusAdd NewsStatusEnt={NewsStatusEnt} {...this.props} />
  }
}

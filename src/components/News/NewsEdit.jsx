import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import NewsAdd from './NewsAdd';

// Model(s)
import NewsModel from "../../models/NewsModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class SegmentEdit
 */
export default class NewsEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._newsModel = new NewsModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      NewsEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let NewsEnt = await this._newsModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      
      NewsEnt && this.setState({ NewsEnt }); 
    })();
    //.end
  }

  render() {
    let {
        NewsEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!NewsEnt) {
      return <Loading />;
    }
    //return <NewsAdd NewsEnt={NewsEnt} noEdit={noEdit || (!userAuth._isAdministrator() && NewsEnt.is_system !== 0)} {...this.props}/>
    return <NewsAdd NewsEnt={NewsEnt} noEdit={false} {...this.props}/>
  }
}

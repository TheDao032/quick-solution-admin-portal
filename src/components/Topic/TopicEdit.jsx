import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import TopicAdd from './TopicAdd';

// Model(s)
import TopicModel from "../../models/TopicModel";

/**
 * @class SegmentEdit
 */
export default class TopicEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._topicModel = new TopicModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      TopicEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let TopicEnt = await this._topicModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      console.log(TopicEnt)
      TopicEnt && this.setState({ TopicEnt });
    })();
    //.end
  }

  render() {
    let {
        TopicEnt,
    } = this.state;
console.log(TopicEnt)
    // Ready?
    if (!TopicEnt) {
      return <Loading />;
    }
    return <TopicAdd TopicEnt={TopicEnt} {...this.props}/>
    
  }
}

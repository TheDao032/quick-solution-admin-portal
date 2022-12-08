import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import NewsCategoryAdd from './NewsCategoryAdd';

// Model(s)
import NewsCategoryModel from "../../models/NewsCategoryModel";

/**
 * @class SegmentEdit
 */
export default class NewsCategoryEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._newsCategoryModel = new NewsCategoryModel();

    // Init state
    this.state = {
      /** @var {SegmentEntity} */
      NewsCategoryEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let NewsCategoryEnt = await this._newsCategoryModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
        ;
      NewsCategoryEnt && this.setState({ NewsCategoryEnt });
    })();
    //.end
  }

  render() {
    let {
      NewsCategoryEnt,
    } = this.state;
    // Ready?
    if (!NewsCategoryEnt) {
      return <Loading />;
    }
    return <NewsCategoryAdd NewsCategoryEnt={NewsCategoryEnt}{...this.props} />
  }
}

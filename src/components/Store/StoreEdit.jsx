import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import StoreAdd from './StoreAdd';

// Model(s)
import StoreModel from "../../models/StoreModel";

/**
 * @class StoreEdit
 */
export default class StoreEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._StoreModel = new StoreModel();

    // Init state
    this.state = {
      /** @var {StoreEntity} */
      segmentEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let StoreEnt = await this._StoreModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      StoreEnt && this.setState({ StoreEnt });
    })();
    //.end
  }

  render() {
    let {
      StoreEnt,
    } = this.state;

    // Ready?
    if (!StoreEnt) {
      return <Loading />;
    }
    return <StoreAdd StoreEnt={StoreEnt} {...this.props} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import AreaAdd from './AreaAdd';

// Model(s)
import AreaModel from "../../models/AreaModel";

/**
 * @class areaEdit
 */
export default class areaEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._areaModel = new AreaModel();

    // Init state
    this.state = {
      /** @var {areaEntity} */
      areaEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let areaEnt = await this._areaModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      areaEnt && this.setState({ areaEnt });
    })();
    //.end
  }

  render() {
    let {
      areaEnt,
    } = this.state;

    // Ready?
    if (!areaEnt) {
      return <Loading />;
    }

    return <AreaAdd areaEnt={areaEnt} {...this.props} />
  }
}

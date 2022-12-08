import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import ManufacturerAdd from './ManufacturerAdd';

// Model(s)
import ManufacturerModel from "../../models/ManufacturerModel";

/**
 * @class ManufacturerEdit
 */
export default class ManufacturerEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._manufacturerModel = new ManufacturerModel();

    // Init state
    this.state = {
      /** @var {ManufacturerEntity} */
      ManufacturerEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let ManufacturerEnt = await this._manufacturerModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      ManufacturerEnt && this.setState({ ManufacturerEnt });
    })();
    //.end
  }

  render() {
    let {
      ManufacturerEnt,
    } = this.state;

    // Ready?
    if (!ManufacturerEnt) {
      return <Loading />;
    }

    return <ManufacturerAdd manufacturerEnt={ManufacturerEnt} {...this.props} />
  }
}

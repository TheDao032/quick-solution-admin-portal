import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import OutputTypeAdd from './OutputTypeAdd';

// Model(s)
import OutputTypeModel from "../../models/OutputTypeModel";

/**
 * @class OutputTypeEdit
 */
export default class OutputTypeEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._outputTypeModel = new OutputTypeModel();

    // Init state
    this.state = {
      /** @var {OutputTypeEntity} */
      OutputTypeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let OutputTypeEnt = await this._outputTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      OutputTypeEnt && this.setState({ OutputTypeEnt });
    })();
    //.end
  }

  render() {
    let {
      OutputTypeEnt,
    } = this.state;

    // Ready?
    if (!OutputTypeEnt) {
      return <Loading />;
    }

    return <OutputTypeAdd outputTypeEnt={OutputTypeEnt} {...this.props} />
  }
}

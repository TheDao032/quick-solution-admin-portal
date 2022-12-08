import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import ContractAdd from './ContractAdd';

// Model(s)
import ContractModel from "../../models/ContractModel";

/**
 * @class ContractEdit
 */
export default class ContractEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._contractModel = new ContractModel();

    // Init state
    this.state = {
      /** @var {ContractEntity} */
      contractEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let contractEnt = await this._contractModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      contractEnt && this.setState({ contractEnt });
    })();
    //.end
  }

  render() {
    let {
      contractEnt,
    } = this.state;

    // Ready?
    if (!contractEnt) {
      return <Loading />;
    }
    return <ContractAdd {...this.props} contractEnt={contractEnt} />
  }
}

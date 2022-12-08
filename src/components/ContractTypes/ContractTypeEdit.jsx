import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import ContractTypeAdd from './ContractTypeAdd';

// Model(s)
import ContractTypeModel from "../../models/ContractTypeModel";

/**
 * @class ContractTypeEdit
 */
export default class ContractTypeEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._contractTypeModel = new ContractTypeModel();

    // Init state
    this.state = {
      /** @var {ContractTypeEntity} */
      contractTypeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let contractTypeEnt = await this._contractTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      contractTypeEnt && this.setState({ contractTypeEnt });
    })();
    //.end
  }

  render() {
    let {
      contractTypeEnt,
    } = this.state;

    // Ready?
    if (!contractTypeEnt) {
      return <Loading />;
    }
    return <ContractTypeAdd {...this.props} contractTypeEnt={contractTypeEnt} />
  }
}

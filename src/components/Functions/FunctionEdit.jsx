import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import FunctionAdd from './FunctionAdd';

// Model(s)
import FunctionModel from "../../models/FunctionModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class FunctionEdit
 */
export default class FunctionEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._functionModel = new FunctionModel();

    // Init state
    this.state = {
      /** @var {FunctionEntity} */
      functionEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let functionEnt = await this._functionModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      functionEnt && this.setState({ functionEnt });
    })();
    //.end
  }

  render() {
    let {
      functionEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!functionEnt) {
      return <Loading />;
    }

    return <FunctionAdd functionEnt={functionEnt} noEdit={noEdit || (!userAuth._isAdministrator() && functionEnt.is_system !== 0)} {...this.props} />
  }
}

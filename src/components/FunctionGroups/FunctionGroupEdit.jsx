import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import FunctionGroupAdd from './FunctionGroupAdd';

// Model(s)
import FunctionGroupModel from "../../models/FunctionGroupModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class FunctionGroupEdit
 */
export default class FunctionGroupEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._functionGroupModel = new FunctionGroupModel();

    // Init state
    this.state = {
      /** @var {FunctionGroupEntity} */
      funcGroupEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let funcGroupEnt = await this._functionGroupModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      funcGroupEnt && this.setState({ funcGroupEnt });
    })();
    //.end
  }

  render() {
    let {
      funcGroupEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!funcGroupEnt) {
      return <Loading />;
    }

    return <FunctionGroupAdd funcGroupEnt={funcGroupEnt} noEdit={noEdit || (!userAuth._isAdministrator() && funcGroupEnt.is_system !== 0)} {...this.props} />
  }
}

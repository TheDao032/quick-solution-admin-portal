import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import MenuAdd from './MenuAdd';

// Model(s)
import MenuModel from "../../models/MenuModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class MenuEdit
 */
export default class MenuEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._menuModel = new MenuModel();

    // Init state
    this.state = {
      /** @var {MenuEntity} */
      menuEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let menuEnt = await this._menuModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      menuEnt && this.setState({ menuEnt });
    })();
    //.end
  }

  render() {
    let {
      menuEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!menuEnt) {
      return <Loading />;
    }

    return <MenuAdd menuEnt={menuEnt} noEdit={noEdit || (!userAuth._isAdministrator() && menuEnt.is_system !== 0)} {...this.props} />
  }
}

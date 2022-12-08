import React, { Component } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import UserGroupsAdd from './UserGroupsAdd';

// Model(s)
import UserGroupModel from "../../models/UserGroupModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class BusinessEdit
 */
export default class UserGroupsEdit extends Component {
  constructor(props) {
    super(props);

    // Init model(s)
    this._userGroupModel = new UserGroupModel();

    // Init state
    this.state = {
      /** @var {UserGroupEntity} */
      UserGroupEnti: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let UserGroupEnti = await this._userGroupModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      UserGroupEnti && this.setState({ UserGroupEnti });
    })();
    //.end
  }

  render() {
    let {
      UserGroupEnti,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!UserGroupEnti) {
      return <Loading />;
    }
    return <UserGroupsAdd UserGroupEnti={UserGroupEnti} noEdit={noEdit || (!userAuth._isAdministrator() && UserGroupEnti.is_system !== 0)} {...this.props} />
  }
}

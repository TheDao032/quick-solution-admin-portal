import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import UserAdd from './UserAdd';

// Model(s)
import UserModel from "../../models/UserModel";

/**
 * @class UserEdit
 */
export default class UserEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._userModel = new UserModel();

    // Init state
    this.state = {
      /** @var {UserEntity} */
      userEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let userEnt = await this._userModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      userEnt && this.setState({ userEnt });
    })();
    //.end
  }

  render() {
    let {
      userEnt,
    } = this.state;

    // Ready?
    if (!userEnt) {
      return <Loading />;
    }

    return <UserAdd userEnt={userEnt} {...this.props} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import TimekeepingUserAdd from './TimekeepingUserAdd';

// Model(s)
import TimekeepingUserModel from "../../models/TimekeepingUserModel";

/**
 * @class TimekeepingUserEdit
 */
export default class TimekeepingUserEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._timekeepingUserModel = new TimekeepingUserModel();

    // Init state
    this.state = {
      /** @var {TimekeepingUserEntity} */
      timekeepingUserEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let timekeepingUserEnt = await this._timekeepingUserModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      timekeepingUserEnt && this.setState({ timekeepingUserEnt });
    })();
    //.end
  }

  render() {
    let {
      timekeepingUserEnt,
    } = this.state;

    // Ready?
    if (!timekeepingUserEnt) {
      return <Loading />;
    }
    return <TimekeepingUserAdd {...this.props} timekeepingUserEnt={timekeepingUserEnt} />
  }
}

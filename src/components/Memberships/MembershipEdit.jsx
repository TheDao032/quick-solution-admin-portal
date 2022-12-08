import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import MembershipAdd from './MembershipAdd';

// Model(s)
import MembershipModel from "../../models/MembershipModel";

/**
 * @class MembershipEdit
 */
export default class MembershipEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._membershipModel = new MembershipModel();

    // Init state
    this.state = {
      /** @var {MembershipEntity} */
      membershipEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let membershipEnt = await this._membershipModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      membershipEnt && this.setState({ membershipEnt });
    })();
    //.end
  }

  render() {
    let {
      membershipEnt,
    } = this.state;

    // Ready?
    if (!membershipEnt) {
      return <Loading />;
    }
    return <MembershipAdd {...this.props} membershipEnt={membershipEnt} />
  }
}

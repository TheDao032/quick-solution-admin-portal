import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import PromotionAdd from './PromotionAdd';

// Model(s)
import PromotionModel from "../../models/PromotionModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class PromotionEdit
 */
export default class PromotionEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._promotionModel = new PromotionModel();

    // Init state
    this.state = {
      /** @var {PromotionEntity} */
      promotionEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let promotionEnt = await this._promotionModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      promotionEnt && this.setState({ promotionEnt });
    })();
    //.end
  }

  render() {
    let {
      promotionEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!promotionEnt) {
      return <Loading />;
    }

    return <PromotionAdd promotionEnt={promotionEnt} noEdit={noEdit || (!userAuth._isAdministrator() && promotionEnt.is_system !== 0)} {...this.props} />
  }
}

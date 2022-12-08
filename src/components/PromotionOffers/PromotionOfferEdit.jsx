import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import PromotionOfferAdd from './PromotionOfferAdd';

// Model(s)
import PromotionOfferModel from "../../models/PromotionOfferModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class PromotionOfferEdit
 */
export default class PromotionOfferEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._promotionOfferModel = new PromotionOfferModel();

    // Init state
    this.state = {
      /** @var {PromotionOfferEntity} */
      promotionOfferEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let promotionOfferEnt = await this._promotionOfferModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      promotionOfferEnt && this.setState({ promotionOfferEnt });
    })();
    //.end
  }

  render() {
    let {
      promotionOfferEnt,
    } = this.state;
    let {
      noEdit,
    } = this.props;

    // Ready?
    if (!promotionOfferEnt) {
      return <Loading />;
    }

    return <PromotionOfferAdd promotionOfferEnt={promotionOfferEnt} noEdit={noEdit || (!userAuth._isAdministrator() && promotionOfferEnt.is_system !== 0)} {...this.props} />
  }
}

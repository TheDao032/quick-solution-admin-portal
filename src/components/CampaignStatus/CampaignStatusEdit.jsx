import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CampaignStatusAdd from './CampaignStatusAdd';

// Model(s)
import CampaignStatusModel from "../../models/CampaignStatusModel";

/**
 * @class campaignStatusEdit
 */
export default class campaignStatusEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._campaignStatusModel = new CampaignStatusModel();

    // Init state
    this.state = {
      /** @var {campaignStatusEntity} */
      campaignStatusEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let campaignStatusEnt = await this._campaignStatusModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      campaignStatusEnt && this.setState({ campaignStatusEnt });
    })();
    //.end
  }

  render() {
    let {
      campaignStatusEnt,
    } = this.state;

    // Ready?
    if (!campaignStatusEnt) {
      return <Loading />;
    }

    return <CampaignStatusAdd campaignStatusEnt={campaignStatusEnt} {...this.props} />
  }
}

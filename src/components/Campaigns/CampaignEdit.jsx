import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CampaignAdd from './CampaignAdd';

// Model(s)
import CampaignModel from "../../models/CampaignModel";

/**
 * @class CampaignEdit
 */
export default class CampaignEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._campaignModel = new CampaignModel();

    // Init state
    this.state = {
      /** @var {CampaignEntity} */
      campaignEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let campaignEnt = await this._campaignModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      campaignEnt && this.setState({ campaignEnt });
    })();
    //.end
  }

  render() {
    let {
      campaignEnt,
    } = this.state;

    // Ready?
    if (!campaignEnt) {
      return <Loading />;
    }
    return <CampaignAdd {...this.props} campaignEnt={campaignEnt} />
  }
}

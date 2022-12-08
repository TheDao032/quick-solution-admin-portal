import React, { PureComponent } from 'react';

// Component(s)
import Loading from '../Common/Loading';
import CampaignTypeAdd from './CampaignTypeAdd';

// Model(s)
import CampaignTypeModel from "../../models/CampaignTypeModel";

/**
 * @class CampaignTypeEdit
 */
export default class CampaignTypeEdit extends PureComponent {
  constructor(props) {
    super(props);

    // Init model(s)
    this._campaignTypeModel = new CampaignTypeModel();

    // Init state
    this.state = {
      /** @var {CampaignTypeEntity} */
      campaignTypeEnt: null
    };
  }

  componentDidMount() {
    // Fetch record data
    (async () => {
      let ID = this.props.match.params.id;
      let campaignTypeEnt = await this._campaignTypeModel.read(ID)
        .catch(() => {
          setTimeout(() => window._$g.rdr('/404'));
        })
      ;
      campaignTypeEnt && this.setState({ campaignTypeEnt });
    })();
    //.end
  }

  render() {
    let {
      campaignTypeEnt,
    } = this.state;

    // Ready?
    if (!campaignTypeEnt) {
      return <Loading />;
    }

    return <CampaignTypeAdd campaignTypeEnt={campaignTypeEnt} {...this.props} />
  }
}

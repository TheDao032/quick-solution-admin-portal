import React, { PureComponent } from 'react';

// Component(s)
import CampaignStatusEdit from './CampaignStatusEdit';

/**
 * @class CampaignStatusDetail
 */
export default class CampaignStatusDetail extends PureComponent {
  render() {
    return <CampaignStatusEdit {...this.props} noEdit={true} />
  }
}

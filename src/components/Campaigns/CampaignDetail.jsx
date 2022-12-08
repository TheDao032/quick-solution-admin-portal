import React, { PureComponent } from 'react';

// Component(s)
import CampaignEdit from './CampaignEdit';

/**
 * @class CampaignDetail
 */
export default class CampaignDetail extends PureComponent {
  render() {
    return <CampaignEdit {...this.props} noEdit={true} />
  }
}

import React, { PureComponent } from 'react';

// Component(s)
import CampaignTypeEdit from './CampaignTypeEdit';

/**
 * @class CampaignTypeDetail
 */
export default class CampaignTypeDetail extends PureComponent {
  render() {
    return <CampaignTypeEdit {...this.props} noEdit={true} />
  }
}

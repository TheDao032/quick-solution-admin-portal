//
import Entity from '../Entity';

// Utils
// import * as utils from '../../utils';

/**
 * @class CampaignEntity
 */
export default class CampaignEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'campaign_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      campaign_name: "",
      /** @var {Number|String} */
      campaign_type_id: "",
      /** @var {Number|String} */
      parent_id: "",
      /** @var {Number|String} */
      campaign_status_id: "",
      /** @var {Number|String} */
      company_id: "",
      /** @var {Number|String} */
      business_id: "",
      /** @var {String} */
      start_date: "",
      /** @var {String} */
      end_date: "",
      /** @var {Number|String} */
      total_values: "0",
      /** @var {String} */
      description: "",
      /** @var {String} */
      reason: "",
      /** @var {Number|String} */
      is_active: 1,
      /** @var {Array} */
      campaign_review_list: []
    }, data);
  }
}
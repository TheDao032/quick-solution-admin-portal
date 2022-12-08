//
import Entity from '../Entity';

// Utils
// import * as utils from '../../utils';

/**
 * @class CampaignReviewLevelEntity
 */
export default class CampaignReviewLevelEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'campaign_review_level_id';

  /**
   * 
   * @param {object} data 
   */
  // constructor(data) { super(data); }

  /** @var {String} */
  campaign_review_level_name = "";

  /** @var {Number|String} */
  review_order_index = 0;

  /** @var {String} */
  description = "";

  /** @var {Number|String} */
  is_complete_review = 0;

  /** @var {Number|String} */
  company_id = "";

  /** @var {Number|String} */
  department_id = "";

  /** @var {Array} */
  user_name = [];
}
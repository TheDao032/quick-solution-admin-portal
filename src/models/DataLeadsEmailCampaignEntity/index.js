//
import Entity from '../Entity';

/**
 * @class DataLeadsEmailCampaignEntity
 */
export default class DataLeadsEmailCampaignEntity extends Entity
{
  /** @var {String} Primary Key */
  // primaryKey = 'comment_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      id: "",
      /** @var {String} */
      name: "",
      /** @var {String} */
      sender_id: "",
      /** @var {String} */
      sender_name: "",
      /** @var {String} */
      sender_email: "",
      /** @var {String} */
      status: "",
      /** @var {Array} */
      list: [
        // {
        //   /** @var {String} */
        //   "id": "-b3b9-4f9f-93d6-01269e6294de",
        //   /** @var {String} */
        //   "name": ""
        // }
      ],
    }, data);
  }
}
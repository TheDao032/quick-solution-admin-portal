//
import Entity from '../Entity';

/**
 * @class DataLeadsEmailEntity
 */
export default class DataLeadsEmailEntity extends Entity
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
      campaign_id: "",
      /** @var {String} */
      campaign_name: "",
      /** @var {String} */
      sender_id: "",
      /** @var {String} */
      sender_name: "",
      /** @var {String} */
      sender_email: "",
      /** @var {String} */
      status: "",
      /** @var {String} */
      list_id: "",
      /** @var {String} */
      list_name: "",
      /** @var {Array} */
      task_data_leads: [
        // {
        //   /** @var {String} */
        //   "data_leads_id": "",
        //   /** @var {String} */
        //   "task_id": "",
        // }
      ],
    }, data);
  }
}
//
import Entity from '../Entity';

/**
 * @class DataLeadsMeetingEntity
 */
export default class DataLeadsMeetingEntity extends Entity
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
      data_leads_id: "",
      /** @var {String} */
      task_id: "",
      /** @var {String} */
      responsible_user_name: "",
      /** @var {String} */
      meeting_subject: "",
      /** @var {String} */
      event_start_date_time: "",
      /** @var {String} */
      event_end_date_time: "",
      /** @var {String} */
      content_meeting: "",
      /** @var {String} */
      location: "",
    }, data);
  }
}
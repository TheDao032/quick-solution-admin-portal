//
import Entity from '../Entity';

/**
 * @class DataLeadsCallEntity
 */
export default class DataLeadsCallEntity extends Entity
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
      call_type_id: "",
      /** @var {String} */
      event_start_date_time: "",
      /** @var {String} */
      event_end_date_time: "",
      /** @var {String} */
      duration: "",
      /** @var {String} */
      subject: "",
      /** @var {String} */
      description: "",
    }, data);
  }

  /** @var {Number|String} */
  static CALL_TYPE_1 = 1;

  /** @var {Number|String} */
  static CALL_TYPE_2 = 2;

  /**
   * @return {Array}
   */
  static getCallTypesIdOpts() {
    return [
      { name: "Cá nhân", id: _static.CALL_TYPE_1 },
      { name: "Tổng đài", id: _static.CALL_TYPE_2 },
    ];
  }
}
// Make alias
const _static = DataLeadsCallEntity;

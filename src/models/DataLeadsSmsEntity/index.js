//
import Entity from '../Entity';

/**
 * @class DataLeadsSmsEntity
 */
export default class DataLeadsSmsEntity extends Entity
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
      content_sms: "",
    }, data);
  }
}
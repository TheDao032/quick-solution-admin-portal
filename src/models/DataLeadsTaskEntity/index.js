//
import Entity from '../Entity';

/**
 * @class DataLeadsTaskEntity
 */
export default class DataLeadsTaskEntity extends Entity
{
  /** @var {String} Primary Key */
  // primaryKey = 'task_data_leads_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
    }, data);
  }
}

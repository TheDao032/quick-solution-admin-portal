//
import Entity from '../Entity';

/**
 * @class DataLeadsHistoryEntity
 */
export default class DataLeadsHistoryEntity extends Entity
{
  /** @var {String} Primary Key */
  // primaryKey = 'history_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {}, data);
  }
}
import Entity from '../Entity';

/**
 * @class SupportEntity
 */
export default class SupportEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'support_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, { }, data);
  }
}
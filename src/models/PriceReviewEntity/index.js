//
import Entity from '../Entity';

/**
 * @class PriceEntity
 */
export default class PriceEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'price_id';

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
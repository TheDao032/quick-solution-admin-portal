//
import Entity from '../Entity';

/**
 * @class ProductModelEntity
 */
export default class ProductModelEntity extends Entity
{
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'product_model_id';

  /**
   * 
   * @param {object} data 
   */
   constructor(data) {
    super(data);

    // Init
  }
}
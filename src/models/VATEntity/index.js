//
import Entity from '../Entity';

/**
 * @class VATEntity
 */
export default class VATEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'vat_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      name: "",
    }, data);
  }
}
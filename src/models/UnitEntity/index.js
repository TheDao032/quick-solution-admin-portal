//
import Entity from '../Entity';

/**
 * @class UnitEntity
 */
export default class UnitEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'unit_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      unit_name: "",
    }, data);
  }
}
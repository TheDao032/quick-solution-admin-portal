//
import Entity from '../Entity';

// Utils
// import * as utils from '../../utils';

/**
 * @class ShiftEntity
 */
export default class ShiftEntity extends Entity
{
  /** @var {String} Primary Key */
  static primaryKey = 'shift_id';

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
// Make alias
// const _static = ShiftEntity;
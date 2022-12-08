import Entity from '../Entity';

/**
 * @class SetupServiceRegisterEntity
 */
export default class SetupServiceRegisterEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'register_setup_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, { }, data);
  }
}
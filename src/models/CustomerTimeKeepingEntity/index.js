//
import Entity from '../Entity';

/**
 * @class CustomerTimeKeepingEntity
 */
export default class CustomerTimeKeepingEntity extends Entity
{
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'customer_timekeeping_id';

  /**QQ
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {

    }, data);
  }

  /**
   * 
   * @returns {String}
   */
  key()
  {
    let key = this.tel || Math.random().toString();
    return key;
  }

  /**
   * @TODO:
   * @returns {Boolean}
   */
  _isAdministrator()
  {
    let prop = 'isAdministrator';
    if (prop in this) {
      return !!this[prop];
    }
    return ('administrator' === this.user_name);
  }

  /**
   * @TODO:
   * @returns {Array}
   */
  getFunctions()
  {
    return this._functions || [];
  }
}
// Make alias
const _static = CustomerTimeKeepingEntity;
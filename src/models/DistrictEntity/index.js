//
import Entity from '../Entity';

/**
 * @class DistrictEntity
 */
export default class DistrictEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'district_id';

  /**
   * 
   * @param {object} data 
   */
  // constructor(data) { super(data); }

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
   * 
   * @returns {String}
   */
  __fullname()
  {
    return this.fullname || [
      this.first_name,
      this.last_name
    ].join(' ').trim();
  }
}
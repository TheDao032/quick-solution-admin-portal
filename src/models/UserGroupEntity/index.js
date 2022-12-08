//
import Entity from '../Entity';

/**
 * @class UserGroupEntity
 */
export default class UserGroupEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'user_group_id';

  /**
   * 
   * @param {object} data 
   */
  // constructor(data) { super(data); }
  /**
   * 
   * @returns {String}
   */
  __groupname()
  {
    return this.groupname.trim();
  }
  /**
   * 
   * @returns {String}
   */
  __description()
  {
    return this.description.trim();
  }
}
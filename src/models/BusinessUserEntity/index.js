//
import Entity from '../Entity';

/**
 * @class BusinessUserEntity
 */
export default class BusinessUserEntity extends Entity
{
  // /** @var {String} Primary Key */
  // primaryKey = 'business_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {Number|String} */
      business_id: "",
      /** @var {Number|String} */
      user_id: "",
      /** @var {String} */
      user_name: "",
      /** @var {String} */
      full_name: "",
      /** @var {String} */
      department_name: "",
      /** @var {String} */
      position_name:"",
      /** @var {Array} */
      user_list: [],
    }, data);
  }
}
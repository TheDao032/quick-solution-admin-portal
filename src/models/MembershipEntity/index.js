//
import Entity from '../Entity';

// Utils
// import * as utils from '../../utils';

/**
 * @class MembershipEntity
 */
export default class MembershipEntity extends Entity
{
  /** @var {String} Primary Key */
  static primaryKey = 'membership_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String|String} */
      member_id: "",
      /** @var {String} */
      customer_code: "",
      /** @var {String} */
      full_name: "",
      /** @var {Number|String} */
      gender: "",
      /** @var {String} */
      birth_day: "",
      /** @var {String} */
      phone_number: "",
      /** @var {Number|String} */
      is_active: "",
      /** @var {Number|String} */
      business_id: "0",
      /** @var {Number|String} */
      status_member_id: "",
    }, data);
  }

  /**
   * 
   * @param {Number|String} gender 
   * @return {String}
   */
  static genderTextStatic(gender) {
    let g = ('' + gender);
    return ('1' === g) ? 'Nam' : (('0' === g) ? 'Nữ' : '');
  }
}
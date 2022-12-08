//
import Entity from '../Entity';

/**
 * @class CustomerTypeEntity
 */
export default class CustomerTypeEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'customer_type_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      customer_type_name: "",
      /** @var {Number|String} */
      customer_type_group_id: "",
      /** @var {String} */
      customer_type_group_name: "",
      /** @var {String} */
      type: "",
      /** @var {String} */
      created_user: "",
      /** @var {String} */
      created_user_full_name: 1,
      /** @var {String} */
      created_date:"",
      /** @var {Number|String} */
      is_active: 1,
      /** @var {String} */
      color: '',
      /** @var {String} */
      color_text: '',
      /** @var {String} */
      note_color: '',
      /** @var {String} */
      note_color_text: '',
       /** @var {Number} */
       customertype: 0,
    }, data);
  }
}
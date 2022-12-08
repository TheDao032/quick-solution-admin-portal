//
import Entity from '../Entity';

/**
 * @class ProductAttributeEntity
 */
export default class ProductAttributeEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'product_attribute_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      attribute_name: "",
      /** @var {String} */
      attribute_description: "",
      /** @var {Number|String} */
      unit_id: "",
      /** @var {Number|String} */
      is_active: 1,
      /** @var {Array} */
      // task_work_follow_list: [],
      /** @var {Array} */
      attribute_values: [
        // {
        //   /** @var {String} */
        //   attribute_values: "",
        //   /** @var {String} */
        //   attribute_description: ""
        // }
      ],
    }, data);
  }
}
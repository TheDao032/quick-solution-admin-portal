//
import Entity from '../Entity';

/**
 * @class OutputTypeEntity
 */
export default class OutputTypeEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'output_type_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      output_type_name: "",
      /** @var {String} */
      is_vat: 0,
      /** @var {String} */
      vat_id: 0,
      /** @var {Number|String} */
      is_active: 1,
      /** @var {String} */
      company_id: "",
      /** @var {String} */
      area_id: "",
      /** @var {String} */
      product_categorie_ids: [],
      /** @var {String} */
      description: "",
      /** @var {Array} */
      price_review_lv_users: [],
      /** @var {String} */
      name: "",
    }, data);
  }
}
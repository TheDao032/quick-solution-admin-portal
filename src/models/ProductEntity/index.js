//
import Entity from '../Entity';

/**
 * @class ProductEntity
 */
export default class ProductEntity extends Entity
{
  /**
   * @var {String} Primary Key
   */
  static primaryKey = 'product_id';

  /**
   * 
   * @param {object} data 
   */
   constructor(data) {
    super(data);

    if ((1 * data.is_service) === 1) {
      Object.assign(this, {
        /** @var {Number|String} */
        product_category_id: "",
        /** @var {Number|String} */
        product_code: "",
        /** @var {Number|String} */
        product_name: "",
        /** @var {Number|String} */
        product_name_show_web: "",
        /** @var {Number|String} */
        note: "",
        /** @var {Number|String} */
        descriptions: "",
        /** @var {Number|String} */
        product_content_detail: "",
        /** @var {Number|String} */
        short_description: "",
        /** @var {Number|String} */
        is_show_web: 0,
        /** @var {Number|String} */
        is_service: 1,
        /** @var {Number|String} */
        is_active: 1,
        /** @var {Number|String} */
        product_imei: "",
        /** @var {Number|String} */
        manufacturer_id: "",
        /** @var {Number|String} */
        lot_number: "",
        /** @var {Number|String} */
        model_id: "",
        /** @var {Number|String} */
        origin_id: "",
        /** @var {Number|String} */
        businesses: [],
        /** @var {Number|String} */
        attribute_values: [],
        /** @var {Number|String} */
        pictures: [],
        /** @var {Number|String} */
        pt_level_id: "",
        /** @var {Number|String} */
        values_in: "",
        /** @var {Number|String} */
        is_amount_days: null,
        /** @var {Number|String} */
        is_session: null,
        /** @var {Number|String} */
        is_freeze: 0,
        /** @var {Number|String} */
        is_tranfer: 0,
        /** @var {Number|String} */
        is_sell_well: 0,
        /** @var {Number|String} */
        is_high_light: 0,
        /** @var {Number|String} */
        time_limit: "",
        /** @var {Number|String} */
        time_per_session: "",
        /** @var {Number|String} */
        is_product_off_peak: 0,
        /** @var {Number|String} */
        is_apply_mon: 0,
        /** @var {Number|String} */
        is_apply_tu: 0,
        /** @var {Number|String} */
        is_apply_we: 0,
        /** @var {Number|String} */
        is_apply_th: 0,
        /** @var {Number|String} */
        is_apply_fr: 0,
        /** @var {Number|String} */
        is_apply_sa: 0,
        /** @var {Number|String} */
        is_apply_sun: 0,
      }, data);
    } else {
      Object.assign(this, {
        /** @var {Number|String} */
        product_category_id: "",
        /** @var {Number|String} */
        product_code: "",
        /** @var {Number|String} */
        product_name: "",
        /** @var {Number|String} */
        product_name_show_web: "",
        /** @var {Number|String} */
        note: "",
        /** @var {Number|String} */
        descriptions: "",
        /** @var {Number|String} */
        product_content_detail: "",
        /** @var {Number|String} */
        short_description: "",
        /** @var {Number|String} */
        is_show_web: 0,
        /** @var {Number|String} */
        is_service: 0,
        /** @var {Number|String} */
        is_active: 1,
        /** @var {Number|String} */
        is_sell_well: 0,
        /** @var {Number|String} */
        is_high_light: 0,
        /** @var {Number|String} */
        product_imei: "",
        /** @var {Number|String} */
        manufacturer_id: "",
        /** @var {Number|String} */
        lot_number: "",
        /** @var {Number|String} */
        model_id: "",
        /** @var {Number|String} */
        origin_id: "",
        /** @var {Number|String} */
        businesses: [],
        /** @var {Number|String} */
        attribute_values: [],
        /** @var {Number|String} */
        pictures: [],
        /** @var {Number|String} */
        status_product_id: null,
      }, data);
    }
  }
}
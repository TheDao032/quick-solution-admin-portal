//
import Entity from '../Entity';

/**
 * @class PromotionOfferEntity
 */
export default class PromotionOfferEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'promotion_offer_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      "promotion_offer_name": "",
      /** @var {String|Number} */
      "business_id": "",
      /** @var {String|Number} */
      "order_index": 0,
      /** @var {String} */
      "condition_content": "",
      /** @var {String} */
      "description": "",
      /** @var {String|Number} */
      "is_percent_discount": 0,
      /** @var {String|Number} */
      "is_discount_by_set_price": 0,
      /** @var {String|Number} */
      "is_promotion_customer_type": 0,
      /** @var {String|Number} */
      "is_fixed_gift": 0,
      /** @var {String|Number} */
      "is_fix_price": 0,
      /** @var {String|Number} */
      "discountvalue": 0,
      /** @var {String|Number} */
      "is_system": 0,
      /** @var {String|Number} */
      "is_active": 1,
      /** @var {Array} */
      "list_offer_gifts": [
        /** @var {String|Number} */
        // "product_id": "1"
      ]
    }, data);
  }
}
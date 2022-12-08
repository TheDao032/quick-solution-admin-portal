//
import Entity from '../Entity';

/**
 * @class PriceEntity
 */
export default class PriceEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'price_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      price_name: "",
      /** @var {Number|String} */
      company_id: null,
      /** @var {Number|String} */
      is_active:1,
      /** @var {Number|String} */
      is_review:0,
      /** @var {Number|String} */
      is_output_for_web: 0,
      /** @var {Number|String} */
      start_date: null,
      /** @var {Number|String} */
      end_date: null,
      /** @var {Number|String} */
      notes: null,
      /** @var {String} */
      review_date: "",
      /** @var {Number|String} */
      is_review: null,
    }, data);
  }
}
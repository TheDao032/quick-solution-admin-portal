//
import Entity from '../Entity';

// Utils
import { cdnPath } from '../../utils/html';

/**
 * @class PromotionEntity
 */
export default class PromotionEntity extends Entity
{
  /** @var {String} */
  static defaultImgBase64 = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2264%22%20height%3D%2264%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_16caa47cdd6%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_16caa47cdd6%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2213.171875%22%20y%3D%2236.5%22%3E64x64%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  
  /** @var {String} Primary Key */
  static primaryKey = 'promotion_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      "promotion_name": "",
      /** @var {String} */
      "description": "",
      /** @var {String} */
      "short_description": "",
      /** @var {String} */
      "begin_date": "",
      /** @var {String} */
      "end_date": "",
      /** @var {String} */
      /** @var {String} */
      "is_apply_hours": 0,
      /** @var {String} */
      "start_hours": "",
      /** @var {String} */
      "end_hours": "",
      /** @var {Number} */
      "is_apply_mon": 0,
      /** @var {Number} */
      "is_apply_tu": 0,
      /** @var {Number} */
      "is_apply_we": 0,
      /** @var {Number} */
      "is_apply_th": 0,
      /** @var {Number} */
      "is_apply_fr": 0,
      /** @var {Number} */
      "is_apply_sa": 0,
      /** @var {Number} */
      "is_apply_sun": 0,
      /** @var {Number} */
      "is_promotion_by_price": 0,
      /** @var {Number} */
      "from_price": 0,
      /** @var {Number} */
      "to_price": 0,
      /** @var {Number} */
      "is_promotion_by_total_money": 0,
      /** @var {Number} */
      "min_promotion_total_money": 0,
      /** @var {Number} */
      "max_promotion_total_money": 0,
      /** @var {Number} */
      "is_promorion_by_total_quantity": 0,
      /** @var {Number} */
      "min_promotion_total_quantity": 0,
      /** @var {Number} */
      "max_promotion_total_quantity": 0,
      /** @var {Number} */
      "is_apply_with_order_promotion": 0,
      /** @var {Number} */
      "is_combo_promotion": 0,
      /** @var {Number} */
      "is_limit_promotion_times": 0,
      /** @var {Number} */
      "max_promotion_times": 0,
      /** @var {Number} */
      "is_reward_point": 0,
      /** @var {String} */
      // "create_date": "",
      /** @var {Number|String} */
      "is_active": 0,
      /** @var {Number|String} */
      "is_system": 0,
      /** @var {String} */
      "url_banner": "",
      /** @var {String} */
      "url_image_promotion": "",
      /** @var {Number|String} */
      "is_review": 1,
      /** @var {String} */
      "user_review": "",
      /** @var {String} */
      "review_date": "",
      /** @var {String} */
      "note_review": "",
      /** @var {Array} */
      "list_company": [
        //{
        //  /** @var {Number|String} */
        //  "company_id": "",
        //  /** @var {Number|String} */
        //  "promotion_id": ""
        //}
      ],
      /** @var {Array} */
      "list_apply_product": [
        //{
        //  /** @var {String} */
        //  "product_id":""
        //}
      ],
      /** @var {Array} */
      "list_offer_apply": [
        //{
        //  /** @var {Number|String} */
        //  "promotion_offer_id": ""
        //}
      ],
      /** @var {Number} */
      "is_promotion_customer_type": 0,
      /** @var {Array} */
      "list_customer_type": [
        //{
        //  /** @var {Number|String} */
        //  "business_id": "",
        //  /** @var {Number|String} */
        //  "customer_type_id": ""
        //}
      ]
    }, data);
  }

  /**
   * 
   * @returns {String}
   */
  promotionBanner()
  {
    return cdnPath(this.url_banner);
  }

  /**
   * 
   * @returns {String}
   */
  promotionIconUrl()
  {
    return cdnPath(this.url_image_promotion);
  }

  /**
   * @param {Number|null|undefined} value
   * @returns {String}
   */
  static _formatApproveValueStatic(value)
  {
    return '' + ((true === value) ? 1 : (false === value ? 0 : value));
  }

  /**
   * @param {Number|null|undefined} value
   * @returns {String}
   */
  static reviewTextStatic(value)
  {
    let valStr = _static._formatApproveValueStatic(value);
    return (('1' === valStr) ? 'Đã duyệt' : ('0' === valStr ? 'Không duyệt' : 'Chưa duyệt'));
  }

  /**
   * @param {Number|null|undefined} value
   * @returns {Boolean}
   */
  static isReviewedYesStatic(value)
  {
    let valStr = _static._formatApproveValueStatic(value);
    return ('1' === valStr);
  }

  /**
   * @param {Number|null|undefined} value
   * @returns {Boolean}
   */
  static isReviewedNoStatic(value)
  {
    let valStr = _static._formatApproveValueStatic(value);
    return ('0' === valStr);
  }

  /**
   * @param {Number|null|undefined} value
   * @returns {Boolean}
   */
  static isNotYetReviewedStatic(value)
  {
    let valStr = _static._formatApproveValueStatic(value);
    return ('1' !== valStr) && ('0' !== valStr);
  }
}
// Make alias
const _static = PromotionEntity;
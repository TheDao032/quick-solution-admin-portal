//
import Entity from '../Entity';

// Utils
// import * as utils from '../../utils';

/**
 * @class TimekeepingUserEntity
 */
export default class TimekeepingUserEntity extends Entity
{
  /** @var {String} Primary Key */
  static primaryKey = 'time_keeping_id';

  /** @return {String|Number} */
  static IS_RENEW_NO = '0';
  /** @return {String|Number} */
  static IS_RENEW_YES = '1';
  /** @return {String|Number} */
  static IS_RENEW_ALL = '2';
  /** @return {Array} */
  static genIsRenewOpts = () => {
    return [
      { label: "-- Chọn --", value: _static.IS_RENEW_ALL },
      { label: "Có", value: _static.IS_RENEW_YES },
      { label: "Không", value: _static.IS_RENEW_NO }
    ];
  };

  /** @return {String|Number} */
  static PAY_TYPE_0 = '0';
  /** @return {String|Number} */
  static PAY_TYPE_1 = '1';
  /** @return {String|Number} */
  static PAY_TYPE_2 = '2';
  /** @return {String|Number} */
  static PAY_TYPE_3 = '3';
  /** @return {Array} */
  static genPayTypeOpts = () => {
    return [
      { label: "-- Chọn --", value: _static.PAY_TYPE_3 },
      { label: "Thanh toán thiếu", value: _static.PAY_TYPE_0 },
      { label: "Thanh toán đủ", value: _static.PAY_TYPE_1 },
      { label: "Miễn phí", value: _static.PAY_TYPE_2 }
    ];
  };

  /** @return {String|Number} */
  static STATUS_0 = '0';
  /** @return {String|Number} */
  static STATUS_1 = '1';
  /** @return {String|Number} */
  static STATUS_2 = '2';
  /** @return {Array} */
  static genStatusOpts = () => {
    return [
      { label: "-- Chọn --", value: _static.STATUS_3 },
      { label: "Duyệt đồng ý", value: _static.STATUS_1 },
      { label: "Duyệt từ chối", value: _static.STATUS_0 },
      { label: "Chưa duyệt", value: _static.STATUS_2 }
    ];
  };

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
      timekeepingUser_type_id: "",
      /** @var {Number|String} */
      is_renew: "",
      /** @var {Number|String} */
      total_value: "",
      /** @var {Number|String} */
      total_month: "",
      /** @var {String} */
      active_date: "",
      /** @var {Number|String} */
      data_leads_id: "",
      /** @var {String} */
      note_healthy: "",
      /** @var {String} */
      purpose: "",
      /** @var {Number|String} */
      is_agree: 0,
      /** @var {String} */
      full_name_guardian: "",
      /** @var {Number|String} */
      relation_ship_member_id: "",
      /** @var {String} */
      full_address_guardian: "",
      /** @var {String} */
      guardian_email: "",
      /** @var {String} */
      guardian_id_card: "",
      /** @var {String} */
      guardian_phone_number:"",
      /** @var {Number|String} */
      order_id: "",
      /** @var {Number|String} */
      sub_total: 0,
      /** @var {Number|String} */
      total_vat: 0,
      /** @var {Number|String} */
      total_discount: 0,
      /** @var {Number|String} */
      total_money: 0,
      /** @var {Array} */
      order_detais: [
        // {
        //   /** @var {Number|String} */
        //   product_id: "",
        //   /** @var {Number|String} */
        //   output_type_id: "",
        //   /** @var {Number|String} */
        //   promotion_id: "",
        //   /** @var {Number|String} */
        //   price: 0,
        //   /** @var {Number|String} */
        //   quantity: 0,
        //   /** @var {Number|String} */
        //   total_discount: 0,
        //   /** @var {Number|String} */
        //   vat_amount: 0,
        //   /** @var {Number|String} */
        //   total_amount: 0,
        // }
      ]
    }, data);
  }

  /**
   * 
   * @param {Number|String} is_renew 
   * @return {String}
   */
  static isRenewTextStatic(is_renew) {
    let v = ('' + is_renew);
    return ('1' === v) ? 'Có' : (('0' === v) ? 'Không' : '');
  }

  /**
   * @param {Number|String} is_pay
   * @param {Number|String} is_pay_full
   * @return {String}
   */
  static isPayTypeTextStatic(is_pay, is_pay_full) {
    is_pay = '' + is_pay;
    is_pay_full = '' + is_pay_full;
    let text = '';
    // - Thanh toán thiếu (Tìm tất cả bản ghi trong phiếu thu có ISPAY =1, ISPAYFULL = 0)
    if ('1' === is_pay && '0' === is_pay_full) {
      text = 'Thanh toán thiếu';
    }
    // - Thanh toán đủ (Tìm tất cả bản ghi trong phiếu thu có ISPAY =0, ISPAYFULL = 1)
    if ('0' === is_pay && '1' === is_pay_full) {
      text = 'Thanh toán đủ';
    }
    // - Miễn phí (Tìm tất cả bản ghi trong phiếu thu có ISPAY =0, ISPAYFULL = 0)
    if ('0' === is_pay && '0' === is_pay_full) {
      text = 'Miễn phí';
    }
    return text;
  }

  /**
   * 
   * @param {Number|String} status 
   * @return {String}
   */
  static statusTextStatic(status) {
    let v = ('' + status);
    return ('1' === v) ? 'Duyệt đồng ý' : (('0' === v) ? 'Duyệt từ chối' : 'Chưa duyệt');
  }
}
// Make alias
const _static = TimekeepingUserEntity;
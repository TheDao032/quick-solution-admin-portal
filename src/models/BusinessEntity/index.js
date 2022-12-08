//
import Entity from '../Entity';

// Utils
import { cdnPath } from '../../utils/html';

/**
 * @class BusinessEntity
 */
export default class BusinessEntity extends Entity
{
  /** @var {String} */
  static defaultImgBase64 = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2264%22%20height%3D%2264%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_16caa47cdd6%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_16caa47cdd6%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2213.171875%22%20y%3D%2236.5%22%3E64x64%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

  /**
   * @var {String} Primary Key
   */
  static primaryKey = 'business_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {Number|String} */
      "company_id": "",
      /** @var {Number|String} */
      "business_type_id": "",
      /** @var {String} */
      "business_name": "",
      /** @var {String} */
      "business_banner": "",
      /** @var {String} */
      "business_icon_url": "",
      /** @var {String} */
      "business_phone_number": "",
      /** @var {String} */
      "business_mail": "",
      /** @var {String} */
      "business_website": "",
      /** @var {Number|String} */
      "business_country_id": "",
      /** @var {Number|String} */
      "business_province_id": "",
      /** @var {Number|String} */
      "business_district_id": "",
      /** @var {Number|String} */
      "business_ward_id": "",
      /** @var {Number|String} */
      "area_id": "",
      /** @var {String} */
      "business_address": "",
      /** @var {String} */
      "business_zip_code": "",
      /** @var {String} */
      "location_x": "",
      /** @var {String} */
      "location_y": "",
      /** @var {String} */
      "opening_date": "",
      /** @var {String} */
      "open_time": "",
      /** @var {String} */
      "close_time": "",
      /** @var {Number|String} */
      "is_active": 1,
      /** @var {String} */
      "description": ""
    }, data);
  }

  /**
   * 
   * @param {object} data 
   */
  // constructor(data) { super(data); }

  /**
   * 
   * @returns {String}
   */
  key()
  {
    let key = this.tel || Math.random().toString();
    return key;
  }

  /**
   * 
   * @returns {String}
   */
  businessBanner()
  {
    return cdnPath(this.business_banner);
  }

  /**
   * 
   * @returns {String}
   */
  businessIconUrl()
  {
    return cdnPath(this.business_icon_url);
  }

  /**
   * 
   * @returns {String}
   */
  businessAddressFull()
  {
    return ([
      this.business_address,
      this.business_ward_name,
      this.business_district_name,
      this.business_province_name,
      this.business_country_name,
    ].filter(item => !!item).join(', '));
  }
}
// Make alias
// const _static = BusinessEntity;
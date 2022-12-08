//
import Entity from '../Entity';

/**
 * @class BannerEntity
 */
export default class BannerEntity extends Entity {
  /** @var {String} Primary Key */
  primaryKey = 'banner_id';

  /**QQ
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {Number} */
      banner_id: 0,
      /** @var {Number} */
      banner_type_id: 0,
      /** @var {String} */
      banner_type_name: "",
      /**@var {Number} */
      web_category_id:0,
      /** @var {String} */
      web_category_name: "",
      /** @var {String} */
      picture_url: "",      
      /** @var {String} */
      descriptions: "",
      create_date: '',
      /** @var {Number|String} */
      is_active: 1,
      // /** @var {Number|String} */
      is_slide: ""
    }, data);
  }
}
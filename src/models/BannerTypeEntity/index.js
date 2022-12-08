//
import Entity from '../Entity';

/**
 * @class BannerTypeEntity
 */
export default class BannerTypeEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'banner_type_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      banner_type_name: "",
      /** @var {String} */
      descriptions: "",
      /** @var {Number|String} */
      is_show_home: "",
      /** @var {String} */
      is_active: "",
      /** @var {String} */
      created_date: "",
    }, data);
  }
}
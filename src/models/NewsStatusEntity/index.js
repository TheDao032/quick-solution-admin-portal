//
import Entity from '../Entity';

/**
 * @class NewsStatusEntity
 */
export default class NewsStatusEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'news_status_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      news_status_name: "",
      /** @var {String} */
      user: "",
      /** @var {String} */
      create_date: "",
      /** @var {Number|String} */
      is_active: 1,
    }, data);
  }
}
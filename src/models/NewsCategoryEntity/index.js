//
import Entity from '../Entity';

/**
 * @class NewsCategoryEntity
 */
export default class NewsCategoryEntity extends Entity {
  /** @var {String} Primary Key */
  primaryKey = 'news_category_id';

  /**QQ
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {}, data);
  }
}
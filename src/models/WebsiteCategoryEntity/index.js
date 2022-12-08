import Entity from '../Entity';

/**
 * @class WebsiteCategoryEntity
 */
export default class WebsiteCategoryEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'web_category_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {}, data);
  }
}
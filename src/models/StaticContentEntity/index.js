import Entity from '../Entity';

/**
 * @class StaticContentEntity
 */
export default class StaticContentEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'static_content_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, { }, data);
  }
}
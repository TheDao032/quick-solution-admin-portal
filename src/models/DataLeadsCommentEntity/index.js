//
import Entity from '../Entity';

/**
 * @class DataLeadsCommentEntity
 */
export default class DataLeadsCommentEntity extends Entity
{
  /** @var {String} Primary Key */
  // primaryKey = 'comment_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      content_comment: "",
    }, data);
  }
}
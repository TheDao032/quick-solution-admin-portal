//
import Entity from '../Entity';

// Utils
// import * as utils from '../../utils';

/**
 * @class RelationshipEntity
 */
export default class RelationshipEntity extends Entity
{
  /** @var {String} Primary Key */
  static primaryKey = 'relationship_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      name: "",
    }, data);
  }
}
// Make alias
// const _static = RelationshipEntity;
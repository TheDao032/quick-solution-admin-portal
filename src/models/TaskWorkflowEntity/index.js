//
import Entity from '../Entity';

/**
 * @class TaskWorkflowEntity
 */
export default class TaskWorkflowEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'task_work_follow_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      task_work_follow_name: "",
      /** @var {Number|String} */
      order_index: "0",
      /** @var {String} */
      description: "",
      /** @var {Number|String} */
      is_active: 1,
      /** @var {Number|String} */
      is_complete: 0,
    }, data);
  }
}
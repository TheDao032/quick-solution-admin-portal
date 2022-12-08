//
import Entity from '../Entity';

/**
 * @class TaskTypeEntity
 */
export default class TaskTypeEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'task_type_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      task_type_name: "",
      /** @var {Number|String} */
      add_function_id: "",
      /** @var {Number|String} */
      edit_function_id: "",
      /** @var {Number|String} */
      delete_function_id: "",
      /** @var {String} */
      description: "",
      /** @var {Number|String} */
      is_active: 1,
      /** @var {Array} */
      // task_work_follow_list: [],
      /** @var {Array} */
      list_task_work_follow: [],
    }, data);
  }
}
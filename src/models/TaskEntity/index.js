//
import Entity from '../Entity';

/**
 * @class TaskEntity
 */
export default class TaskEntity extends Entity
{
  /** @var {String} Primary Key */
  primaryKey = 'task_id';

  /**
   * @param {object} data 
   */
  constructor(data) {
    super(data);

    // Init
    Object.assign(this, {
      /** @var {String} */
      task_name: "",
      /** @var {Number|String} */
      add_function_id: "",
      /** @var {Number|String} */
      edit_function_id: "",
      /** @var {Number|String} */
      delete_function_id: "",
      /** @var {String} */
      description: "",
      /** @var {Number|String} */
      task_type_id:null,
      /** @var {Number|String} */
      task_status_id:1,
      /** @var {String} */
      start_date:"",
      /** @var {String} */
      end_date:"",
      /** @var {Number|String} */
      parent_id: null,
      /** @var {Number|String} */
      is_active:1,
      /** @var {Number|String} */
      company_id: null,
      /** @var {Number|String} */
      department_id: null,
      /** @var {Number|String} */
      business_id: null,
      /** @var {Number|String} */
      user_name: null,
      /** @var {Number|String} */
      supervisor_name: null,
      /** @var {Array} */
      list_task_dataleads: "",
      /** @var {Object} */
      // customers: null
    }, data);
  }
}
//
import Model from '../Model';
import TaskWorkflowEntity from '../TaskWorkflowEntity';

// Util(s)

/**
 * @class TaskWorkflowModel
 */
export default class TaskWorkflowModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'task_workflows';

  /**
   * @var {Ref}
   */
  _entity = TaskWorkflowEntity;

  /**
   * @var {String}
   */
  static API_TASK_WORKFLOW_LIST = 'task-work-follow';
  /** @var {String} */
  static API_TASK_WORKFLOW_DETAIL = 'task-work-follow/:id';
  /** @var {String} */
  static API_TASK_WORKFLOW_OPTS = 'task-work-follow/get-options';
  /** @var {String} */
  static API_TASK_WORKFLOW_CHANGE_STATUS = 'task-work-follow/:id/change-status';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => this.mkEnt();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_TASK_WORKFLOW_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_TASK_WORKFLOW_OPTS, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptionsFull(_opts)
  {
    // Format options
    let opts = _opts || {};
    let apiOpts = Object.assign({
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE,
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map((item) => {
          let { task_workflow_id: id, task_workflow_name: name } = item;
          // Nam trong list exclude --> set null
          if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
            return null;
          }
          return ({ name, id, ...item });
        });
        // Filter null items
        return ret.filter(item => item);
      });
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_TASK_WORKFLOW_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TASK_WORKFLOW_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TASK_WORKFLOW_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_TASK_WORKFLOW_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_TASK_WORKFLOW_DETAIL.replace(':id', id), data)
      .then((data) => new TaskWorkflowEntity(data))
    ;
  }
}
// Make alias
const _static = TaskWorkflowModel;

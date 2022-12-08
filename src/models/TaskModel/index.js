//
import Model from '../Model';
import TaskEntity from '../TaskEntity';

// Util(s)

/**
 * @class TaskModel
 */
export default class TaskModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'tasks';

  /**
   * @var {Ref}
   */
  _entity = TaskEntity;

  /**
   * @var {String}
   */
  static API_TASK_LIST = 'task';
  /** @var {String} */
  static API_TASK_DETAIL = 'task/:id';
  /** @var {String} */
  static API_TASK_OPTS = 'task/get-options';
  /** @var {String} */
  static API_TASK_CHANGE_STATUS = 'task/:id/change-status';
  /** @var {String} */
  static API_TASK_DATA_LEADS = 'task-data-leads';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'task_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
/**

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
    return this._api.get(_static.API_TASK_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_TASK_OPTS, opts);
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
      itemsPerPage: 256, // Number.MAX_SAFE_INTEGER // @TODO: get all records
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ task_id: id, task_name: name, description }) => {
              // Nam trong list exclude --> set null
              if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
                return null;
              }
              return ({ name, id, description });
            }
        );
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
    return this._api.post(_static.API_TASK_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TASK_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TASK_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_TASK_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_TASK_DETAIL.replace(':id', id), data)
      .then((data) => new TaskEntity(data))
    ;
  }

  /**
   * Get list data_lead of task
   */
  getDataLeads(_opts)
  {
    // Validate data?!
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_TASK_DATA_LEADS, opts);
  }
}
// Make alias
const _static = TaskModel;

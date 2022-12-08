//
import Model from '../Model';
import TaskTypeEntity from '../TaskTypeEntity';

// Util(s)

/**
 * @class TaskTypeModel
 */
export default class TaskTypeModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'task_types';

  /**
   * @var {Ref}
   */
  _entity = TaskTypeEntity;

  /**
   * @var {String}
   */
  static API_TASK_TYPE_LIST = 'task-type';
  /** @var {String} */
  static API_TASK_TYPE_DETAIL = 'task-type/:id';
  /** @var {String} */
  static API_TASK_TYPE_OPTS = 'task-type/get-options';
  /** @var {String} */
  static API_TASK_TYPE_OPTS_CREATE = 'task-type/get-options-for-create';
  /** @var {String} */
  static API_TASK_TYPE_OPTS_LIST = 'task-type/get-options-for-list';
  /** @var {String} */
  static API_TASK_TYPE_CHANGE_STATUS = 'task-type/:id/change-status';
  /** @var {String} */
  static API_TASK_TYPE_EXCEL = 'task-type/export-excel';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'task_type_id';

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
    return this._api.get(_static.API_TASK_TYPE_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_TASK_TYPE_OPTS, opts);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsForCreate(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_TASK_TYPE_OPTS_CREATE, opts);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsForList(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_TASK_TYPE_OPTS_LIST, opts);
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
          ({ task_type_id: id, task_type_name: name, description }) => {
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
    return this._api.post(_static.API_TASK_TYPE_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    console.log(_data);
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TASK_TYPE_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TASK_TYPE_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_TASK_TYPE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_TASK_TYPE_DETAIL.replace(':id', id), data)
      .then((data) => new TaskTypeEntity(data))
    ;
  }

  /**
   *
   */
  exportExcel(opts)
  {
    const header = { responseType: 'blob' };
    return this._api.get(_static.API_TASK_TYPE_EXCEL, opts, header);
  }
}
// Make alias
const _static = TaskTypeModel;

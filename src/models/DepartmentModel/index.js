//
import Model from '../Model';
// Entities
import DepartmentEntity from '../DepartmentEntity';

/**
 * @class Department
 */
export default class DepartmentModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'department';

  /** @var {Ref} */
  _entity = DepartmentEntity;

  /** @var {String} */
  static API_DEPARTMENT_LIST = 'department';
  /** @var {String} */
  static API_DEPARTMENT_OPTS = 'department/get-options';
  /** @var {String} */
  static API_DEPARTMENT_CREATE = 'department';
  /** @var {String} */
  static API_DEPARTMENT_UPDATE = 'department/:id'; // PUT
  /** @var {String} */
  static API_DEPARTMENT_READ = 'department/:id'; // GET
  /** @var {String} */
  static API_DEPARTMENT_DELETE = 'department/:id'; // DELETE
  /** @var {String} */
  static API_DEPARTMENT_CHANGE_PASSWORD = 'department/:id/change-password'; // PUT
  /** @var {String} */
  static API_DEPARTMENT_CHANGE_STATUS ='department/:id/change-status';
  /** @var {String} */
  static API_DEPARTMENT_DETAIL = 'department/:id';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'department_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * jqx's grid columns & datafields!
   * @var {Array}
   */
  static _jqxGridColumns = [];

  /**
   * @return {Object}
   */
  fillable = () => ({
    "department_name": "",
    "company_id": null,
    "is_active": 1,
  });

  /**
   * Return jqx's grid columns
   * @param {Object} opts Options
   * @return {Array}
   */
  static jqxGridProps(opts)
  {
    let _self = new _static();

    // Get, format options
    opts = Object.assign({
      prefix: _static.columnPrefix,
      // events
      // +++ format (mapping) API data before render
      postBeforeProcessing: (data) => {
        (data.items || []).forEach((item) => {
          // ...
        });
      }
    }, opts);

    //
    let props = Model.jqxGridProps(_static._jqxGridColumns, opts);
    // +++
    Object.assign(props.source, {
      url: _static.apiClass.buildApiUri(_static.API_DEPARTMENT_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts Options
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_DEPARTMENT_OPTS, opts);
  }

  /**
   * 
   * @param {object} data
   */
  // constructor(data) { super(data); }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    //
    return this._api.post(_static.API_DEPARTMENT_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DEPARTMENT_READ.replace(':id', id), data)
      .then((data) => new DepartmentEntity(data))
    ;
  }

  /**
   * @return {Promise}
   */
  readVer2(id, _opts = {})
  {
    // Validate data?!
    return this.getOptions(_opts)
      .then(items => (items || []).find(item => ('' + item.id) === ('' + id)));
  }

  /**
   * @return {Promise}
   */
  readDetail(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_DEPARTMENT_DETAIL.replace(':id', id), data)
      .then((data) => new DepartmentEntity(data))
    ;
  }
  /**
   * @return {Promise}
   */
  update(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_DEPARTMENT_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DEPARTMENT_DELETE.replace(':id', id), data);
  }
  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);    
    return this._api.get(_static.API_DEPARTMENT_LIST, data);
  }
   /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_DEPARTMENT_CHANGE_STATUS.replace(':id', id), data);
  }
    /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_DEPARTMENT_DETAIL.replace(':id', id), data);
  }
}
// Make alias
const _static = DepartmentModel;

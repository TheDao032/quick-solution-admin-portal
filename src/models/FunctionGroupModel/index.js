//
import Model from '../Model';
//
import FunctionGroupEntity from '../FunctionGroupEntity';
// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class FunctionGroupModel
 */
export default class FunctionGroupModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'func_groups';

  /** @var {Ref} */
  _entity = FunctionGroupEntity;

  /** @var {String} */
  static API_FUNCTION_GROUP_LIST = 'function-group';
  /** @var {String} */
  static API_FUNCTION_GROUP_OPTS = 'function-group/get-options';
  /** @var {String} */
  static API_FUNCTION_GROUP_CREATE = 'function-group';
  /** @var {String} */
  static API_FUNCTION_GROUP_UPDATE = 'function-group/:id'; // PUT
  /** @var {String} */
  static API_FUNCTION_GROUP_READ = 'function-group/:id'; // GET
  /** @var {String} */
  static API_FUNCTION_GROUP_DELETE = 'function-group/:id'; // DELETE
  /** @var {String} */
  static API_FUNCTION_GROUP_CHANGE_STATUS = '/function-group/:id/status'
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'function_group_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * jqx's grid columns & datafields!
   * @var {Array}
   */
  static _jqxGridColumns = [
    { datafield : 'function_group_id' },
    {
      text : 'Tên nhóm quyền',
      datafield : 'function_group_name',
      pinned: true,
      width : 180,
    },
    {
      text : 'Order Index',
      datafield : 'order_index',
      width : 100,
      cellsalign: 'right',
      filterable : false,
    },
    {
      text : 'Mô tả',
      datafield : 'description',
      sortable : false,
      filterable : false,
    },
    {
      text : 'Active?',
      datafield : ['is_active', {
        type : 'int'
      }],
      width : 60,
      cellsalign: 'center',
      columntype: 'checkbox',
      filtertype: 'bool'
    },
    {
      text : 'System?',
      datafield : ['is_system', {
        type : 'int'
      }],
      width : 60,
      cellsalign: 'center',
      columntype: 'checkbox',
      filtertype: 'bool'
    }
  ];

  /**
   * @return {Object}
   */
  fillable = () => ({
    "function_group_name": "",
    "description": "",
    "order_index": "0",
    "is_active": 1,
    "is_system": 0,
    "functions": []
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
          // Case:
          // if ('' in item) {}
          //
        });
      }
    }, opts);

    //
    let props = Model.jqxGridProps(_static._jqxGridColumns, opts);
    // +++
    Object.assign(props.source, {
      url: _static.apiClass.buildApiUri(_static.API_FUNCTION_GROUP_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * Get list
   * @returns Promise
   */
  list(_opts = {})
  {
    let opts = Object.assign({
      //itemsPerPage: 25,
      //page: 1,
      //is_active: 2,
      //is_system: 2
    }, _opts);
    return this._api.get(_static.API_FUNCTION_GROUP_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptionsRev1(_opts)
  {
    let opts = Object.assign({
      itemsPerPage: 256,// Number.MAX_SAFE_INTEGER // @TODO: get all records
    }, _opts);
    return this.list(opts)
      .then(({ items }) => {
        return (items || []).map(
          ({ function_group_id: id, function_group_name: name }) => {
              return ({ name, id });
            }
          );
      });
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({
      is_active: 1
    }, _opts);
    //
    return this._api.get(_static.API_FUNCTION_GROUP_OPTS, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    //
    return this._api.post(_static.API_FUNCTION_GROUP_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_FUNCTION_GROUP_READ.replace(':id', id), data)
      .then((data) => new FunctionGroupEntity(data))
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
    return this._api.put(_static.API_FUNCTION_GROUP_UPDATE.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  changeStatus(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_FUNCTION_GROUP_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_FUNCTION_GROUP_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = FunctionGroupModel;

//
import Model from '../Model';
//
import FunctionEntity from '../FunctionEntity';
// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class FunctionModel
 */
export default class FunctionModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'functions';

  /** @var {Ref} */
  _entity = FunctionEntity;

  /** @var {String} */
  static API_FUNCTION_LIST = 'function';
  /** @var {String} */
  static API_FUNCTION_CREATE = 'function';
  /** @var {String} */
  static API_FUNCTION_UPDATE = 'function/:id'; // PUT
  /** @var {String} */
  static API_FUNCTION_READ = 'function/:id'; // GET
  /** @var {String} */
  static API_FUNCTION_DELETE = 'function/:id'; // DELETE
  /** @var {String} */
  static API_FUNCTION_CHANGE_STATUS = '/function/:id/change-status'; // DELETE
  /** @var {String} */
  static API_FUNCTION_OPTS = '/function/get-options'; // GET
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'function_id';

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
    { datafield : 'function_id' },
    {
      text : 'Tên quyền',
      datafield : 'function_name',
      pinned: true,
      width : 220,
    },
    {
      text : 'Code',
      datafield : 'function_alias',
      pinned: true,
      width : 120,
    },
    { datafield : 'function_group_id' },
    {
      text : 'Nhóm quyền',
      datafield : 'function_group_name',
      width : 220,
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
    "function_name": "",
    "function_alias": "",
    "function_group_id": "",
    "description": "",
    "is_active": 1,
    "is_system": 0
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
      url: _static.apiClass.buildApiUri(_static.API_FUNCTION_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * @return {Promise}
   */
  list(_opts = {})
  {
    // Validate data?!
    let data = Object.assign({}, _opts);
    //
    return this._api.get(_static.API_FUNCTION_LIST, data)
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    // return this._api.get(_static.API_FUNCTION_OPTS, opts);
    let opts = Object.assign({
      itemsPerPage: 512, // @TODO: get all records
      page: 1,
    }, _opts);

    return this.list(opts)
      .then(({ items }) => {
        return (items || []).map(
          ({ function_id: id, function_name: name }) => {
              return ({ name, id });
            }
          );
      });
  }

  /**
   * Get options full
   * @param {Object} opts
   * @returns Promise
   */
  getOptionsFull(_opts)
  {
    // return this._api.get(_static.API_FUNCTION_OPTS, opts);
    let opts = Object.assign({
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE,
      page: 1,
    }, _opts);

    return this.list(opts)
      .then(({ items }) => items);
  }
  
  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    //
    return this._api.post(_static.API_FUNCTION_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_FUNCTION_READ.replace(':id', id), data)
      .then((data) => new FunctionEntity(data))
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
    return this._api.put(_static.API_FUNCTION_UPDATE.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  changeStatus(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_FUNCTION_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_FUNCTION_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = FunctionModel;

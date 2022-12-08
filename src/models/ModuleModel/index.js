//
import Model from '../Model';
//
import ModuleEntity from '../ModuleEntity';
// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class ModuleModel
 */
export default class ModuleModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'modules';

  /** @var {Ref} */
  _entity = ModuleEntity;

  /** @var {String} */
  static API_MODULE_LIST = 'module';
  /** @var {String} */
  static API_MODULE_CREATE = 'module';
  /** @var {String} */
  static API_MODULE_UPDATE = 'module/:id'; // PUT
  /** @var {String} */
  static API_MODULE_READ = 'module/:id'; // GET
  /** @var {String} */
  static API_MODULE_DELETE = 'module/:id'; // DELETE

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'module_id';

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
    { datafield : 'module_id' },
    {
      text : 'Tên nhóm quyền',
      datafield : 'module_name',
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
    "module_name": "",
    "description": "",
    "order_index": "0",
    "is_active": "1",
    "is_system": "0"
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
      url: _static.apiClass.buildApiUri(_static.API_MODULE_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * Get list
   * @returns Promise
   */
  list(_opts)
  {
    let opts = Object.assign({
      // itemsPerPage:,
      // page,
      // is_active
      // is_system
    }, _opts);
    return this._api.get(_static.API_MODULE_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions(_opts)
  {
    return Promise.resolve([]);
    let opts = Object.assign({
      itemsPerPage: 256,// Number.MAX_SAFE_INTEGER // @TODO: get all records
    }, _opts);
    return this.list(opts)
      .then(({ items }) => {
        return (items || []).map(
          ({ module_id: id, module_name: name }) => {
              return ({ name, id });
            }
          );
      });
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    //
    return this._api.post(_static.API_MODULE_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_MODULE_READ.replace(':id', id), data)
      .then((data) => new ModuleEntity(data))
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
    return this._api.put(_static.API_MODULE_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_MODULE_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = ModuleModel;

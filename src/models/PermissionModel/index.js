//
import Model from '../Model';
//
import PermissionEntity from '../PermissionEntity';

// Util(s)
// ...

/**
 * @class PermissionModel
 */
export default class PermissionModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'permissions';

  /**
   * @var {Ref}
   */
  _entity = PermissionEntity;

  /** @var {String} */
  static API_PERMISSION_GET_LIST_FUNCTION_GROUPS = 'usergroup-function/get-list-function-groups';
  /** @var {String} */
  static API_PERMISSION_GET_LIST_FUNCTIONS_BY_FUNCTION_GROUP = 'usergroup-function/get-list-functions-by-function-group/:id';
  /** @var {String} */
  static API_PERMISSION_POST_USERGROUP_FUNCTION = 'usergroup-function';

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'permission_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({});

  /**
   *
   * @param {object} data
   */
  // constructor(data) { super(data); }

  /**
   * @param {Object} _opts
   */
  getListFunctionGroups(_opts = {})
  {
    // Get, format options
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PERMISSION_GET_LIST_FUNCTION_GROUPS, opts);
  }

  /**
   * @param {Object} _opts
   */
  getListFunctionsByFunctionGroup(id, _opts = {})
  {
    // Get, format options
    let opts = Object.assign({
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE
    }, _opts);
    return this._api.get(_static.API_PERMISSION_GET_LIST_FUNCTIONS_BY_FUNCTION_GROUP.replace(':id', id), opts);
  }

  /**
   * @param {Array} data
   */
  postUserGroupFunction(data, _opts = {})
  {
    // Get, format data
    // ...
    // Get, format options
    // let opts = Object.assign({}, _opts);
    //
    return this._api.post(_static.API_PERMISSION_POST_USERGROUP_FUNCTION, data);
  }
}
// Make alias
const _static = PermissionModel;

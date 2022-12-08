//
import Model from '../Model';
import TimekeepingUserEntity from '../TimekeepingUserEntity';

// Util(s)

/**
 * @class TimekeepingUserModel
 */
export default class TimekeepingUserModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'user_timekeeping';

  /** @var {Ref} */
  _entity = TimekeepingUserEntity;

  /** @var {String} */
  static API_LIST = 'user-timekeeping';
  /** @var {String} */
  static API_OPTS = 'user-timekeeping/get-options';
  /** @var {String} */
  static API_CREATE = 'user-timekeeping';
  /** @var {String} */
  static API_UPDATE = 'user-timekeeping/:id'; // PUT
  /** @var {String} */
  static API_READ = 'user-timekeeping/:id'; // GET
  /** @var {String} */
  static API_DELETE = 'user-timekeeping/:id'; // DELETE
  /** @var {String} */
  static API_CHANGE_STATUS = 'user-timekeeping/:id/change-status';
  /** @var {String} */
  static API_EXPORT_EXCEL = 'user-timekeeping/export-excel';
  /** @var {String} */
  static API_APPROVE = 'user-timekeeping/approved-times'; // PUT

  /**
   * @var {String} Primary Key
   */
  static primaryKey = TimekeepingUserEntity.primaryKey;

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => new TimekeepingUserEntity();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_OPTS, opts);
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

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ timekeepingUser_id: id, timekeepingUser_name: name, description }) => {
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
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    // console.log('TimekeepingUser#create: ', data);
    //
    return this._api.post(_static.API_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_READ.replace(':id', id), data)
      .then((data) => new TimekeepingUserEntity(data))
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
    return this._api.put(_static.API_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DELETE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  exportExcel(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.file(_static.API_EXPORT_EXCEL, data);
  }

  /**
   * @return {Promise}
   */
  approve(data = [])
  {
    // Validate data?!
    // ...
    //
    return this._api.put(_static.API_APPROVE, data);
  }
}
// Make alias
const _static = TimekeepingUserModel;

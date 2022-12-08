// Model(s)/Enties
import Model from '../Model';
import BusinessEntity from '../BusinessEntity';

/**
 * @class BusinessModel
 */
export default class BusinessModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'businesss';

  /** @var {Ref} */
  _entity = BusinessEntity;

  /** @var {String} */
  static API_BUSINESS_LIST = 'business';
  /** @var {String} */
  static API_BUSINESS_OPTS = 'business/get-options';
  /** @var {String} */
  static API_BUSINESS_OPTS_BY_USER = 'business/get-options-by-user';
  /** @var {String} */
  static API_BUSINESS_CREATE = 'business';
  /** @var {String} */
  static API_BUSINESS_UPDATE = 'business/:id'; // PUT
  /** @var {String} */
  static API_BUSINESS_READ = 'business/:id'; // GET
  /** @var {String} */
  static API_BUSINESS_DELETE = 'business/:id'; // DELETE
  /** @var {String} */
  static API_BUSINESS_CHANGE_STATUS = 'business/:id/change-status';

  /**
   * @var {String} Primary Key
   */
  static primaryKey = BusinessEntity.primaryKey;

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => new BusinessEntity();

  /**
   * 
   * @param {object} data
   */
  // constructor(data) { super(data); }

  /**
   * Get list
   * @returns Promise
   */
  list(_opts = {})
  {
    let opts = Object.assign({
      // itemsPerPage:,
      // page,
      // is_active
      // is_system
    }, _opts);
    return this._api.get(_static.API_BUSINESS_LIST, opts);
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
      is_active: 1,
      exclude_id: []
    }, opts /*opts['_api']*/);
    // delete opts['_api'];

    //
    return this.list(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map((item) => {
          let id = item.business_id;
          // Nam trong list exclude --> set null
          if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
            return null;
          }
          return Object.assign(item, { id, name: item.business_name });
        });
        // Filter null items
        return ret.filter(item => item);
      });
  }

  /**
   * Get options
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_BUSINESS_OPTS, opts);
  }

  /**
   * Get options
   * @returns Promise
   */
  getOptionsByUser(_opts = {})
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_BUSINESS_OPTS_BY_USER, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('Business#create: ', data);
    //
    return this._api.post(_static.API_BUSINESS_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_BUSINESS_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_BUSINESS_READ.replace(':id', id), data)
      .then((data) => new BusinessEntity(data))
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
    return this._api.put(_static.API_BUSINESS_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_BUSINESS_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = BusinessModel;

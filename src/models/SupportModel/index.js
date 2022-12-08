// Model(s)/Enties
import Model from '../Model';
import SupportEntity from '../SupportEntity';

/**
 * @class SupportModel
 */
export default class SupportModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'banner-type';

  /** @var {Ref} */
  _entity = SupportEntity;

  /** @var {String} */
  static API_SUPPORT_LIST = 'support';
  /** @var {String} */
  static API_SUPPORT_CREATE = 'support';
  /** @var {String} */
  static API_SUPPORT_UPDATE = 'support/:id'; // PUT
  /** @var {String} */
  static API_SUPPORT_READ = 'support/:id'; // GET
  /** @var {String} */
  static API_SUPPORT_DELETE = 'support/:id'; // DELETE
  /** @var {String} */
  static API_SUPPORT_CHANGE_STATUS = 'support/:id/change-status';
  /** @var {String} */
  static API_SUPPORT_OPTS = 'support/get-options';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'support_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "support_id": "",
    "full_name": "",
    "phone_number": "",
    "email":"",
    "content_support": "",
    "topic_id": "",
    "topic_name": "",
    "is_active": 1
  });

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
    return this._api.get(_static.API_SUPPORT_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_SUPPORT_OPTS, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('Support#create: ', data);
    //
    return this._api.post(_static.API_SUPPORT_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_SUPPORT_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_SUPPORT_READ.replace(':id', id), data)
      .then((data) => new SupportEntity(data))
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
    return this._api.put(_static.API_SUPPORT_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_SUPPORT_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = SupportModel;
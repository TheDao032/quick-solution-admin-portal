// Model(s)/Enties
import Model from '../Model';
import SetupServiceRegisterEntity from '../SetupServiceRegisterEntity';

/**
 * @class SetupServiceRegisterModel
 */
export default class SetupServiceRegisterModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'setup-service-register';

  /** @var {Ref} */
  _entity = SetupServiceRegisterEntity;

  /** @var {String} */
  static API_SETUPSERVICEREGISTER_LIST = 'setup-service-register';
  /** @var {String} */
  static API_SETUPSERVICEREGISTER_CREATE = 'setup-service-register';
  /** @var {String} */
  static API_SETUPSERVICEREGISTER_UPDATE = 'setup-service-register/:id'; // PUT
  /** @var {String} */
  static API_SETUPSERVICEREGISTER_READ = 'setup-service-register/:id'; // GET
  /** @var {String} */
  static API_SETUPSERVICEREGISTER_DELETE = 'setup-service-register/:id'; // DELETE
  /** @var {String} */
  static API_SETUPSERVICEREGISTER_CHANGE_STATUS = 'setup-service-register/:id/change-status';
  /** @var {String} */
  static API_SETUPSERVICEREGISTER_OPTS = 'setup-service-register/get-setup-service';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'SETUPSERVICEREGISTER_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "register_setup_id": "",
    "full_name": "",
    "phone_number": "",
    "email":"",
    "address": "",
    "setup_service_title": "",
    "user": ""
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
    return this._api.get(_static.API_SETUPSERVICEREGISTER_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_SETUPSERVICEREGISTER_OPTS, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('SETUPSERVICEREGISTER#create: ', data);
    //
    return this._api.post(_static.API_SETUPSERVICEREGISTER_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_SETUPSERVICEREGISTER_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_SETUPSERVICEREGISTER_READ.replace(':id', id), data)
      .then((data) => new SetupServiceRegisterEntity(data))
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
    return this._api.put(_static.API_SETUPSERVICEREGISTER_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_SETUPSERVICEREGISTER_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = SetupServiceRegisterModel;
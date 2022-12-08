//
import Model from '../Model';
import CompanyTypeEntity from '../CompanyTypeEntity';
// Util(s)

/**
 * @class CompanyModel
 */
export default class CompanyTypeModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'company_typies';

  /** @var {Ref} */
  _entity = CompanyTypeEntity;

  /** @var {String} */
  static API_COMPANY_TYPE_LIST = 'company-type';
  /** @var {String} */
  static API_COMPANY_TYPE_OPTS = 'company-type/get-options';
  /** @var {String} */
  static API_COMPANY_TYPE_CREATE = 'company-type';
  /** @var {String} */
  static API_COMPANY_TYPE_UPDATE = 'company-type/:id'; // PUT
  /** @var {String} */
  static API_COMPANY_TYPE_READ = 'company-type/:id'; // GET
  /** @var {String} */
  static API_COMPANY_TYPE_DELETE = 'company-type/:id'; // DELETE
  /** @var {String} */
  static API_COMPANY_TYPE_UPDATE_STATUS = 'company-type/:id/change-status'; // PUT
  /** @var {String} */
  static API_COMPANY_TYPE_GET_BY_USER = 'company-type/get-by-user'; // GET

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'company_type_id';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "id": "",
    "name": ""
  });

  /**
   * Get list
   * @returns Promise
   */
  getList(_opts = {})
  {
    // Get, format input
    let opts = Object.assign({}, _opts);

    return this._api.get(_static.API_COMPANY_TYPE_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    // Get, format input
    let opts = Object.assign({}, _opts);

    return this._api.get(_static.API_COMPANY_TYPE_OPTS, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    //
    return this._api.post(_static.API_COMPANY_TYPE_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _opts = {})
  {
    // Validate data?!
    let opts = Object.assign({}, _opts);
    //
    return this._api.get(_static.API_COMPANY_TYPE_READ.replace(':id', id), opts)
      .then((data) => new CompanyTypeEntity(data))
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
    return this._api.put(_static.API_COMPANY_TYPE_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_COMPANY_TYPE_DELETE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  changeStatus(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_COMPANY_TYPE_UPDATE_STATUS.replace(':id', id), data);
  }
}
// Make alias
const _static = CompanyTypeModel;

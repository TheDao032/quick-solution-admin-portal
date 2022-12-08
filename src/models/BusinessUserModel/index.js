//
import Model from '../Model';
import BusinessUserEntity from '../BusinessUserEntity';

// Util(s)

/**
 * @class BusinessUserModel
 */
export default class BusinessUserModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'business-users';

  /**
   * @var {Ref}
   */
  _entity = BusinessUserEntity;

  /**
   * @var {String}
   */
  static API_BUSINESS_USER_LIST = 'business-user';
  /**
   * @var {String} Primary Key
   */
  // primaryKey = 'business-user_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => this.mkEnt();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_BUSINESS_USER_LIST, data);
  }


  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_BUSINESS_USER_LIST, data);
  }

  /**
   * @return {Promise}
   */
  delete(business_id,user_id)
  {
    // Validate data?!
    let data = { business_id, user_id};
    //
    return this._api.delete(_static.API_BUSINESS_USER_LIST,null, {data});
  }
  
  /**
   * @return {Promise}
   */
  getAllUserOfBusiness(business_id)
  {
    let data = {
      business_id,
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE,
      page: 1,
      is_active: 1,
    };
    return this._api.get(_static.API_BUSINESS_USER_LIST, data);
  }
}
// Make alias
const _static = BusinessUserModel;

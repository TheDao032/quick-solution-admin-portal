//
import Model from '../Model';
// Util(s)

/**
 * @class CustomerTypeGroupModel
 */
export default class CustomerTypeGroupModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'customer-type-group';

  /** @var {Ref} */


  /**
   * @var {String}
   */

  /** @var {String} */
  static API_CUSTOMER_TYPE_GROUP_OPTS = 'customer-type-group/get-options';

  /** @var {String} Primary Key */
  primaryKey = 'id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

   /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    console.log(_opts)
    let opts = Object.assign({}, _opts);
    var data  =this._api.get(_static.API_CUSTOMER_TYPE_GROUP_OPTS, opts);
    console.log(data)
    return data;
  }
  
}
// Make alias
const _static = CustomerTypeGroupModel;

//
import Model from '../Model';
//
import StatusProductEntity from '../StatusProductEntity';

// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class StatusProductModel
 */
export default class StatusProductModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = '';

  /**
   * @var {String}
   */

  static API_STATUS_DATA_LEADS_OPTS = 'status-product/get-options';
  /**
   * @var {String} Primary Key
   */
  primaryKey = '';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({

  });

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_STATUS_DATA_LEADS_OPTS, opts);
  }
}
// Make alias
const _static = StatusProductModel;

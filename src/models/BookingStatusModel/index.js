//
import Model from '../Model';
//
import BookingStatusEntity from '../BookingStatusEntity';
 
/**
 * @class BookingModel
 */
export default class BookingStatusModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'booking';

  /**
   * @var {Ref}
   */
 // _entity = BookingStatusEntity;

  /**
   * @var {String}
   */ 
  /** @var {String} */
  static API_BOOKING_STATUS_OPTS = 'booking-status/get-options'; 
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "id": null, 
    "name": null,
    "is_active": 1
  });

  /**
   * Return jqx's grid columns
   * @param {Object} opts Options
   * @return {Array}
   */
 

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_BOOKING_STATUS_OPTS, opts);
  }

}
// Make alias
const _static = BookingStatusModel;

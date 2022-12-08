//
import Model from '../Model';
//
import DataLeadsSmsEntity from '../DataLeadsSmsEntity';

/**
 * @class DataLeadsSmsModel
 */
export default class DataLeadsSmsModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'data_leads_sms';

  /**
   * @var {Ref}
   */
  _entity = DataLeadsSmsEntity;

  /** @var {String} */
  static API_DATA_LEAD_SMS_LIST = 'data-leads-sms';
  /** @var {String} */
  static API_DATA_LEAD_SMS_SEND_SMS = 'data-leads-sms/send-sms';
  /** @var {String} */
  static API_DATA_LEAD_SMS_DETAIL = 'data-leads-sms/:id';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'sms_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => this.mkEnt();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({
      itemsPerPage: 5, // default items per page
      page: 1,
      data_leads_id: null,
      task_id: null,
    }, _data);
    return this._api.get(_static.API_DATA_LEAD_SMS_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_DATA_LEAD_SMS_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.post(_static.API_DATA_LEAD_SMS_SEND_SMS, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_DATA_LEAD_SMS_DETAIL.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DATA_LEAD_SMS_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_SMS_DETAIL.replace(':id', id), data)
      .then((data) => new DataLeadsSmsEntity(data))
    ;
  }
}
// Make alias
const _static = DataLeadsSmsModel;

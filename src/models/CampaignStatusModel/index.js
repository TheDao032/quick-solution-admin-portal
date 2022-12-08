//
import Model from '../Model';
import CampaignStatusEntity from '../CampaignStatusEntity';

// Util(s)

/**
 * @class CampaignStatusModel
 */
export default class CampaignStatusModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'campaign_status';

  /**
   * @var {Ref}
   */
  _entity = CampaignStatusEntity;

  /**
   * @var {String}
   */
  static API_CAMPAIGN_STATUS_LIST = 'campaign-status';
  /** @var {String} */
  static API_CAMPAIGN_STATUS_DETAIL = 'campaign-status/:id';
  /** @var {String} */
  static API_CAMPAIGN_STATUS_OPTS = 'campaign-status/get-options';
  /** @var {String} */
  static API_CAMPAIGN_STATUS_CHANGE_STATUS = 'campaign-status/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'campaign_status_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => ({});

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CAMPAIGN_STATUS_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_CAMPAIGN_STATUS_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_CAMPAIGN_STATUS_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CAMPAIGN_STATUS_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CAMPAIGN_STATUS_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_CAMPAIGN_STATUS_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_CAMPAIGN_STATUS_DETAIL.replace(':id', id), data)
      .then((data) => new CampaignStatusEntity(data))
    ;
  }
}
// Make alias
const _static = CampaignStatusModel;

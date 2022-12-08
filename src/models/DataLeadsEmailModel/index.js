//
import Model from '../Model';
//
import DataLeadsEmailEntity from '../DataLeadsEmailEntity';
import DataLeadsEmailCampaignEntity from '../DataLeadsEmailCampaignEntity';

/**
 * @class DataLeadsEmailModel
 */
export default class DataLeadsEmailModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'data_leads_email';

  /**
   * @var {Ref}
   */
  _entity = DataLeadsEmailEntity;

  /** @var {String} */
  static API_DATA_LEAD_EMAIL_LIST = 'data-leads-mail';
  /** @var {String} */
  static API_DATA_LEAD_EMAIL_DETAIL = 'data-leads-mail/:id';
  /** @var {String} */
  static API_DATA_LEAD_EMAIL_GET_OPTS_CAMPAIGN = 'data-leads-mail/get-options-campaign';
  /** @var {String} */
  static API_DATA_LEAD_EMAIL_GET_CAMPAIGN = 'data-leads-mail/:campaign_id/get-campaign';

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'email_id';

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
    return this._api.get(_static.API_DATA_LEAD_EMAIL_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_DATA_LEAD_EMAIL_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_DATA_LEAD_EMAIL_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_DATA_LEAD_EMAIL_DETAIL.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DATA_LEAD_EMAIL_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_EMAIL_DETAIL.replace(':id', id), data)
      .then((data) => new DataLeadsEmailEntity(data))
    ;
  }

  /**
   * @see https://trello.com/c/lIWSEsfc/317-integrate-email-service
   */
  getOptionsCampaign(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_EMAIL_GET_OPTS_CAMPAIGN, data);
  }

  /**
   * @see https://trello.com/c/lIWSEsfc/317-integrate-email-service
   */
  getCampaign(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_EMAIL_GET_CAMPAIGN.replace(':campaign_id', id), data)
      .then(data => new DataLeadsEmailCampaignEntity(data));
  }
}
// Make alias
const _static = DataLeadsEmailModel;

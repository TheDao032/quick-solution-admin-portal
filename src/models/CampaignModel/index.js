//
import Model from '../Model';
import CampaignEntity from '../CampaignEntity';

// Util(s)

/**
 * @class CampaignModel
 */
export default class CampaignModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'campaigns';

  /**
   * @var {Ref}
   */
  _entity = CampaignEntity;

  /** @var {String} */
  static API_CAMPAIGN_LIST = 'campaign';
  /** @var {String} */
  static API_CAMPAIGN_OPTS = 'campaign/get-options';
  /** @var {String} */
  static API_CAMPAIGN_CREATE = 'campaign';
  /** @var {String} */
  static API_CAMPAIGN_UPDATE = 'campaign/:id'; // PUT
  /** @var {String} */
  static API_CAMPAIGN_READ = 'campaign/:id'; // GET
  /** @var {String} */
  static API_CAMPAIGN_DELETE = 'campaign/:id'; // DELETE
  /** @var {String} */
  static API_CAMPAIGN_CHANGE_STATUS = 'campaign/:id/change-status';
  /** @var {String} */
  static API_CAMPAIGN_APPROVED_REVIEW_LIST = 'campaign/:id/approved-review-list'; // PUT

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'campaign_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => new CampaignEntity();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CAMPAIGN_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_CAMPAIGN_OPTS, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptionsFull(_opts)
  {
    // Format options
    let opts = _opts || {};
    let apiOpts = Object.assign({
      itemsPerPage: 256, // Number.MAX_SAFE_INTEGER // @TODO: get all records
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ campaign_id: id, campaign_name: name, description }) => {
              // Nam trong list exclude --> set null
              if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
                return null;
              }
              return ({ name, id, description });
            }
        );
        // Filter null items
        return ret.filter(item => item);
      });
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('Campaign#create: ', data);
    //
    return this._api.post(_static.API_CAMPAIGN_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CAMPAIGN_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   *
   */
  approvedReviewList(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CAMPAIGN_APPROVED_REVIEW_LIST.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_CAMPAIGN_READ.replace(':id', id), data)
      .then((data) => new CampaignEntity(data))
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
    return this._api.put(_static.API_CAMPAIGN_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_CAMPAIGN_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = CampaignModel;

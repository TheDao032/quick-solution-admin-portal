//
import Model from '../Model';
import CampaignReviewLevelEntity from '../CampaignReviewLevelEntity';

// Util(s)

/**
 * @class CampaignReviewLevelModel
 */
export default class CampaignReviewLevelModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'campaign_review_levels';

  /**
   * @var {Ref}
   */
  _entity = CampaignReviewLevelEntity;

  /**
   * @var {String}
   */
  static API_CAMPAIGN_REVIEW_LEVEL_LIST = 'campaign-review-level';
  /** @var {String} */
  static API_CAMPAIGN_REVIEW_LEVEL_DETAIL = 'campaign-review-level/:id';
  /** @var {String} */
  static API_CAMPAIGN_REVIEW_LEVEL_OPTS = 'campaign-review-level/get-options';
  /** @var {String} */
  static API_CAMPAIGN_REVIEW_LEVEL_CHANGE_STATUS = 'campaign-review-level/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'campaign_review_level_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "campaign_type_id": "",
    "campaign_review_level_name": "",
    "order_index": 0,
    "description": "",
    // "company_id": "",
    // "department_id": "",
    "review_users": [], // 1 - n
    "is_complete_review": 0,
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CAMPAIGN_REVIEW_LEVEL_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_CAMPAIGN_REVIEW_LEVEL_OPTS, opts);
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
      itemsPerPage: 512, // @TODO: get all records
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    // @TODO:
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ campaign_review_level_id: id, campaign_review_level_name: name, ...item }) => {
              // Nam trong list exclude --> set null
              if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
                return null;
              }
              return ({ name, id, ...item });
            }
        );
        // Filter null items
        return ret.filter(item => item);
      });
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_CAMPAIGN_REVIEW_LEVEL_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CAMPAIGN_REVIEW_LEVEL_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CAMPAIGN_REVIEW_LEVEL_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_CAMPAIGN_REVIEW_LEVEL_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_CAMPAIGN_REVIEW_LEVEL_DETAIL.replace(':id', id), data)
      .then((data) => new CampaignReviewLevelEntity(data))
    ;
  }
}
// Make alias
const _static = CampaignReviewLevelModel;

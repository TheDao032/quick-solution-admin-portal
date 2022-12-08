//
import Model from '../Model';
import NewsStatusEntity from '../NewsStatusEntity';

// Util(s)

/**
 * @class NewsStatusModel
 */
export default class NewsStatusModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'news-status';

  /** @var {Ref} */
  _entity = NewsStatusEntity;

  /**
   * @var {String}
   */
  static API_NEWS_STATUS_LIST = 'news-status';
  /** @var {String} */
  static API_NEWS_STATUS_DETAIL = 'news-status/:id';
  /** @var {String} */
  static API_NEWS_STATUS_OPTS = 'news-status/get-options';
  /** @var {String} */
  static API_NEWS_STATUS_CHANGE_STATUS = 'news-status/:id/change-status';

  /** @var {String} Primary Key */
  primaryKey = 'news_status_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "news_status_id": "",
    "news_status_name": "",
    "user": "",
    "create_date": "",
    "is_active": 1,
    "is_system": 0,
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_NEWS_STATUS_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_NEWS_STATUS_OPTS, opts);
  }
  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_NEWS_STATUS_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_NEWS_STATUS_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_NEWS_STATUS_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_NEWS_STATUS_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_NEWS_STATUS_DETAIL.replace(':id', id), data)
      .then((data) => new NewsStatusEntity(data))
    ;
  }
}
// Make alias
const _static = NewsStatusModel;

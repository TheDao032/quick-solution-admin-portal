//
import Model from '../Model';
import NewsCategoryEntity from '../NewsCategoryEntity';

// Util(s)

/**
 * @class NewsCategoryModel
 */
export default class NewsCategoryModel extends Model {
  /** @var {String} redux store::state key */
  _stateKeyName = 'news-category';

  /** @var {Ref} */
  _entity = NewsCategoryEntity;

  /**
   * @var {String}
   */
  static API_NEWS_CATEGORY_LIST = 'news-category';
  /** @var {String} */
  static API_NEWS_CATEGORY_DETAIL = 'news-category/:id';
    /** @var {String} */
    static API_NEWS_CATEGORY_OPTS = 'news-category/:id/get-options';
  /** @var {String} */
  static API_NEWS_CATEGORY_CHANGE_STATUS = 'news-category/:id/change-status';
  /** @var {String} */
  static API_NEWS_CATEGORY_CHECKED_PARENT = 'news-category/:id/check-parent';

  /** @var {String} Primary Key */
  primaryKey = 'news_category_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "news_category_id": null,
    "parent_id": null,
    "news_category_name": null,
    "category_level": "",
    "pictures": "",
    "image_file_id": null,
    "description": null,
    "meta_key_words": null,
    "meta_descriptions": null,
    "meta_title": null,
    "seo_name": null,
    "order_index": 0,
    "create_date": null,
    "is_active": 1,
    "is_cate_video": 0,
    "is_system": 0,
  });

  /**
   *
   */
  getList(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_NEWS_CATEGORY_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(id, _data = {}) {
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_NEWS_CATEGORY_OPTS.replace(':id', id), data)
  }
  /**
   *
   */
  create(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_NEWS_CATEGORY_LIST, data);
  }

  /**
   *
   */
  update(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_NEWS_CATEGORY_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_NEWS_CATEGORY_CHANGE_STATUS.replace(':id', id), data);
  }

  checkParent(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_NEWS_CATEGORY_CHECKED_PARENT.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_NEWS_CATEGORY_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_NEWS_CATEGORY_DETAIL.replace(':id', id), data)
      .then((data) => new NewsCategoryEntity(data))
      ;
  }
}
// Make alias
const _static = NewsCategoryModel;

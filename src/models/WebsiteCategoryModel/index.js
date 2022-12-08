// Model(s)/Enties
import Model from '../Model';
import WebsiteCategoryEntity from '../WebsiteCategoryEntity';

/**
 * @class WebsiteCategoryModel
 */
export default class WebsiteCategoryModel extends Model {
  /** @var {String} redux store::state key */
  _stateKeyName = 'website-category';

  /** @var {Ref} */
  _entity = WebsiteCategoryEntity;

  /** @var {String} */
  static API_WEBSITE_CATEGORY_LIST = 'website-category';
  /** @var {String} */
  static API_WEBSITE_CATEGORY_CREATE = 'website-category';
  /** @var {String} */
  static API_WEBSITE_CATEGORY_UPDATE = 'website-category/:id'; // PUT
  /** @var {String} */
  static API_WEBSITE_CATEGORY_READ = 'website-category/:id'; // GET
  /** @var {String} */
  static API_WEBSITE_CATEGORY_DELETE = 'website-category/:id'; // DELETE
  /** @var {String} */
  static API_WEBSITE_CATEGORY_CHANGE_STATUS = 'website-category/:id/change-status';
  /** @var {String} */  
  static API_WEBSITE_CATEGORY_OPTS = 'website-category/get-options';
  /** @var {String} */
  static API_WEBSITE_CATEGORY_OPTS_PARENT = 'website-category/get-options-parent';
  /** @var {String} */
  static API_WEBSITE_CATEGORY_OPTS_WEBSITE = 'website-category/get-options-website';
  /** @var {String} */
  static API_WEBSITE_READ = 'website-category/get-website/:id';
  /** @var {String} */
  static API_WEBSITE_CATEGORY_CHECKED_PARENT = 'website-category/:id/check-parent';
  static API_NEWS_CATEGORY_OPTS = 'news-category/:id/get-options';
  static API_PRODUCT_CATEGORY_LIST_OPTS = 'product-category/get-options-for-list';  
  static API_MANUFACTURER_OPTS = 'manufacturer/get-options';

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'web_category_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "web_category_id": null,
    "category_name": null,
    "cate_parent_id": null,
    "cate_parent_name": null,
    "website_id": null,
    "website_name": null,
    "url_category": "",
    "is_active": 1,
    "created_date": null,
    "user": ""
  });

  /**
   * 
   * @param {object} data
   */

  /**
   * Get list
   * @returns Promise
   */
  list(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_WEBSITE_CATEGORY_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_WEBSITE_CATEGORY_OPTS, opts);
  }
  getOptionsParent(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_WEBSITE_CATEGORY_OPTS_PARENT, opts);
  }

  getOptionsWebsite(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_WEBSITE_CATEGORY_OPTS_WEBSITE, opts);
  }

  getOptionsForListProductCategory(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRODUCT_CATEGORY_LIST_OPTS, opts);
  }
  
  getOptionsForListNewsCategory(id, _data = {}) {
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_NEWS_CATEGORY_OPTS.replace(':id', id), data)
  }
  getOptionsForListManufacturer(id, _data = {}) {
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_MANUFACTURER_OPTS.replace(':id', id), data)
  }
  /**
   * @return {Promise}
   */
  create(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('WebsiteCategory#create: ', data);
    //
    return this._api.post(_static.API_WEBSITE_CATEGORY_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  changeStatus(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_WEBSITE_CATEGORY_CHANGE_STATUS.replace(':id', id), data);
  }
  checkParent(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_WEBSITE_CATEGORY_CHECKED_PARENT.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_WEBSITE_CATEGORY_READ.replace(':id', id), data)
      .then((data) => new WebsiteCategoryEntity(data));
  }
  readWebsite(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_WEBSITE_READ.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_WEBSITE_CATEGORY_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.delete(_static.API_WEBSITE_CATEGORY_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = WebsiteCategoryModel;

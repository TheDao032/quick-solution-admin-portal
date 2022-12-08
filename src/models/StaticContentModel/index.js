// Model(s)/Enties
import Model from '../Model';
import StaticContentEntity from '../StaticContentEntity';

/**
 * @class StaticContentModel
 */
export default class StaticContentModel extends Model {
  /** @var {String} redux store::state key */
  _stateKeyName = 'static-content';

  /** @var {Ref} */
  _entity = StaticContentEntity;

  /** @var {String} */
  static API_STATIC_CONTENT_LIST = 'static-content';
  /** @var {String} */
  static API_STATIC_CONTENT_CREATE = 'static-content';
  /** @var {String} */
  static API_STATIC_CONTENT_UPDATE = 'static-content/:id'; // PUT
  /** @var {String} */
  static API_STATIC_CONTENT_READ = 'static-content/:id'; // GET
  /** @var {String} */
  static API_STATIC_CONTENT_DELETE = 'static-content/:id'; // DELETE
  /** @var {String} */
  static API_STATIC_CONTENT_CHANGE_STATUS = 'static-content/:id/change-status';
  /** @var {String} */
  static API_STATIC_CONTENT_OPTS = 'website-category/get-options';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'static_content_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "static_content_id": 0,
    "static_title": null,
    "system_name": null,
    "webcategory_id": 0,
    "category_name": null,
    "static_content": null,
    "meta_data_scriptions": null,
    "meta_keywords": null,
    "meta_title": null,
    "seo_name": null,
    "display_order": null,
    "is_active": 1,
    "is_childrent":0
  });

  /**
   * 
   * @param {object} data
   */
  // constructor(data) { super(data); }

  /**
   * Get list
   * @returns Promise
   */
  list(_opts = {}) {
    let opts = Object.assign({
    }, _opts);
    return this._api.get(_static.API_STATIC_CONTENT_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_STATIC_CONTENT_OPTS, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_STATIC_CONTENT_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_STATIC_CONTENT_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_STATIC_CONTENT_READ.replace(':id', id), data)
      .then((data) => new StaticContentEntity(data))
      ;
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_STATIC_CONTENT_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_STATIC_CONTENT_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = StaticContentModel;
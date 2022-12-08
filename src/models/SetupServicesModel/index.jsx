//
import Model from '../Model';
//
import SetupServicesEntity from '../SetupServicesEntity';

// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class StatusDataLeadModel
 */
export default class SetupServicesModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'setup-service';

/** @var {String} */
static API_SETUP_SERVICES_LIST = 'setup-service';
/** @var {String} */
static API_SETUP_SERVICES_CREATE = 'setup-service';
/** @var {String} */
static API_SETUP_SERVICES_UPDATE = 'setup-service/:id'; // PUT
/** @var {String} */
static API_SETUP_SERVICES_READ = 'setup-service/:id'; // GET
/** @var {String} */
static API_SETUP_SERVICES_DELETE = 'setup-service/:id'; // DELETE
/** @var {String} */
static API_SETUP_SERVICES_CHANGE_STATUS = 'setup-service/:id/change-status';
/** @var {String} */
static API_GET_META_KEYWORD = 'setup-service/get-meta-keyword';
/** @var {String} */
static API_CHECK_META_KEYWORD = 'setup-service/check-meta-keyword';
/** @var {String} */  
static API_WEBSITE_CATEGORY_OPTS = 'website-category/get-options';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'news_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
  /** @var {String} */
  static defaultImgBase64 = SetupServicesEntity.defaultImgBase64;

  /**
   * @return {Object}
   */
  fillable = () => ({
    "setup_service_id": 0,
    "setup_service_title": "",
    "webcategory_id": null,
    "description": null,
    "system_name_setup": null,
    "short_description": null,
    "content": "",
    "meta_key_words": "",
    "meta_descriptions": null,
    "meta_title": null,
    "seo_name": "",
    "image_file_id": null,
    "image_url": "",
    "small_thumbnail_image_url": "",
    "medium_thumbnail_image_url": "",
    "large_thumbnail_image_url": "",
    "xlarge_thumbnail_image_url": "",
    "small_thumbnail_image_file_id": null,
    "medium_thumbnail_image_file_id": null,
    "large_thumbnail_image_file_id": null,
    "xlarge_thumbnail_image_file_id": null,
    "is_active": 1,
    "is_system": 0,
    "is_show_home": 0,
    "is_service_package": 0,
    "user": null,
    "create_date": ""
});

  getMetaKeyword(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_GET_META_KEYWORD, data);
  }

  checkMetaKeyword(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CHECK_META_KEYWORD, data);
  }

  /**
   * Get list
   * @returns Promise
   */
  list(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_SETUP_SERVICES_LIST, opts);
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_WEBSITE_CATEGORY_OPTS, opts);
  }
  /**
   * @return {Promise}
   */
  create(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('WebsiteCategory#create: ', data);
    //
    return this._api.post(_static.API_SETUP_SERVICES_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  changeStatus(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_SETUP_SERVICES_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_SETUP_SERVICES_READ.replace(':id', id), data)
      .then((data) => new SetupServicesEntity(data));
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_SETUP_SERVICES_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.delete(_static.API_SETUP_SERVICES_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = SetupServicesModel;

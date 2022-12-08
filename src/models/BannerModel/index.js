//
import Model from '../Model';
import BannerEntity from '../BannerEntity';

// Util(s)

/**
 * @class BannerModel
 */
export default class BannerModel extends Model {
  /** @var {String} redux store::state key */
  _stateKeyName = 'banner';

  /** @var {Ref} */
  _entity = BannerEntity;

  /**
   * @var {String}
   */
  static API_BANNER_LIST = 'banner';
  /** @var {String} */
  static API_BANNER_DETAIL = 'banner/:id';
  /** @var {String} */
  static API_BANNER_CHANGE_STATUS = 'banner/:id/change-status';
  /** @var {String} */
  static API_BANNER_OPTS = 'bannertype/get-options';
  /** @var {String} */
  static API_WEBSITE_CATEGORY_OPTS = 'website-category/get-options';
  /** @var {String} */
  static API_POSITIONBANNER_OPTS = 'banner/get-location';

  /** @var {String} Primary Key */
  primaryKey = 'banner_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    /** @var {Number} */
    banner_id: 0,
    /** @var {Number} */
    banner_type_id: "",
    /** @var {String} */
    banner_type_name: "",
    /**@var {Number} */
    web_category_id: "",
    /** @var {String} */
    picture_alias: "",
    /** @var {String} */
    system_name: "",
    /** @var {String} */
    web_category_name: "",
    /** @var {String} */
    picture_url: "",
    /** @var {String} */
    descriptions: "",
    /** @var {String} */
    create_date: '',
    /** @var {Number|String} */
    is_active: 1,
    // /** @var {Number|String} */
    is_slide: 0
  });

  /**
   *
   */
  getList(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_BANNER_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsBannerType(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_BANNER_OPTS, opts);
  }
  getOptionsWebCategory(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_WEBSITE_CATEGORY_OPTS, opts);
  }
  getOptionsPositionBanner(_opts = {}) {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_POSITIONBANNER_OPTS, opts);
  }
  /**
   *
   */
  create(_data = {}) {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_BANNER_LIST, data);
  }

  /**
   *
   */
  update(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_BANNER_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_BANNER_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_BANNER_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {}) {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_BANNER_DETAIL.replace(':id', id), data)
      .then((data) => new BannerEntity(data))
      ;
  }
}
// Make alias
const _static = BannerModel;

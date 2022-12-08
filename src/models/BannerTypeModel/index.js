// Model(s)/Enties
import Model from '../Model';
import BannerTypeEntity from '../BannerTypeEntity';

/**
 * @class BannerTypeModel
 */
export default class BannerTypeModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'banner-type';

  /** @var {Ref} */
  _entity = BannerTypeEntity;

  /** @var {String} */
  static API_BANNER_TYPE_LIST = 'bannertype';
  /** @var {String} */
  static API_BANNER_TYPE_CREATE = 'bannertype';
  /** @var {String} */
  static API_BANNER_TYPE_UPDATE = 'bannertype/:id'; // PUT
  /** @var {String} */
  static API_BANNER_TYPE_READ = 'bannertype/:id'; // GET
  /** @var {String} */
  static API_BANNER_TYPE_DELETE = 'bannertype/:id'; // DELETE
  /** @var {String} */
  static API_BANNER_TYPE_CHANGE_STATUS = 'bannertype/:id/change-status';
  /** @var {String} */
  static API_BANNER_TYPE_CHECKED_PARENT = 'bannertype/:id/check-parent';

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'banner_type_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "banner_type_id": "",
    "banner_type_name": "",
    "descriptions": "",
    "is_show_home": 0,
    "is_active": 1,
    "created_date": ""
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
  list(_opts = {})
  {
    let opts = Object.assign({
      // itemsPerPage:,
      // page,
      // is_active
      // is_system
    }, _opts);
    return this._api.get(_static.API_BANNER_TYPE_LIST, opts);
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
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE,
      is_active: 1,
      exclude_id: []
    }, opts /*opts['_api']*/);
    // delete opts['_api'];

    //
    return this.list(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map((item) => {
          let id = item.banner_type_id;
          // Nam trong list exclude --> set null
          if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
            return null;
          }
          return Object.assign(item, { id, name: item.banner_type_name });
        });
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
    console.log('BannerType#create: ', data);
    //
    return this._api.post(_static.API_BANNER_TYPE_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_BANNER_TYPE_CHANGE_STATUS.replace(':id', id), data);
  }
  checkParent(id, _data) {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_BANNER_TYPE_CHECKED_PARENT.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_BANNER_TYPE_READ.replace(':id', id), data)
      .then((data) => new BannerTypeEntity(data))
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
    return this._api.put(_static.API_BANNER_TYPE_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_BANNER_TYPE_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = BannerTypeModel;

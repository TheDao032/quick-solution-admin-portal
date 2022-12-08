//
import Model from '../Model';
//
import StoreEntity from '../StoreEntity';

/**
 * @class StoreModel
 */
export default class StoreModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'stores';

  /**
   * @var {Ref}
   */
  _entity = StoreEntity;

  /**
   * @var {String}
   */
  static API_STORE_LIST = 'store';
  /** @var {String} */
  static API_STORE_DETAIL = 'store/:id';
  /** @var {String} */
  static API_STORE_OPTS = 'store/get-options';
  /** @var {String} */
  static API_STORE_CHANGE_STATUS = 'store/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'store_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
/**

  /**
   * @return {Object}
   */
  fillable = () => ({

    "store_id": null,
    "store_name":"",
    "phone_number":"",
    "area_id":null,
    "company_id":null,
    "description":"",
    "location_x":"",
    "location_y":"",
    "province_id":null,
    "district_id":null,
    "ward_id":null,
    "address":"",
    "is_active":1
  });

  

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_STORE_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_STORE_OPTS, opts);
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
          ({ STORE_id: id, STORE_name: name, description }) => {
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
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('data',data);
    return this._api.post(_static.API_STORE_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_STORE_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_STORE_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_STORE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_STORE_DETAIL.replace(':id', id), data)
      .then((data) => new StoreEntity(data))
    ;
  }
}
// Make alias
const _static = StoreModel;

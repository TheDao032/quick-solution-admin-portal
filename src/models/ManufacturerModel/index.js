//
import Model from '../Model';
import ManufacturerEntity from '../ManufacturerEntity';

// Util(s)

/**
 * @class ManufacturerModel
 */
export default class ManufacturerModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'manufacturer';

  /**
   * @var {Ref}
   */
  _entity = ManufacturerEntity;

  /**
   * @var {String}
   */
  static API_MANUFACTURER_LIST = 'manufacturer';
  /** @var {String} */
  static API_MANUFACTURER_DETAIL = 'manufacturer/:id';
  /** @var {String} */
  static API_MANUFACTURER_OPTS = 'manufacturer/get-options';
  /** @var {String} */
  static API_MANUFACTURER_CHANGE_STATUS = 'manufacturer/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'manufacturer_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => ({});

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_MANUFACTURER_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_MANUFACTURER_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_MANUFACTURER_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_MANUFACTURER_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_MANUFACTURER_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_MANUFACTURER_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_MANUFACTURER_DETAIL.replace(':id', id), data)
      .then((data) => new ManufacturerEntity(data))
    ;
  }
}
// Make alias
const _static = ManufacturerModel;

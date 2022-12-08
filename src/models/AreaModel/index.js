//
import Model from '../Model';
import AreaEntity from '../AreaEntity';

// Util(s)

/**
 * @class AreaModel
 */
export default class AreaModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'area';

  /**
   * @var {Ref}
   */
  _entity = AreaEntity;

  /**
   * @var {String}
   */
  static API_AREA_LIST = 'area';
  /** @var {String} */
  static API_AREA_DETAIL = 'area/:id';
  /** @var {String} */
  static API_AREA_OPTS = 'area/get-options';
  /** @var {String} */
  static API_AREA_CHANGE_STATUS = 'area/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'area_id';

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
    return this._api.get(_static.API_AREA_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_AREA_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_AREA_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_AREA_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_AREA_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_AREA_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_AREA_DETAIL.replace(':id', id), data)
      .then((data) => new AreaEntity(data))
    ;
  }
}
// Make alias
const _static = AreaModel;

//
import Model from '../Model';
//
import BusinessTypeEntity from '../BusinessTypeEntity';

// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class BusinessTypeModel
 */
export default class BusinessTypeModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'business_types';

  /**
   * @var {Ref}
   */
  _entity = BusinessTypeEntity;

  /**
   * @var {String}
   */
  static API_BUSINESS_TYPE_LIST = 'business-type';
  /** @var {String} */
  static API_BUSINESS_TYPE_DETAIL = 'business-type/:id';
  /** @var {String} */
  static API_BUSINESS_TYPE_OPTS = 'business-type/get-options';
  /** @var {String} */
  static API_BUSINESS_TYPE_CHANGE_STATUS = 'business-type/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'business_type_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "business_type_id": null,
    "business_type_name": "",
    "business_id": null,
    "descriptions": "",
    "order_index": 0,
    "is_active": 0,
    "is_system": 0,
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_BUSINESS_TYPE_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_BUSINESS_TYPE_OPTS, opts);
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
          ({ business_type_id: id, business_type_name: name, description }) => {
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
    return this._api.post(_static.API_BUSINESS_TYPE_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_BUSINESS_TYPE_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_BUSINESS_TYPE_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_BUSINESS_TYPE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_BUSINESS_TYPE_DETAIL.replace(':id', id), data)
      .then((data) => new BusinessTypeEntity(data))
    ;
  }
}
// Make alias
const _static = BusinessTypeModel;

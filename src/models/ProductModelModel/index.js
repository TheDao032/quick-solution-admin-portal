//
import Model from '../Model';
import ProductModelEntity from '../ProductModelEntity';

// Util(s)

/**
 * @class ProductModelModel
 */
export default class ProductModelModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'product-model';

  /**
   * @var {Ref}
   */
  _entity = ProductModelEntity;

  /** @var {String} */
  static API_PRODUCT_MODEL_OPTS = 'product-model/get-options';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'product_model_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => new ProductModelEntity();

  /**
   *
   */
  // getList(_data = {})
  // {
  //   // Validate data?!
  //   let data = Object.assign({}, _data);
  //   return this._api.get(_static.API_PRODUCT_LIST, data);
  // }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRODUCT_MODEL_OPTS, opts);
  }

  // exportExcel(opts)
  // {
  //   const header = {
  //     responseType: 'blob',
  //   }
  //   return this._api.get(_static.API_EXPORT_EXCEL, opts, header);
  // }

  /**
   *
   */
  // create(_data = {})
  // {
  //   // Validate data?!
  //   let data = Object.assign({}, this.fillable(), _data);
  //   return this._api.post(_static.API_PRODUCT_LIST, data);
  // }

  /**
   *
   */
  // edit(id, _data)
  // {
  //   // Validate data?!
  //   let data = Object.assign({}, _data);
  //   //
  //   return this._api.put(_static.API_PRODUCT_DETAIL.replace(':id', id), data);
  // }
  /**
   *
   */
  // changeStatus(id, _data)
  // {
  //   // Validate data?!
  //   let data = Object.assign({}, _data);
  //   //
  //   return this._api.put(_static.API_PRODUCT_CHANGE_STATUS.replace(':id', id), data);
  // }
  /**
   * @return {Promise}
   */
  // delete(id, _data = {})
  // {
  //   // Validate data?!
  //   let data = Object.assign({}, _data);
  //   //
  //   return this._api.delete(_static.API_PRODUCT_DELETE.replace(':id', id), data);
  // }

  /**
   *
   */
  // read(id, _data = {})
  // {
  //   // Validate data?!
  //   let data = Object.assign({}, _data);
  //   //
  //   return this._api.get(_static.API_PRODUCT_DETAIL.replace(':id', id), data)
  //     .then((data) => new ProductEntity(data))
  //   ;
  // }
}
// Make alias
const _static = ProductModelModel;

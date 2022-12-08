//
import Model from '../Model';
import ProductCategoryEntity from '../ProductCategoryEntity';

// Util(s)

/**
 * @class ProductCategoryModel
 */
export default class ProductCategoryModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'product-category';

  /**
   * @var {Ref}
   */
  _entity = ProductCategoryEntity;

  /**
   * @var {String}
   */
  static API_PRODUCT_CATEGORY_LIST = 'product-category';
  /** @var {String} */
  static API_PRODUCT_CATEGORY_DETAIL = 'product-category/:id';
  /** @var {String} */
  static API_PRODUCT_CATEGORY_OPTS = 'product-category/get-options';
  /** @var {String} */
  static API_PRODUCT_CATEGORY_LIST_OPTS = 'product-category/get-options-for-list';
  /** @var {String} */
  static API_PRODUCT_CATEGORY_CREATE_OPTS = 'product-category/get-options-for-create';
  /** @var {String} */
  static API_PRODUCT_CATEGORY_CHANGE_STATUS = 'product-category/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'product_category_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => ({
    "product_category_id": "",
    "category_name": "",
    "name_show_web": "",
    "is_show_web": 1,
    "seo_name": "",
    "parent_name": "",
    "company_name": "",
    "created_full_name": "",
    "icon_url": "",
    "is_active": 1,
    "list_attribute": "",
    "url_category": "",
    "parent_id": null,
    "company_id": null,
    "add_function_id": null,
    "edit_function_id": null,
    "delete_function_id": null,
    "view_function_id": null
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_PRODUCT_CATEGORY_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRODUCT_CATEGORY_OPTS, opts);
  }

  /**
   * Get options for list (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsForList(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRODUCT_CATEGORY_LIST_OPTS, opts);
  }

   /**
   * Get options for create (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsForCreate(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRODUCT_CATEGORY_CREATE_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_PRODUCT_CATEGORY_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PRODUCT_CATEGORY_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PRODUCT_CATEGORY_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PRODUCT_CATEGORY_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PRODUCT_CATEGORY_DETAIL.replace(':id', id), data)
      .then((data) => new ProductCategoryEntity(data))
    ;
  }
}
// Make alias
const _static = ProductCategoryModel;

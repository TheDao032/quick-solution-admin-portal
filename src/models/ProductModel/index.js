//
import Model from '../Model';
import ProductEntity from '../ProductEntity';

// Util(s)

/**
 * @class ProductModel
 */
export default class ProductModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'product';

  /**
   * @var {Ref}
   */
  _entity = ProductEntity;

  /** @var {String} */
  static API_PRODUCT_LIST = 'product';
  /** @var {String} */
  static API_PRODUCT_OPTS = 'product/get-options';
  /** @var {String} */
  static API_PRODUCT_DETAIL = 'product/:id'; //GET
  /** @var {String} */
  static API_PRODUCT_DELETE = 'product/:id'; //DELETE
  /** @var {String} */
  static API_PRODUCT_CHANGE_STATUS = 'product/:id/change-status'; //PUT
  /** @var {String} */
  static API_PRODUCT_EXPORT_EXCEL = 'product/export-excel';
  /**
   * @var {String} Primary Key
   */
  static primaryKey = ProductEntity.primaryKey;

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillableProduct = () => ({
    product_category_id: "",
    product_code: "",
    product_name: "",
    product_name_show_web: "",
    note: "",
    descriptions: "",
    product_content_detail: "",
    short_description: "",
    is_show_web: 0,
    is_service: 0,
    is_active: 1,
    is_sell_well: 0,
    is_high_light: 0,
    product_imei: "",
    manufacturer_id: "",
    lot_number: "",
    model_id: "",
    origin_id: "",
    businesses: [],
    attribute_values: [],
    pictures: [],
    status_product_id: null,
  });

  /**
   * @var {Object}
   */
  fillableService = () => ({
    product_category_id: "",
    product_code: "",
    product_name: "",
    product_name_show_web: "",
    note: "",
    descriptions: "",
    product_content_detail: "",
    short_description: "",
    is_show_web: 0,
    is_service: 1,
    is_active: 1,
    product_imei: "",
    manufacturer_id: "",
    lot_number: "",
    model_id: "",
    origin_id: "",
    businesses: [],
    attribute_values: [],
    pictures: [],
    pt_level_id: "",
    values_in: "",
    is_amount_days: null,
    is_session: null,
    is_freeze: 0,
    is_tranfer: 0,
    is_sell_well: 0,
    is_high_light: 0,
    time_limit: "",
    time_per_session: "",
    is_product_off_peak: 0,
    is_apply_mon: 0,
    is_apply_tu: 0,
    is_apply_we: 0,
    is_apply_th: 0,
    is_apply_fr: 0,
    is_apply_sa: 0,
    is_apply_sun: 0,
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_PRODUCT_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRODUCT_OPTS, opts);
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
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ product_id: id, product_name: name, description }) => {
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

  exportExcel(opts)
  {
    const header = {
      responseType: 'blob',
    }
    return this._api.get(_static.API_PRODUCT_EXPORT_EXCEL, opts, header);
  }

  /** format data */
  formatData(data){
    if((1 * data.is_service) === 1){
			delete data.origin_id;
			delete data.model_id;
			//delete data.manufacturer_id;
			delete data.attribute_values;
			delete data.lot_number;
      delete data.product_imei;

      data.values_in = (1 * data.values_in);
      data.manufacturer_id = 0;
		}
		else {
			delete data.values_in;
			delete data.is_year;
			delete data.is_month;
			delete data.is_day;
      delete data.pt_level_id;
      
      data.attribute_values = data.attribute_values.filter(attr => attr.product_attribute_id);
      data.origin_id = data.origin_id ? data.origin_id : 0;
      data.model_id = data.model_id ? data.model_id : 0;
    }
    return data;
  }
  /**
   *
   */
  create(_data = {}, isCheckService)
  {
    // Validate data?!
    let data = Object.assign({}, !isCheckService ? this.fillableProduct() : this.fillableService(), _data);
    return this._api.post(_static.API_PRODUCT_LIST, this.formatData(data));
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PRODUCT_DETAIL.replace(':id', id), this.formatData(data));
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PRODUCT_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PRODUCT_DELETE.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PRODUCT_DETAIL.replace(':id', id), data)
      .then((data) => new ProductEntity(data))
    ;
  }
}
// Make alias
const _static = ProductModel;

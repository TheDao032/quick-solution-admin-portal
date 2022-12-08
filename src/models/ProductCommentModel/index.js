//
import Model from '../Model';
import ProductCommentEntity from '../ProductCommentEntity';

// Util(s)

/**
 * @class ProductCommentModel
 */
export default class ProductCommentModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'commentproduct';

  /**
   * @var {Ref}
   */
  _entity = ProductCommentEntity;

  /** @var {String} */
  static API_PRODUCT_LIST = '/comment/product';
  /** @var {String} */
  static API_PRODUCT_COMMENT_LIST = '/comment/:id';
  /** @var {String} */
  static API_PRODUCT_COMMENT_DETAIL = 'comment/:id/detailcomment'; //GET
   /** @var {String} */
   static API_PRODUCT_COMMENT_REPLY_DETAIL = '/comment/:id/detailcommentreply'; //GET
  /** @var {String} */
  static API_PRODUCT_COMMENT_DELETE = 'comment/:id'; //DELETE
  /** @var {String} */
  static API_PRODUCT_COMMENT_EXPORT_EXCEL = 'commet/export-excel';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'comment_id';

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
   * List product list exist comment
   */
  getProductList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_PRODUCT_LIST, data);
  }

/**
   *
   */
  getProductCommentList(id,_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_PRODUCT_COMMENT_LIST.replace(':id', id), data);
  }
  

  exportExcel(opts)
  {
    const header = {
      responseType: 'blob',
    }
    return this._api.get(_static.API_PRODUCT_EXPORT_EXCEL, opts, header);
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
   * @return {Promise}
   */
  deleteComment(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PRODUCT_COMMENT_DELETE.replace(':id', id), data);
  }

  /**
   *
   */
  readComment(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PRODUCT_COMMENT_DETAIL.replace(':id', id), data)
      .then((data) => new ProductCommentEntity(data))
    ;
  }
  
  /**
   *
   */
  readCommentReply(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PRODUCT_COMMENT_REPLY_DETAIL.replace(':id', id), data)
      .then((data) => new ProductCommentEntity(data))
    ;
  }
}
// Make alias
const _static = ProductCommentModel;

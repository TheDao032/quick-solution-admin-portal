//
import Model from '../Model';
import PriceEntity from '../PriceEntity';

// Util(s)

/**
 * @class PriceModel
 */
export default class PriceModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'prices';

  /**
   * @var {Ref}
   */
  _entity = PriceEntity;

  /**
   * @var {String}
   */
  static API_PRICE_LIST = 'sl-prices';
  /** @var {String} */
  static API_PRICE_DETAIL = 'sl-prices/:id';
  /** @var {String} */
  static API_PRICE_OPTS = 'sl-prices/get-options';
  /** @var {String} */
  static API_PRICE_CHANGE_STATUS = 'sl-prices/:id/change-status';
  static API_AREA_BY_OUTPUT_TYPE = 'sl-prices/list-area-by-output-type';
  static API_BUSINESS_BY_AREA = 'sl-prices/list-business-by-area';
  static API_OUTPUT_TYPE_PRICE = 'sl-prices/list-output-type';
  static API_UPDATE_PRICE_APPROVE_REVIEW = '/sl-prices/:id/approved-review-list';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'price_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
/**

  /**
   * @var {Object}
   */
  fillable = () => this.mkEnt();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_PRICE_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PRICE_OPTS, opts);
  }

  getAreaByOutputType(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_AREA_BY_OUTPUT_TYPE, opts);
  }

  getBusinessByArea(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_BUSINESS_BY_AREA, opts);
  }

  getOutputType(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_OUTPUT_TYPE_PRICE, opts);
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
          ({ price_id: id, price_name: name, description }) => {
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
    return this._api.post(_static.API_PRICE_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PRICE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  updateApproveReview(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_UPDATE_PRICE_APPROVE_REVIEW.replace(':id', id), data);
  }
  
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PRICE_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PRICE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_PRICE_DETAIL.replace(':id', id), data)
      .then((data) => new PriceEntity(data))
    ;
  }
}
// Make alias
const _static = PriceModel;

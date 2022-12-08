//
import Model from '../Model';
import PromotionOfferEntity from '../PromotionOfferEntity';

// Util(s)

/**
 * @class PromotionOfferModel
 */
export default class PromotionOfferModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'promotion_offers';

  /**
   * @var {Ref}
   */
  _entity = PromotionOfferEntity;

  /**
   * @var {String}
   */
  static API_PROMOTION_OFFER_LIST = 'promotion-offer';
  /** @var {String} */
  static API_PROMOTION_OFFER_DETAIL = 'promotion-offer/:id';
  /** @var {String} */
  static API_PROMOTION_OFFER_OPTS = 'promotion-offer/get-options';
  /** @var {String} */
  static API_PROMOTION_OFFER_CHANGE_STATUS = 'promotion-offer/:id/change-status';
  /** @var {String} */
  static API_PROMOTION_OFFER_EXCEL = 'promotion-offer/export-excel';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'promotion_offer_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Array}
   */
  static getOfferTypeOptsStatic() {
    return [
      { label: "Khuyến mại theo %", value: "1" }, // 1: ISPERCENTDISCOUNT
      { label: "Giảm giá trực tiếp", value: "2" }, // 2: ISDISCOUNTBYSETPRICE
      { label: "Giảm giá cứng", value: "3" }, // 3: ISFIXPRICE
      { label: "Quà tặng", value: "4" }, // 4: ISFIXDGIFT
    ];
  }

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
    return this._api.get(_static.API_PROMOTION_OFFER_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PROMOTION_OFFER_OPTS, opts);
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
          ({ promotion_offer_id: id, promotion_offer_name: name, description }) => {
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
    return this._api.post(_static.API_PROMOTION_OFFER_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    console.log(_data);
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PROMOTION_OFFER_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PROMOTION_OFFER_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PROMOTION_OFFER_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PROMOTION_OFFER_DETAIL.replace(':id', id), data)
      .then((data) => new PromotionOfferEntity(data))
    ;
  }

  /**
   *
   */
  exportExcel(opts)
  {
    const header = { responseType: 'blob' };
    return this._api.get(_static.API_PROMOTION_OFFER_EXCEL, opts, header);
  }
}
// Make alias
const _static = PromotionOfferModel;

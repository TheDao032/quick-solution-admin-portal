// Model(s)/Enties
import Model from '../Model';
import PromotionEntity from '../PromotionEntity';

/**
 * @class PromotionModel
 */
export default class PromotionModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'promotions';

  /** @var {Ref} */
  _entity = PromotionEntity;

  /** @var {String} */
  static API_PROMOTION_LIST = 'promotion';
  /** @var {String} */
  static API_PROMOTION_OPTS = 'promotion/get-options';
  /** @var {String} */
  static API_PROMOTION_CREATE = 'promotion';
  /** @var {String} */
  static API_PROMOTION_UPDATE = 'promotion/:id'; // PUT
  /** @var {String} */
  static API_PROMOTION_READ = 'promotion/:id'; // GET
  /** @var {String} */
  static API_PROMOTION_DELETE = 'promotion/:id'; // DELETE
  /** @var {String} */
  static API_PROMOTION_CHANGE_STATUS = 'promotion/:id/change-status';
  /** @var {String} */
  static API_PROMOTION_APPROVE = 'promotion/:id/approve';

  /**
   * @var {String} Primary Key
   */
  static primaryKey = PromotionEntity.primaryKey;

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Array}
   */
  static getReviewOptsStatic() {
    return [
      { label: "Tất cả", value: "3" },
      { label: "Đã duyệt", value: "1" },
      { label: "Không duyệt", value: "2" },
      { label: "Chưa duyệt", value: "0" },
    ];
  }

  /**
   * @return {Object}
   */
  fillable = () => this.mkEnt();

  /**
   * 
   * @param {object} data
   */
  // constructor(data) { super(data); }

  /**
   * Get list
   * @returns Promise
   */
  list(_opts = {})
  {
    let opts = Object.assign({
      // itemsPerPage:,
      // page,
      // is_active
      // is_system
    }, _opts);
    return this._api.get(_static.API_PROMOTION_LIST, opts);
  }

  /**
   * Get options
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_PROMOTION_OPTS, opts);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    // console.log('Promotion#create: ', data);
    //
    return this._api.post(_static.API_PROMOTION_CREATE, data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PROMOTION_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PROMOTION_READ.replace(':id', id), data)
      .then((data) => new PromotionEntity(data))
    ;
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PROMOTION_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PROMOTION_DELETE.replace(':id', id), data);
  }

  /**
   *
   */
  approve(id, _data)
  {
    // Validate data?!
    let data = Object.assign({
      is_review: null,
      note_review: "",
      user_review: ""
    }, _data);
    //
    return this._api.put(_static.API_PROMOTION_APPROVE.replace(':id', id), data);
  }
}
// Make alias
const _static = PromotionModel;

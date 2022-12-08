//
import Model from '../Model';
//
import CustomerTimeKeepingEntity from '../CustomerTimeKeepingEntity';

/**
 * @class StatusDataLeadModel
 */
export default class CustomerTimeKeepingModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'customer-timekeeping';

  /**
   * @var {String}
   */
  static API_CUSTOMER_TIMEKEEPING_LIST = 'customer-timekeeping';
  /** @var {String} */
  static API_CUSTOMER_TIMEKEEPING_DETAIL = 'customer-timekeeping/:id';
  /** @var {String} */
  static API_CUSTOMER_TIMEKEEPING_OPTS = 'customer-timekeeping/get-options';
  /** @var {String} */
  static API_CUSTOMER_TIMEKEEPING_STATUS = 'customer-timekeeping/:id/change-status';
   /** @var {String} */
   static API_CUSTOMER_TIMEKEEPING_EXCEL = 'customer-timekeeping/export-excel';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'customer_timekeeping_id';

  /**
   * @return {Object}
   */
  fillable = () => ({

  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);    
    return this._api.get(_static.API_CUSTOMER_TIMEKEEPING_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_CUSTOMER_TIMEKEEPING_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log(data);
    return this._api.post(_static.API_CUSTOMER_TIMEKEEPING_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    console.log(data);
    return this._api.put(_static.API_CUSTOMER_TIMEKEEPING_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);    //
    data.is_won = (data.order === "1") ? 1: 0;
    data.is_lost = (data.order === "2") ? 1: 0;
    return this._api.put(_static.API_CUSTOMER_TIMEKEEPING_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_CUSTOMER_TIMEKEEPING_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    return this._api.delete(_static.API_CUSTOMER_TIMEKEEPING_DETAIL.replace(':id', id));
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    let as = this._api.get(_static.API_CUSTOMER_TIMEKEEPING_DETAIL.replace(':id', id), data)
    .then((data) => new CustomerTimeKeepingModel(data));
    console.log(as);
    return this._api.get(_static.API_CUSTOMER_TIMEKEEPING_DETAIL.replace(':id', id), data)
      .then((data) => new CustomerTimeKeepingModel(data))
    ;
  }

  /**
   *
   */
  exportExcel(opts)
  {
    const header = {
      responseType: 'blob',
    }
    return this._api.get(_static.API_CUSTOMER_TIMEKEEPING_EXCEL, opts, header);
  }
}

// Make alias
const _static = CustomerTimeKeepingModel;

//
import Model from '../Model';
import CustomerDataLeadEntity from '../CustomerDataLeadEntity';

// Util(s)

/**
 * @class CustomerDataLeadModel
 */
export default class CustomerDataLeadModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'customer_data_leads';

  /** @var {Ref} */
  _entity = CustomerDataLeadEntity;

  /**
   * @var {String}
   */
  static API_CUST_DATA_LEAD_LIST = 'customer-data-lead';
  /** @var {String} */
  static API_CUST_DATA_LEAD_DETAIL = 'customer-data-lead/:id';
  /** @var {String} */
  static API_CUST_DATA_LEAD_OPTS = 'customer-data-lead/get-options';
  /** @var {String} */
  static API_CUST_DATA_LEAD_CHANGE_STATUS = 'customer-data-lead/:id/change-status';
  /** @var {String} */
  static API_CUST_DATA_LEAD_CHANGE_TASK_WORK_FLOW = 'task-data-leads/change-work-flow';

  /** @var {String} Primary Key */
  primaryKey = 'data_leads_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "full_name": "",
    "birthday": "",
    "gender": "0",
    "phone_number": "",
    "email": "",
    "marital_status": "0",
    "company_id": "",
    "id_card": "",
    "id_card_date": "",
    "id_card_place": "",
    "country_id": "",
    "country_name": "",
    "province_id": "",
    "province_name": "",
    "district_id": "",
    "district_name": "",
    "ward_id": "",
    "ward_name": "",
    "address": "",
    "business_id": "",
    "is_active": true,
    "campaign_id": "",
    "segment_id": [],
    "status_data_leads_id": ""
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CUST_DATA_LEAD_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_CUST_DATA_LEAD_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_CUST_DATA_LEAD_LIST, data);
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CUST_DATA_LEAD_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CUST_DATA_LEAD_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_CUST_DATA_LEAD_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_CUST_DATA_LEAD_DETAIL.replace(':id', id), data)
      .then((data) => new CustomerDataLeadEntity(data))
    ;
  }

  /**
   *
   */
  changeTaskWorkflow(_data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CUST_DATA_LEAD_CHANGE_TASK_WORK_FLOW, data);
  }
}
// Make alias
const _static = CustomerDataLeadModel;

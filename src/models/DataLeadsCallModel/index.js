//
import Model from '../Model';
//
import DataLeadsCallEntity from '../DataLeadsCallEntity';

/**
 * @class DataLeadsCallModel
 */
export default class DataLeadsCallModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'data_leads_call';

  /**
   * @var {Ref}
   */
  _entity = DataLeadsCallEntity;

  /**
   * @var {String}
   */
  static API_DATA_LEAD_CALL_LIST = 'data-leads-call';
  /** @var {String} */
  static API_DATA_LEAD_CALL_DETAIL = 'data-leads-call/:id';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'call_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => this.mkEnt();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({
      itemsPerPage: 5, // default items per page
      page: 1,
      data_leads_id: null,
      task_id: null,
    }, _data);
    return this._api.get(_static.API_DATA_LEAD_CALL_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_DATA_LEAD_CALL_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_DATA_LEAD_CALL_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_DATA_LEAD_CALL_DETAIL.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DATA_LEAD_CALL_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_CALL_DETAIL.replace(':id', id), data)
      .then((data) => new DataLeadsCallEntity(data))
    ;
  }
}
// Make alias
const _static = DataLeadsCallModel;

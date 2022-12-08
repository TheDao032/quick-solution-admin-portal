//
import Model from '../Model';
//
import DataLeadsHistoryEntity from '../DataLeadsHistoryEntity';

/**
 * @class DataLeadsHistoryModel
 */
export default class DataLeadsHistoryModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'data_leads_history';

  /**
   * @var {Ref}
   */
  _entity = DataLeadsHistoryEntity;

  /**
   * @var {String}
   */
  static API_DATA_LEAD_HISTORY_LIST = 'history-data-leads';
  /** @var {String} */
  static API_DATA_LEAD_HISTORY_DETAIL = 'history-data-leads/:id';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'history_id';

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
      itemsPerPage: 25, // default items per page
      page: 1,
      task_data_leads_id: null,
      task_id: null,
    }, _data);
    return this._api.get(_static.API_DATA_LEAD_HISTORY_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_DATA_LEAD_HISTORY_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_DATA_LEAD_HISTORY_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_DATA_LEAD_HISTORY_DETAIL.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DATA_LEAD_HISTORY_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_HISTORY_DETAIL.replace(':id', id), data)
      .then((data) => new DataLeadsHistoryEntity(data))
    ;
  }
}
// Make alias
const _static = DataLeadsHistoryModel;

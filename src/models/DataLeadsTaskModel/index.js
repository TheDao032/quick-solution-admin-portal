//
import Model from '../Model';
//
import DataLeadsTaskEntity from '../DataLeadsTaskEntity';

/**
 * @class DataLeadsTaskModel
 */
export default class DataLeadsTaskModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'data_leads_task';

  /**
   * @var {Ref}
   */
  _entity = DataLeadsTaskEntity;

  /**
   * @var {String}
   */
  static API_TASK_DATA_LEAD_LIST = 'task-data-leads';
  /** @var {String} */
  static API_TASK_DATA_LEAD_DETAIL = 'data-leads-task/:id';
  /** @var {String} */
  static API_TASK_DATA_LEAD_GET_NEXT_PREVIOUS = 'task-data-leads/get-next-previous';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'task_data_leads_id';

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
   * @see https://trello.com/c/Mdv4RHSR/363-taskdataleads-api-get-next-and-previous-khách-hàng
   */
  getNextPrevious(_data = {})
  {
    // Validate data?!
    let data = Object.assign({
      data_leads_id: null,
      task_id: null,
    }, _data);
    return this._api.get(_static.API_TASK_DATA_LEAD_GET_NEXT_PREVIOUS, data);
  }
}
// Make alias
const _static = DataLeadsTaskModel;

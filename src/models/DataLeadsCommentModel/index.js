//
import Model from '../Model';
//
import DataLeadsCommentEntity from '../DataLeadsCommentEntity';

/**
 * @class DataLeadsCommentModel
 */
export default class DataLeadsCommentModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'data_leads_comments';

  /**
   * @var {Ref}
   */
  _entity = DataLeadsCommentEntity;

  /**
   * @var {String}
   */
  static API_DATA_LEAD_COMMENT_LIST = 'data-leads-comment';
  /** @var {String} */
  static API_DATA_LEAD_COMMENT_DETAIL = 'data-leads-comment/:id';
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
    return this._api.get(_static.API_DATA_LEAD_COMMENT_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_DATA_LEAD_COMMENT_OPTS, opts);
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    return this._api.post(_static.API_DATA_LEAD_COMMENT_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_DATA_LEAD_COMMENT_DETAIL.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DATA_LEAD_COMMENT_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_DATA_LEAD_COMMENT_DETAIL.replace(':id', id), data)
      .then((data) => new DataLeadsCommentEntity(data))
    ;
  }
}
// Make alias
const _static = DataLeadsCommentModel;

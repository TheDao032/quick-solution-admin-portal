//
import Model from '../Model';
//
import TopicEntity from '../TopicEntity';

// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class TopicEntity
 */
export default class TopicModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'topic';

  /**
   * @var {Ref}
   */
  _entity = TopicEntity;

  /**
   * @var {String}
   */
  static API_TOPIC_LIST = 'topic';
  /** @var {String} */
  static API_TOPIC_DETAIL = 'topic/:id';
  /** @var {String} */
  static API_TOPIC_OPTS = 'topic/get-options';
  /** @var {String} */
  static API_TOPIC_CHANGE_STATUS = 'topic/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'topic_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => ({
    "topic_id": null,
    "topic_name": "",
    "descriptions": null,
    "descriptions": "",
    "is_active": 0,
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_TOPIC_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_TOPIC_OPTS, opts);
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
          ({ topic_id: id, topic_name: name, description }) => {
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
    return this._api.post(_static.API_TOPIC_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    console.log(id);
    // Validate data?!
    let data = Object.assign({}, _data);
    console.log(data);
    return this._api.put(_static.API_TOPIC_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    console.log(id);
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_TOPIC_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    console.log(id);
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_TOPIC_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    console.log(id);
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    var _re = this._api.get(_static.API_TOPIC_DETAIL.replace(':id', id), data);
    console.log(_re)
    console.log(_re.then((data) => new TopicEntity(data)))
    return  _re.then((data) => new TopicEntity(data))
    ;
  }
}
// Make alias
const _static = TopicModel;

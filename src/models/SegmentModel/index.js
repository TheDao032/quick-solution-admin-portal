//
import Model from '../Model';
//
import SegmentEntity from '../SegmentEntity';

/**
 * @class SegmentModel
 */
export default class SegmentModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'segments';

  /**
   * @var {Ref}
   */
  _entity = SegmentEntity;

  /**
   * @var {String}
   */
  static API_SEGMENT_LIST = 'segment';
  /** @var {String} */
  static API_SEGMENT_DETAIL = 'segment/:id';
  /** @var {String} */
  static API_SEGMENT_OPTS = 'segment/get-options';
  /** @var {String} */
  static API_SEGMENT_CHANGE_STATUS = 'segment/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'segment_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
/**

  /**
   * @return {Object}
   */
  fillable = () => ({
    "segment_id": null,
    "segment_name": "",
    "company_id": null,
    "company_name": "",
    "business_id": null,
    "business_name": "",
    "description": "",
    "is_active": 1,
    "is_system": 0
  });

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_SEGMENT_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_SEGMENT_OPTS, opts);
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
          ({ SEGMENT_id: id, SEGMENT_name: name, description }) => {
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
    console.log('data',data);
    return this._api.post(_static.API_SEGMENT_LIST, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_SEGMENT_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_SEGMENT_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_SEGMENT_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_SEGMENT_DETAIL.replace(':id', id), data)
      .then((data) => new SegmentEntity(data))
    ;
  }
}
// Make alias
const _static = SegmentModel;

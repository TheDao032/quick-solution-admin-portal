//
import Model from '../Model';
// Entities
import WardEntity from '../WardEntity';

/**
 * @class Ward
 */
export default class WardModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'ward';

  /** @var {Ref} */
  _entity = WardEntity;

  /** @var {String} */
  static API_WARD_LIST = 'ward';
  /** @var {String} */
  static API_WARD_OPTS = 'ward/get-options';
  /** @var {String} */
  static API_WARD_CREATE = 'ward';
  /** @var {String} */
  static API_WARD_UPDATE = 'ward/:id'; // PUT
  /** @var {String} */
  static API_WARD_READ = 'ward/:id'; // GET
  /** @var {String} */
  static API_WARD_DELETE = 'ward/:id'; // DELETE
  /** @var {String} */
  static API_WARD_CHANGE_PASSWORD = 'ward/:id/change-password'; // PUT

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'ward_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * jqx's grid columns & datafields!
   * @var {Array}
   */
  static _jqxGridColumns = [];

  /**
   * @return {Object}
   */
  fillable = () => ({});

  /**
   * Return jqx's grid columns
   * @param {Object} opts Options
   * @return {Array}
   */
  static jqxGridProps(opts)
  {
    let _self = new _static();

    // Get, format options
    opts = Object.assign({
      prefix: _static.columnPrefix,
      // events
      // +++ format (mapping) API data before render
      postBeforeProcessing: (data) => {
        (data.items || []).forEach((item) => {
          // ...
        });
      }
    }, opts);

    //
    let props = Model.jqxGridProps(_static._jqxGridColumns, opts);
    // +++
    Object.assign(props.source, {
      url: _static.apiClass.buildApiUri(_static.API_WARD_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * Get options (list opiton)
   * @param {Number|String} parent_id
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(parent_id, options)
  {
    return this._api.get(_static.API_WARD_OPTS, { parent_id });
  }

  /**
   * 
   * @param {object} data
   */
  // constructor(data) { super(data); }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    console.log('Ward#create: ', data);
    //
    return this._api.post(_static.API_WARD_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_WARD_READ.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_WARD_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_WARD_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = WardModel;

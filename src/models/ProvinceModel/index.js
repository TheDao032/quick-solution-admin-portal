//
import Model from '../Model';
// Entities
import ProvinceEntity from '../ProvinceEntity';

/**
 * @class Province
 */
export default class ProvinceModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'province';

  /** @var {Ref} */
  _entity = ProvinceEntity;

  /** @var {String} */
  static API_PROVINCE_LIST = 'province';
  /** @var {String} */
  static API_PROVINCE_OPTS = 'province/get-options';
  /** @var {String} */
  static API_PROVINCE_CREATE = 'province';
  /** @var {String} */
  static API_PROVINCE_UPDATE = 'province/:id'; // PUT
  /** @var {String} */
  static API_PROVINCE_READ = 'province/:id'; // GET
  /** @var {String} */
  static API_PROVINCE_DELETE = 'province/:id'; // DELETE
  /** @var {String} */
  static API_PROVINCE_CHANGE_PASSWORD = 'province/:id/change-password'; // PUT

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'province_id';

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
      url: _static.apiClass.buildApiUri(_static.API_PROVINCE_LIST),
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
  getOptions(parent_id, opts)
  {
    return this._api.get(_static.API_PROVINCE_OPTS, { parent_id });
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
    console.log('Province#create: ', data);
    //
    return this._api.post(_static.API_PROVINCE_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  readVer1(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_PROVINCE_READ.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  read(id, _opts = {})
  {
    // Validate data?!
    return this.getOptions(_opts)
      .then(items => (items || []).find(item => ('' + item.id) === ('' + id)));
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_PROVINCE_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_PROVINCE_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = ProvinceModel;

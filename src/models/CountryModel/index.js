//
import Model from '../Model';
// Entities
import CountryEntity from '../CountryEntity';

/**
 * @class Country
 */
export default class CountryModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'countries';

  /** @var {Ref} */
  _entity = CountryEntity;

  /** @var {String} */
  static API_COUNTRY_LIST = 'country';
  /** @var {String} */
  static API_COUNTRY_OPTS = 'country/get-options';
  /** @var {String} */
  static API_COUNTRY_CREATE = 'country';
  /** @var {String} */
  static API_COUNTRY_UPDATE = 'country/:id'; // PUT
  /** @var {String} */
  static API_COUNTRY_READ = 'country/:id'; // GET
  /** @var {String} */
  static API_COUNTRY_DELETE = 'country/:id'; // DELETE
  /** @var {String} */
  static API_COUNTRY_CHANGE_PASSWORD = 'country/:id/change-password'; // PUT

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'country_id';

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
   * @var {Number|String}
   */
  static ID_VN = 6;

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
      url: _static.apiClass.buildApiUri(_static.API_COUNTRY_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptions()
  {
    return this._api.get(_static.API_COUNTRY_OPTS, {});
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
    console.log('Country#create: ', data);
    //
    return this._api.post(_static.API_COUNTRY_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  readVer1(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_COUNTRY_READ.replace(':id', id), data);
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
    return this._api.put(_static.API_COUNTRY_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_COUNTRY_DELETE.replace(':id', id), data);
  }
}
// Make alias
const _static = CountryModel;

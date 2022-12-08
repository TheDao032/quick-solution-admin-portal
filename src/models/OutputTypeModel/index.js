//
import Model from '../Model';
import OutputTypeEntity from '../OutputTypeEntity';

// Util(s)

/**
 * @class OutputTypeModel
 */
export default class OutputTypeModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'output_type';

  /**
   * @var {Ref}
   */
  _entity = OutputTypeEntity;

  /**
   * @var {String}
   */
  static API_OUTPUT_TYPE_LIST = 'output-type';
  /** @var {String} */
  static API_OUTPUT_TYPE_DETAIL = 'output-type/:id';
  /** @var {String} */
  static API_OUTPUT_TYPE_OPTS = 'output-type/get-options';
  /** @var {String} */
  static API_OUTPUT_TYPE_CHANGE_STATUS = 'output-type/:id/change-status';
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'output_type_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
/**

  /**
   * @var {Object}
   */
  fillable = () => this.mkEnt();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_OUTPUT_TYPE_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_OUTPUT_TYPE_OPTS, opts);
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
          ({ price_id: id, price_name: name, description }) => {
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
    return this._api.post(_static.API_OUTPUT_TYPE_LIST, data);
  }

    /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_OUTPUT_TYPE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_OUTPUT_TYPE_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_OUTPUT_TYPE_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_OUTPUT_TYPE_DETAIL.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_OUTPUT_TYPE_DETAIL.replace(':id', id), data)
      .then((data) => new OutputTypeEntity(data))
    ;
  }
}
// Make alias
const _static = OutputTypeModel;

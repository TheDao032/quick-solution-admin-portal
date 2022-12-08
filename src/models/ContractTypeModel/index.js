//
import Model from '../Model';
import ContractTypeEntity from '../ContractTypeEntity';

// Util(s)

/**
 * @class ContractTypeModel
 */
export default class ContractTypeModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'contract_type';

  /** @var {Ref} */
  _entity = ContractTypeEntity;

  /**
   * @var {String}
   */
  /** @var {String} */
  static API_LIST = 'contract-type';
  /** @var {String} */
  static API_OPTS = 'contract-type/get-options';
  /** @var {String} */
  static API_CREATE = 'contract-type';
  /** @var {String} */
  static API_UPDATE = 'contract-type/:id'; // PUT
  /** @var {String} */
  static API_READ = 'contract-type/:id'; // GET
  /** @var {String} */
  static API_DELETE = 'contract-type/:id'; // DELETE
  /** @var {String} */
  static API_CHANGE_STATUS = 'contract-type/:id/change-status';

  /**
   * @var {String} Primary Key
   */
  static primaryKey = ContractTypeEntity.primaryKey;

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @var {Object}
   */
  fillable = () => new ContractTypeEntity();

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} _opts
   * @returns Promise
   */
  getOptions(_opts)
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_OPTS, opts);
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
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE,
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(item => {
          let {contract_type_id: id, contract_type_name: name} = item;
          // Nam trong list exclude --> set null
          if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
            return null;
          }
          return ({ name, id, ...item });
        });
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
    return this._api.post(_static.API_CREATE, data);
  }

  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_UPDATE.replace(':id', id), data);
  }

  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CHANGE_STATUS.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_DELETE.replace(':id', id), data);
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_READ.replace(':id', id), data)
      .then((data) => new ContractTypeEntity(data))
    ;
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_UPDATE.replace(':id', id), data);
  }
}
// Make alias
const _static = ContractTypeModel;

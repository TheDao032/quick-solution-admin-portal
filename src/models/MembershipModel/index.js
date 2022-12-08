//
import Model from '../Model';
import MembershipEntity from '../MembershipEntity';

// Util(s)

/**
 * @class MembershipModel
 */
export default class MembershipModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'memberships';

  /** @var {Ref} */
  _entity = MembershipEntity;

  /** @var {String} */
  static API_LIST = 'membership';
  /** @var {String} */
  static API_OPTS = 'membership/get-options';
  /** @var {String} */
  static API_CREATE = 'membership';
  /** @var {String} */
  static API_UPDATE = 'membership/:id'; // PUT
  /** @var {String} */
  static API_READ = 'membership/:id'; // GET
  /** @var {String} */
  static API_DELETE = 'membership/:id'; // DELETE
  /** @var {String} */
  static API_CHANGE_STATUS = 'membership/:id/change-status';

  /**
   * @var {String} Primary Key
   */
  static primaryKey = MembershipEntity.primaryKey;

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * @return {Object}
   */
  fillable = () => new MembershipEntity();

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
      itemsPerPage: 256, // Number.MAX_SAFE_INTEGER // @TODO: get all records
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ membership_id: id, membership_name: name, description }) => {
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
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    // console.log('Membership#create: ', data);
    //
    return this._api.post(_static.API_CREATE, data);
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
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_READ.replace(':id', id), data)
      .then((data) => new MembershipEntity(data))
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
}
// Make alias
const _static = MembershipModel;

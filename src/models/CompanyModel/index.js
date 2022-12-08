//
import Model from '../Model';
import CompanyEntity from '../CompanyEntity';
// Util(s)

/**
 * @class CompanyModel
 */
export default class CompanyModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'companys';

  /** @var {Ref} */
  _entity = CompanyEntity;

  /** @var {String} */
  static API_COMPANY_LIST = 'company';
  /** @var {String} */
  static API_COMPANY_OPTS = 'company/get-options';
  /** @var {String} */
  static API_COMPANY_CREATE = 'company';
  /** @var {String} */
  static API_COMPANY_UPDATE = 'company/:id'; // PUT
  /** @var {String} */
  static API_COMPANY_READ = 'company/:id'; // GET
  /** @var {String} */
  static API_COMPANY_DELETE = 'company/:id'; // DELETE
  /** @var {String} */
  static API_COMPANY_UPDATE_STATUS = 'company/:id/change-status'; // PUT
  /** @var {String} */
  static API_COMPANY_GET_BY_USER = 'company/get-by-user'; // GET
  /** @var {String} */
  static API_EXPORT_EXCEL = 'company/export-excel';

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'company_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   *
   * @static
   * @memberof CompanyModel
   */
  static getOptionsRecursive(input, opts, output) {
    // Format output
    output = (output instanceof Array) ? output : [];

    // Format opts
    // +++
    opts = Object.assign({
      level: 0,
      prefix: " |--- ",
      idProp: "company_id",
      pidProp: "parent_id",
      nameProp: "company_name",
      sortProp: "order_index",
    }, opts);
    // +++
    opts.level++;
    // +++
    let parentId = opts.parentId;
    parentId = (parentId === null || parentId === undefined) ? "0" : ('' + parentId);
    // +++
    opts.merge = opts.merge || function({ item, output, opts/*, input*/ }) {
      output.push(item);
    };

    // Sort?
    if (opts.level === 1 && input.length) {
      input.sort(function(a, b) {
        let aIdx = (1 * a[opts.sortProp]);
        let bIdx = (1 * b[opts.sortProp]);
        return (!isNaN(aIdx) && isNaN(bIdx)) ? (aIdx > bIdx) : 0;
      });
    }

    //
    (input || []).forEach(item => {
      item = Object.assign({}, item);
      if ((opts.pidProp in item) && ('' + item[opts.pidProp]) === parentId) {
        if (opts.nameProp in item) {
          item[opts.nameProp] = (new Array(opts.level).join(opts.prefix)) + item[opts.nameProp];
        }
        opts.merge({ item, output, opts, input });
        let id = (item.id || item[opts.idProp]);
        if (id) {
          Object.assign(opts, { parentId: id });
          _static.getOptionsRecursive(input, opts, output);
        }
      }
    });

    return output;
  }

  /**
   * @var {Object}
   */
  fillable = () => ({
    "address": "",
    "bank_account_id": "",
    "bank_account_name": "",
    "bank_name": "",
    "bank_routing": "",
    "company_id": null,
    "company_name": "",
    "company_type_id": null,
    "country_id": null,
    "district_id": null,
    "email": "",
    "fax": "",
    "is_active": 1,
    "open_date": "",
    "phone_number": "",
    "province_id": null,
    "tax_id": "",
    "ward_id": null,
    "zip_code": ""
  });

  /**
   * Get list
   * @returns Promise
   */
  getList(_opts)
  {
    // Get, format input
    let opts = Object.assign({}, _opts);
    let formatOpts = opts['_format'] || {};
    delete opts['_format'];

    let ret = this._api.get(_static.API_COMPANY_LIST, opts);

    // Recursive?
    if (true === formatOpts.recursive) {
      ret.then(data => {
        let { items } = data;
        if (items && items.length) {
          Object.assign(data, {
            items: _static.getOptionsRecursive(items)
          });
        }
        return data;
      })
    }

    return ret;
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptionsRev1(_opts)
  {
    // Format options
    let opts = _opts || {};
    let apiOpts = Object.assign({
      itemsPerPage: 256, // Number.MAX_SAFE_INTEGER // @TODO: get all records
      is_active: 1,
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let ret = _static.getOptionsRecursive(items, opts);
        // console.log('getOptions: ', ret, items);
        return ret;
      })
      .then((items) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ company_id: id, company_name: name, parent_id }) => {
              // Nam trong list exclude --> set null
              if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
                return null;
              }
              return ({ name, id, parent_id });
            }
        );
        // Filter null items
        return ret.filter(item => item);
      });
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_COMPANY_OPTS, opts);
  }

  exportExcel(opts)
  {
    const header = {
      responseType: 'blob',
    }
    return this._api.get(_static.API_EXPORT_EXCEL, opts, header);
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    //
    return this._api.post(_static.API_COMPANY_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_COMPANY_READ.replace(':id', id), data)
      .then((data) => new CompanyEntity(data))
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
    return this._api.put(_static.API_COMPANY_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_COMPANY_DELETE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  changeStatus(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_COMPANY_UPDATE_STATUS.replace(':id', id), data);
  }
}
// Make alias
const _static = CompanyModel;

//
import Model from '../Model';
//
import AccountEntity from '../AccountEntity';

// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class StatusDataLeadModel
 */
export default class AccountModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'account';

  /**
   * @var {String}
   */
  static API_ACCOUNT_LIST = 'account';
  /** @var {String} */
  static API_ACCOUNT_DETAIL = 'account/:id';
  /** @var {String} */
  static API_ACCOUNT_OPTS = 'account/get-options';
  /** @var {String} */
  static API_ACCOUNT_CHANGE_STATUS = 'account/:id/change-status';
   /** @var {String} */
   static API_EXPORT_EXCEL = 'account/export-excel';
    /** @var {String} */
   static API_ACCOUNT_CHANGE_PASSWORD = 'account/:id/change-password'; // PUT
  /**
   * @var {String} Primary Key
   */
  primaryKey = 'news_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
  /** @var {String} */
  static defaultImgBase64 = AccountEntity.defaultImgBase64;

  /**
   * @return {Object}
   */
  fillable = () => ({
    "member_id": null,
    "user_name": null,
    "password": null,
    "customer_code": null,
    "type_register": null,
    "register_date": null,
    "image_avatar": null,
    "full_name": null,
    "birth_day": null,
    "gender": "0",
    "birthday": null,
    "marital_status": null,
    "phone_number": null,
    "email": null,
    "id_card": null,
    "id_card_date": null,
    "id_card_place": null,
    "address": null,
    "province_id": null,
    "province_name": null,
    "district_id": null,
    "district_name": null,
    "country_id": null,
    "country_name": null,
    "ward_id": null,
    "ward_name": null,
    "is_confirm": 1,
    "is_notification": 0,
    "is_can_email": 0,
    "is_system": 0,
    "is_active": 1,
    "is_can_sms_or_phone": 0,
  });

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
          // Case: gender
          if ('is_active' in item) {
            item.is_active_text = window._$g._(item.is_active ? 'Đang sử dụng' : 'Tạm ngưng')
          }
          if('is_won' in item){
            item.is_won_text = window._$g._(item.is_won ? 'Yes' : 'No')
          }
          if('is_lost' in item){
            item.is_lost_text = window._$g._(item.is_lost ? 'Yes' : 'No')
          }
         // if('is_system' in item){
          //  item.is_system_text = window._$g._(item.is_system ? 'Yes' : 'No')
          //}
          //
        });
      }
    }, opts);

    //
    let props = Model.jqxGridProps(_static._jqxGridColumns, opts);
    // +++
    Object.assign(props.source, {
      url: _static.apiClass.buildApiUri(_static.API_ACCOUNT_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   *
   * @param {object} data
   */
  // constructor(data) { super(data); }

  dataList(_opts = {})
  {
    // Get, format input(s)
    let opts = Object.assign({}, _opts);

    return new Promise((resolve) => {
      // Fetch data
      let dataList = super.dataList([], opts);
      // +++ Include 'Favorites'?

      // Filter?
      let { filters = {} } = opts;
      // ---
      if (Object.keys(filters).length) {
        dataList = dataList.filter((item, idx) => {
          if ( filters.ACCOUNT_id ) {
            return item.ACCOUNT_id === filters.ACCOUNT_id;
          }

          let rtn = true;
          // Filter by: fullname or tel?
          if (filters.groupname_or_description) {
            rtn = false;
            let gnOrDscLC = filters.groupname_or_description.toString().toLowerCase();
            let gnLC = item.groupname.toString().toLowerCase();
            let dscLC = item.description.toString().toLowerCase();
            if ((gnLC.indexOf(gnOrDscLC) >= 0)
                || (dscLC.indexOf(gnOrDscLC) >= 0)
            ) {
                rtn = true;
            }
          }
          return rtn;
        });
      }
      //.end

      // Return
      setTimeout(() => {
        resolve(dataList);
      }, 1e3);
    });
  }

  findOne(_opts = {})
  {
    // Fetch data
    let dataList = this.dataList(_opts);

    // Filters
    return dataList[0] || null;
  }
  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);    
    return this._api.get(_static.API_ACCOUNT_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.API_ACCOUNT_OPTS, opts);
  }

  /**
   * Get options (list opiton) for won/lost
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsWonLost(_opts = {})
  {
    let optsIsWon = {
      is_won: _opts.is_won || 1
    };
    let optsIsLost = {
      is_lost: _opts.is_lost || 1
    };

    return Promise.all([
      this.getOptions(optsIsWon),
      this.getOptions(optsIsLost)
    ])
      .then(dataArr => {
        let [dataIsWon, dataIsLost] = dataArr;
        let data = [];
        dataIsWon.forEach(item => data.push({...item, is_won: 1 }));
        dataIsLost.forEach(item => data.push({...item, is_lost: 1 }));
        return data;
      });
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
        let ret = (items || []).map(
          ({ user_group_id: id, user_group_name: name, description }) => {
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
    console.log(data);
    return this._api.post(_static.API_ACCOUNT_LIST, data);
  }
/**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    console.log(data);
    return this._api.put(_static.API_ACCOUNT_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);    //
    data.is_won = (data.order === "1") ? 1: 0;
    data.is_lost = (data.order === "2") ? 1: 0;
    return this._api.put(_static.API_ACCOUNT_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.API_ACCOUNT_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    return this._api.delete(_static.API_ACCOUNT_DETAIL.replace(':id', id));
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    let as = this._api.get(_static.API_ACCOUNT_DETAIL.replace(':id', id), data)
    .then((data) => new AccountEntity(data));
    console.log(as);
    return this._api.get(_static.API_ACCOUNT_DETAIL.replace(':id', id), data)
      .then((data) => new AccountEntity(data))
    ;
  }

  /**
   *
   */
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
  init(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    // console.log('User#init: ', data);
    //
    return this._api.post(_static.API_USER_INIT, data);
  }
  /**
   * @return {Promise}
   */
  changePassword(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_ACCOUNT_CHANGE_PASSWORD.replace(':id', id), data);
  }

}
// Make alias
const _static = AccountModel;

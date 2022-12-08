//
import Model from '../Model';
//
import UserEntity from '../UserEntity';
// Action(s)
import {
  // userAdd,
  userAuthSet
} from '../../actions/user';

/**
 * @class UserModel
 */
export default class UserModel extends Model
{
  /** @var {String} redux store::state key */
  _stateKeyName = 'users';

  /** @var {Ref} */
  _entity = UserEntity;

  /** @var {String} */
  static API_USER_AUTH = 'auth/token';
  /** @var {String} */
  static API_USER_PROFILE = 'auth/get-profile';
  /** @var {String} */
  static API_USER_LOGOUT = 'auth/logout';
  /** @var {String} */
  static API_USER_LIST = 'user';
  /** @var {String} */
  static API_USER_OPTS = 'user/get-options';
  /** @var {String} */
  static API_USER_INIT = 'user/create';
  /** @var {String} */
  static API_USER_CREATE = 'user';
  /** @var {String} */
  static API_USER_UPDATE = 'user/:id'; // PUT
  /** @var {String} */
  static API_USER_READ = 'user/:id'; // GET
  /** @var {String} */
  static API_USER_DELETE = 'user/:id'; // DELETE
  /** @var {String} */
  static API_USER_CHANGE_PASSWORD = 'user/:id/change-password'; // PUT
  /** @var {String} */
  static API_CHANGE_PASSWORD_USER = 'user/:id/change-password-user'; // PUT
  /** @var {String} */
  static API_USER_FUNCTIONS = 'function/functions-by-user-group'; // GET

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'user_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';

  /**
   * jqx's grid columns & datafields!
   * @var {Array}
   */
  static _jqxGridColumns = [
    { datafield : 'user_id' },
    {
      text : 'Tên đăng nhập',
      datafield : 'user_name',
      pinned: true,
      width : 120,
    },
    {
      text : 'Họ',
      datafield : 'first_name',
      pinned: true,
      width : 120,
    },
    {
      text : 'Tên',
      datafield : 'last_name',
      pinned: true,
      width : 120,
    },
    { datafield : 'department_id' },
    {
      text : 'Phòng ban',
      datafield : 'department',
      sortable : false,
      width : 120,
    },
    { datafield : 'position_id' },
    {
      text : 'Chức vụ',
      datafield : 'position_text',
      width : 80,
    },
    { datafield : 'gender' },
    {
      text : 'Giới tính',
      datafield : 'gender_text',
      width : 80,
    },
    {
      text : 'Email',
      datafield : 'email',
      width : 160,
      sortable : false,
    },
    {
      text : 'Ngày sinh',
      datafield : 'birthday',
      sortable : false,
      width : 100,
      cellsalign: 'center',
      /* columngroup: ['identity', {
        text : 'CMND',
        align : 'center'
      }] */
    },
    {
      text : 'Địa chỉ',
      datafield : 'address',
      width : 160,
      sortable : false,
    },
    {
      text : 'Điện thoại',
      datafield : 'phone_number',
      width : 120,
      sortable : false,
    },
    {
      text : 'Điện thoại 2',
      datafield : 'phone_number_1',
      width : 120,
      sortable : false,
    }/*,
    {
      text : 'Phân quyền',
      datafield : 'groups',
      width : 120,
      sortable : false,
    }*/,
    {
      text : 'Giới thiệu sơ lược',
      datafield : 'about_me',
      sortable : false,
      filterable : false,
      minwidth : 160,
    }
  ];

  /** @var {String} */
  static defaultImgBase64 = UserEntity.defaultImgBase64;

  /**
   * @return {Object}
   */
  fillable = () => ({
    "user_name": "",
    "password": "",
    "password_confirm": "",
    "first_name": "",
    "last_name": "",
    "gender": "0",
    "birthday": "",
    "email": "",
    "phone_number": "",
    "phone_number_1": "",
    "address": "",
    "country_id": "1",
    "province_id": "",
    "district_id": "",
    "city_id": "",
    "ward_id": "",
    "picture": "",
    "default_picture_url": "",
    "department_id": "",
    "position_id": "",
    "about_me": "",
    "description": "",
    "user_groups": []
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
          if ('gender' in item) {
            item.gender_text = window._$g._(item.gender ? 'Nam' : 'Nữ')
          }
          //
        });
      }
    }, opts);

    //
    let props = Model.jqxGridProps(_static._jqxGridColumns, opts);
    // +++
    Object.assign(props.source, {
      url: _static.apiClass.buildApiUri(_static.API_USER_LIST),
      id: _self.primaryKey
    });

    // Return;
    return props;
  }

  /**
   * @return {Object}
   */
  static buildAuthHeader() {
    let auth = _static.getUserAuthStatic();
    return {
      name: auth ? auth.tokenKey : null,
      value: auth ? `${auth.tokenType} ${auth.accessToken}` : null,
    };
  }

  /**
   * Get current authed user
   * @returns UserEntity|null
   */
  getUserAuth()
  {
    let userAuth = this._store.getState()['userAuth'];
    return userAuth && (new UserEntity(userAuth));
  }

  /**
   * Get current authed user static
   * @returns UserEntity|null
   */
  static getUserAuthStatic()
  {
    let userAuth = _static._storeStatic.getState()['userAuth'];
    return userAuth && (new UserEntity(userAuth));
  }

  /**
   * 
   */
  static getPrefsStatic(key)
  {
    let prefs = {};
    let userAuth = window._$g.userAuth || _static.getUserAuthStatic();
    if (userAuth) {
      prefs = userAuth._prefs || {};
    }
    return key ? prefs[key] : prefs;
  }

  /**
   * 
   */
  static addPrefStatic(key, value)
  {
    let userAuth = window._$g.userAuth || _static.getUserAuthStatic();
    if (userAuth) {
      let prefs = userAuth._prefs || {};
      prefs[key] = value;
      userAuth._prefs = prefs;
      _static.storeUserAuthStatic(userAuth);
    }
  }

  /**
   * 
   */
  static setPrefStatic(prefs)
  {
    let userAuth = window._$g.userAuth || _static.getUserAuthStatic();
    if (userAuth) {
      userAuth._prefs = prefs || {};
      _static.storeUserAuthStatic(userAuth);
    }
  }

  /**
   * Store auth user
   * @param {Object} data 
   */
  static storeUserAuthStatic(data) {
    let userAuth = _static.getUserAuthStatic();
    let authData = Object.assign(userAuth || {}, data);
    // let ent = new UserEntity(authData);
    _static._storeStatic.dispatch(userAuthSet(authData));
    return data;
  }

  /**
   * Login
   * @param {String} user_name
   * @param {String} password
   * @param {Boolean} remember
   * @return Promise
   */
  login(user_name, password, remember)
  {
    let platform = 'portal';
    return this._api.post(_static.API_USER_AUTH, {
      user_name: user_name, password, platform, remember
    })
      .then(loginData => _static.storeUserAuthStatic(loginData)
        && this._api.get(_static.API_USER_PROFILE)
          .then(profileData => {
            _static.storeUserAuthStatic(Object.assign(profileData, {
              _prefs: {} // Self init user's preferences,...
            }));
            if (!profileData.isAdministrator) {
              return this._api.get(_static.API_USER_FUNCTIONS)
                .then(_functions => _static.storeUserAuthStatic({ _functions }));
            }
            return profileData;
          })
      )
    ;
  }

  /**
   * Logout
   * @param {Object} data
   * @return Promise
   */
  logout(data)
  {
    return new Promise((resolve) => {
      return this._api.post(_static.API_USER_LOGOUT, data || {})
      .then(() => {}, err => {}) // try/catch all
      .finally(data => {
        // Clear auth user
        this._store.dispatch(userAuthSet(null));
        // Return, chain promise call
        return resolve(data || { data: true });
      });
    });
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
          let rtn = true;
          // Filter by: fullname or tel?
          if (filters.fullname_or_tel) {
            rtn = false;
            let fnOrTelLC = filters.fullname_or_tel.toString().toLowerCase();
            let fnLC = item.fullname().toString().toLowerCase();
            let telLC = item.tel.toString().toLowerCase();
            if ((fnLC.indexOf(fnOrTelLC) >= 0)
                || (telLC.indexOf(fnOrTelLC) >= 0)
            ) {
                rtn = true;
            }
            // console.log('fnLC: ', fnLC, fnLC.indexOf(fnOrTelLC));
            // console.log('telLC: ', telLC, telLC.indexOf(fnOrTelLC));
            // console.log('rtn: ', rtn);
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
   * Get list
   * @returns Promise
   */
  list(_opts = {})
  {
    let opts = Object.assign({
      // itemsPerPage:,
      // page,
      // is_active
      // is_system
    }, _opts);
    return this._api.get(_static.API_USER_LIST, opts);
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
   * Get options (list opiton)
   * @param {Object} _opts Options
   * @returns Promise
   */
  getOptions(_opts = {})
  {
    let opts = Object.assign({}, _opts);
    return this._api.get(_static.API_USER_OPTS, opts);
  }

  /**
   * Get options full
   * @param {Object} _opts Options
   * @returns Promise
   */
  getOptionsFull(_opts = {})
  {
    let apiOpts = Object.assign({
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE
    }, _opts);
    let opts = Object.assign({}, apiOpts['_opts']);
    delete apiOpts['_opts'];

    return this.list(apiOpts)
      .then(({ items }) => {
        return opts['raw'] ? items : items.map(({ full_name: name, user_id: id, user_name }) => ({ name, id, user_name }));
      });
  }

  /**
   * @return {Promise}
   */
  create(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, this.fillable(), _data);
    // console.log('User#create: ', data);
    /* if (!data.fullname) {
      throw new Error('Data `fullname` is required!');
    } */
    // Init
    // +++
    /* if (!data.created_at) {
      data.created_at = new Date();
    } */

    //
    // let ent = new UserEntity(data);
    // this._store.dispatch(userAdd(ent));

    //
    return this._api.post(_static.API_USER_CREATE, data);
  }

  /**
   * @return {Promise}
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.get(_static.API_USER_READ.replace(':id', id), data)
      .then((data) => new UserEntity(data))
    ;
  }

  /**
   * @return {Promise}
   */
  update(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    /* if (!data.fullname) {
      throw new Error('Data `fullname` is required!');
    } */
    // Init
    // +++
    /* if (!data.updated_at) {
      data.updated_at = new Date();
    } */

    //
    return this._api.put(_static.API_USER_UPDATE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.delete(_static.API_USER_DELETE.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  changePassword(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_USER_CHANGE_PASSWORD.replace(':id', id), data);
  }

  /**
   * @return {Promise}
   */
  changePasswordUser(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    return this._api.put(_static.API_CHANGE_PASSWORD_USER.replace(':id', id), data);
  }
}
// Make alias
const _static = window._globModelUser = UserModel;

// Add events
_static._apiStatic
  .addEventListener('beforeRequest', (event) => {
    let { args: { config } } = event;
    // Inject 'header'
    let { headers = {} } = config;
    // +++ auth token data
    let { name: hAuthName, value: hAuthValue } = _static.buildAuthHeader();
    if (hAuthName && hAuthValue) {
      headers[hAuthName] = hAuthValue;
    }
    Object.assign(config, { headers });
    //.end*/
    // console.log('beforeRequest: ', config);
  })
  .addEventListener('request', (event) => {
    let { args: { /* config, */ incomming } } = event;
    //
    incomming.then(apiData => {
      // console.log('request: ', apiData);
      delete apiData._;
      // chain call
      return apiData;
    })
  })
  .addEventListener('beforeRefreshToken', (event) => {
    let { args: authData } = event;
    let userAuth = _static.getUserAuthStatic();
    Object.assign(authData, userAuth);
  })
  .addEventListener('afterRefreshToken', (event) => {
    let { args: authData } = event;
    _static.storeUserAuthStatic(authData);
  })
;
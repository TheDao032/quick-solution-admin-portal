import axios from 'axios';

/**
 * @class ApiRestful
 */
export default class ApiRestful
{
  /** @var {String} */
  static API_URL_ROOT = (process.env.REACT_APP_API_URL_ROOT || '/api/');
  /** @var {String} */
  static API_AUTH_REFRESH_TOKEN = 'auth/refresh-token';
  /**
   * @return {String}
   */
  static buildApiUri(api) {
    return `${_static.API_URL_ROOT}${api}`;
  }

  /**
   * Chuyen doi, format du lieu tu api tra ve cho dong bo
   * @param {Object|null} data
   * @return {Object|null}
   */
  static convertApiErrData(data)
  {
    if (data) {
      let { errors: errArr } = data;
      if (errArr && errArr.length) {
        let errors = [];
        errArr.forEach((err) => {
          errors = errors.concat(err.messages || []);
        });
        Object.assign(data, { errors });
      }
    }
    // console.log('convertApiErrData: ', data);
    return data;
  }

  /**
   */
  constructor()
  {
    // @var {String}
    this._evtKey = '' + (new Date().getTime());
  }

  /* Events */
  /**
   * @param {*} eventName 
   * @param {*} listener 
   */
  addEventListener(eventName, listener) {
    if (!(eventName && listener)) {
      return this;
    }
    window.addEventListener(`${this._evtKey}_${eventName}`, listener, false);
    return this;
  }
  /**
   * @param {*} eventName 
   * @param {*} listener 
   */
  removeEventListener(eventName, listener) {
    if (!eventName) {
      return this;
    }
    window.removeEventListener(`${this._evtKey}_${eventName}`, listener);
    return this;
  }
  /**
   * @param {*} eventName
   */
  _dispatchEvent(eventName, args) {
    let evt = new Event(`${this._evtKey}_${eventName}`);
    Object.assign(evt, { args });
    return window.dispatchEvent(evt);
  }
  //.end

  /** @var number */
  _sessionExpiredTimer = null;

  /**
   * @TODO:
   * @param {Object} response
   */
  refreshAuthData(response) {
    return new Promise((resolve, reject) => {
      // Case: NG (not good)
      const funcNG = (err) => {
        if (err) {
          return reject(new Error(err));
        }
        if (!this._sessionExpiredTimer) {
          // alert(window._$g._('Your session has expired, re-login please!'));
          window._$g.rdr('/logout');
          this._sessionExpiredTimer = setTimeout(() => (this._sessionExpiredTimer = null), 1e3);
        }
      };
      //
      if (response) {
        let { message, status } = response || {};
        if (message === 'jwt expired' && (401 === status)) {
          let authData = {};
          this._dispatchEvent('beforeRefreshToken', authData);
          // T/H: KHONG co thong tin auth --> force re-login
          if (!Object.keys(authData).length) {
            return funcNG();
          }
          let { refreshToken } = authData;
          // Refresh token
          let _self = new _static();
          return resolve(
            _self.post(_static.API_AUTH_REFRESH_TOKEN, { refreshToken })
              .then(data => {
                this._dispatchEvent('afterRefreshToken', data);
                return data;
              })
              .catch(() => funcNG())
          );
        }
      }
      // Case: no need to refresh token
      resolve();
    });
  }

  /**
   * 
   * @param {Object} _config
   * @return Promise
   */
  _request(_config)
  {
    // Get, format input
    let self = this;
    // +++
    let config = Object.assign({
      baseURL: _static.API_URL_ROOT,
    }, _config = _config || {});

    // Send request?!
    this._dispatchEvent('beforeRequest', { config });
    let incomming = new Promise((resolve, reject) => {
      return axios(config)
        .then(response => {
          // handle success
          // console.log('response: ', response);
          if (config.responseType && config.responseType === 'blob') {
            return response.data;
          };
          let { data: apiData } = response.data;
          apiData = Object.assign(apiData || {}, { _: () => response });
          // chain response
          return apiData;
        })
        .then(resolve)
        .catch(err => {
          // handle err
          let { response } = err;
          if (!response) {
            throw err;
          }
          let { data: apiData } = response;
          apiData = Object.assign(apiData || {}, { _: () => response });
          // Case: token expired?
          this.refreshAuthData(apiData)
            .then(data => {
              // Case: no need to refresh token
              if (!data) {
                // Convert api's errors format to client format
                _static.convertApiErrData(apiData);
                return reject(apiData);
              }
              // Case: refresh token OK --> auto recall
              resolve(self._request(config));
            })
            // Case: refresh token has failed
            .catch(reject);
        })
      ;
    });
    this._dispatchEvent('request', { config, incomming });
    return incomming;
  }

  /**
   * GET calls
   * @param {String} url
   * @param {Object} params
   * @param {Object} _config
   * @return Promise
   */
  get(url, params, _config) {
    let config = Object.assign({
      url,
      method: 'get',
      params
    }, _config || {});
    return this._request(config);
  }

  /**
   * POST calls
   * @param {String} url
   * @param {Object} data
   * @param {Object} _config
   * @return Promise
   */
  post(url, data, _config) {
    let config = Object.assign({
      url,
      method: 'post',
      data
    }, _config || {});
    return this._request(config);
  }

  /**
   * PUT calls
   * @param {String} url
   * @param {Object} data
   * @param {Object} _config
   * @return Promise
   */
  put(url, data, _config) {
    let config = Object.assign({
      url,
      method: 'put',
      data
    }, _config || {});
    return this._request(config);
  }

  /**
   * PATCH calls
   * @param {String} url
   * @param {Object} data
   * @param {Object} _config
   * @return Promise
   */
  patch(url, data, _config) {
    let config = Object.assign({
      url,
      method: 'patch',
      data
    }, _config || {});
    return this._request(config);
  }

  /**
   * DELETE calls
   * @param {String} url
   * @param {Object} params
   * @param {Object} _config
   * @return Promise
   */
  delete(url, params, _config) {
    let config = Object.assign({
      url,
      method: 'delete',
      params
    }, _config || {});
    return this._request(config);
  }

  /**
   * GET calls download file
   * @param {String} url
   * @param {Object} params
   * @param {Object} _config
   * @return Promise
   */
  file(url, params, _config) {
    let config = Object.assign({
      responseType: 'blob',
    }, _config);
    return this.get(url, params, config);
  }
}
// Make alias
const _static = ApiRestful;

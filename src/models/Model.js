//
import Api from '../utils/ApiRestful';
import { store } from '../store';
// Util(s)
import { jqxGridColumns } from '../utils/jqwidgets';

// global api instance
const _apiInst = new Api();
window._apiInst = _apiInst;

/**
 * @class Model
 */
export default class Model
{
  /** @var {Api} */
  _api = _apiInst;

  /** @var {Api} */
  static _apiStatic = _apiInst;

  /** @var {Api} */
  static apiClass = Api;

  /**
   * @var {Object} redux store object
   */
  _store = null;

  /**
   * @var {Object} redux store object
   */
  static _storeStatic = store;

  /**
   * @var {Object} redux store object
   */
  static _MAX_ITEMS_PER_PAGE = (Math.pow(2, 31) - 1);

  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = null;

  /**
   * @var {Ref}
   */
  _entity = null;

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'id';

  /**
   * 
   * @param {object} data 
   */
  constructor(data)
  {
    // @var {Object} redux store object
    this._store = store;
  }

  /**
   * 
   * @returns mixed
   */
  stateData()
  {
    let data = this._store.getState()[this._stateKeyName];
    return data;
  }

  /**
   * 
   * @returns mixed
   */
  dataList(data, opts)
  {
    if (this._entity && data instanceof Array) {
      let Entity = this._entity;
      data = data.map(eData => new Entity(eData));
    }
    return data;
  }

  /**
   * @param {Object} mapStateToProps
   * @param {Object} mapDispatchToProps
   * @param {Object} mergeProps
   * @param {Object} options
   */
  connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
  {
    // connect();
  }

  /**
   * Return jqx's grid columns
   * @param {Array} _jqxGridColumns columns data
   * @param {Object} opts Options
   * @return {Array}
   */
  static jqxGridProps(_jqxGridColumns, opts)
  {
    // Get, format options
    // ...

    // 
    let { columns, columngroups, datafields } = jqxGridColumns(_jqxGridColumns, opts)
    let source = {
      datafields,
      totalrecords: 0,
      // Events
      // +++ convert jqx data to BE (backend data)
      formatData: function(data) {
        // Convert jqx data to BE (backend data)
        return _static.jqxGridDataToApiData(data);
      },
      // +++
      loadError: function(jqXHR, textStatus/*String*/, errorThrown/*String*/) {
        let response = null;
        if (jqXHR.responseText) {
          try {
            response = JSON.parse(jqXHR.responseText);
          } catch (error) {
            //...
          }
        }
        if (response) {
          _apiInst.refreshAuthData(response, () => {
            // Fire events
            if (typeof source.afterLoadError === 'function') {
              source.afterLoadError();
            }
          });
        }
      },
      // +++
      beforeprocessing: (dataLv0) => {
        let { data = {} } = dataLv0;
        source.totalrecords = data.totalItems || 0;
        // events
        if (opts.postBeforeProcessing) {
          let postData = opts.postBeforeProcessing(data);
          if (postData !== undefined) {
            data = postData;
          }
        }
        return data;
      },
    };
    let props = {
      columns,
      columngroups,
      source
    };

    return props;
  }

  /**
   * Helper: convert jqxgrid data to api data
   * @param {Object} data
   * @param {Object}
   */
  static jqxGridDataToApiData(_data)
  {
    // jqxGrid data
    let {
      //#sort
      sortdatafield,
      sortorder,
      //#paging
      pagenum = 0,
      pagesize = 0,
      // recordstartindex,
      // recordendindex,
      //#filters
      filterGroups = []
    } = _data || {};
    //
    let sortOrder = undefined;
    if (sortdatafield && sortorder) {
      sortorder = sortorder.toUpperCase();
    }

    // Backend data
    // +++
    let filters = [];
    filterGroups.forEach(function(filterGroup) {
      let { field, filters: filterLv0 } = filterGroup || {};
      let operator = filterLv0[0].operator.toUpperCase();
      filters.push({
        field,
        condition: filterLv0[0].condition,
        value: filterLv0[0].value,
        operator: (operator === "OR") ? 1 : 0
      });
    });
    // +++
    let data = {
      //#sort
      sortDatafield: sortdatafield,
      sortOrder: (sortOrder ? ((sortOrder === "DESC") ? 1 : 0) : undefined),
      //#paging
      page: pagenum + 1,
      itemsPerPage: pagesize,
      //#filters
      filters
    };
    // console.log(data);

    // Return;
    return data;
  }

  /**
   * Helper make entity
   * @return Entity
   */
  mkEnt(data) {
    let Entity = this._entity;
    return new Entity(data);
  }
}
// Make alias
const _static = Model;

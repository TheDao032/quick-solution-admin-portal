import React, { PureComponent } from 'react';
import { Card, CardBody, CardHeader, Button } from 'reactstrap';
import moment from 'moment';
import fileDownload from 'js-file-download';

// Material
import MUIDataTable from 'mui-datatables';
import {FormControlLabel, CircularProgress, Switch, Checkbox} from '@material-ui/core';

// Util(s)
import { configTableOptions, configIDRowTable } from '../../../utils';
import CustomPagination from '../../../utils/CustomPagination';

// Component(s)
import { CheckAccess } from '../../../navigation/VerifyAccess';

// Model(s)
// ...

// @var {Object}
const _$g = window._$g;

/**
 * @class CommonMUIGrid
 */
export default class CommonMUIGrid extends PureComponent {
  // Init state
  state = {
    /** @var {Object} */
    _pickDataItems: {},
    // @var {Boolean}
    toggleSearch: true,
    // @var {Boolean}
    isLoading: false,
    // @var {Array<Object>}
    data: [],
    // @var {Object}
    query: {
      // @var {Number|String}
      itemsPerPage: 25,
      // @var {Number|StringNumber}
      totalItems: 0,
      // @var {Number|String}
      page: 1,
      // @var {Number|String}
      totalPages: 0,
      // ----
      // @var {Number|String} // 2 : all , 1: active , 0 : not active
      is_active: "2",
    },
    // @var {Object}
    bundle: {}
  };

  /**
   * Helper: get main model class (constructor)
   * @return {Model}
   */
  _modelClass() {
    return this._model().constructor;
  }

  /**
   * Helper: get main model class primary key (constructor)
   * @return {String}
   */
  _modelClassPK() {
    return this._modelClass().primaryKey;
  }

  /* constructor(props) {
    super(props)
  } */

  /**
   * @abstract Request/Get all needed data...
   */
  _getBundleData = async () => {};

  /**
   * Helper request/get all needed data...
   * @param {Array<Promise>} all
   * @param {Object} opts
   * @return Promise
   */
  async _callBundleData(all = [], opts = {}) {
    return Promise.all(all)
      .catch(err => _$g.dialogs.alert(
        _$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ));
  }

  /**
   * @var {Object} Phrases
   */
  _phrData = {
    'BTN_ADD': 'Thêm mới',
    'BTN_EXCEL': 'Xuất excel',
  };

  /**
   * @return {Object} Phrases
   */
  _phrases = () => this._phrData;

  /**
   * Phrases
   * @param {String} txt
   * @return {String}
   */
  _ = (txt) => {
    return this._phrases()[txt] || txt;
  };

  /**
   * Define/Get component styles
   * @return {Object}
   */
  _stylesSelf = () => ({
    root: "clearfix",
    cardFilter: "animated fadeIn z-index-222 mb-3"
  });

  /**
   * Define/Get component styles
   * @return {Object}
   */
  _styles = () => this._stylesSelf();

  /**
   * @var {Object}
   */
  _checkAccessConfig = {};

  /**
   * Define/Get columns default options
   * @return {Object}
   */
  _columnDefaultOpts = () => ({ filter: false, sort: false });

  /**
   * Helper: config column ID row table
   * @param {String} pk Model primary key
   * @param {String} url
   * @return {Object}
   */
  _cnfColIDRowTbl = (pk, url) => configIDRowTable(pk, url, this.state.query);

  /**
   * Helper: get picked data items
   * @return {Object}
   */
  _getPickDataItems = () => {
    let res = {};
    let {_pickDataItems, data = []} = this.state;
    Object.keys(_pickDataItems).forEach(key => {
      let idx = _pickDataItems[key];
      !isNaN(idx) && (this._bdChkbEnabledByDataItem(data[idx])) && (res[idx] = data[idx]);
    });
    return res;
  };

  /**
   * @param {Object} item
   * @return {Boolean}
   */
  _bdChkbEnabledByDataItem = (item) => {
    return true;
  }

  /**
   * Helper: config column ID row table
   * @param {String} pk Model primary key
   * @param {Object} opts
   * @return {Object}
   */
  _cnfColCheckboxRowTbl = (pk, opts = {}) => {
    let colOpts = this._columnDefaultOpts();

    return {
      name: pk,
      label: "",
      options: {...colOpts, ...{
        customHeadRender: (columnMeta/*, handleToggleColumn*/) => {
          let {_pickDataItems, data = []} = this.state;
          let availDataLength = data.filter(this._bdChkbEnabledByDataItem).length;
          let checked = Object.values(_pickDataItems).filter(_i => (undefined !== _i));
          checked = (checked.length >= availDataLength);
          return (
            <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
              <div className="text-center">
                {(!opts.single && !opts.noCheckboxAll) ? <Checkbox
                  checked={checked}
                  value={''}
                  onChange={({ target }) => {
                    data.forEach((item, idx) => {
                      delete _pickDataItems[item[pk]];
                      if (target.checked && this._bdChkbEnabledByDataItem(item)) {
                        _pickDataItems[item[pk]] = idx;
                      }
                    });
                    this.setState({ _pickDataItems: {..._pickDataItems} });
                  }}
                /> : null}
              </div>
            </th>
          )
        }},
        customBodyRender: (value, tableMeta/*, updateValue*/) => {
          let {_pickDataItems, data} = this.state;
          let {rowIndex} = tableMeta;
          let dataItem = data[rowIndex];
          let _props = {
            value,
            checked: (undefined !== _pickDataItems[value]),
            disabled: !this._bdChkbEnabledByDataItem(dataItem),
            onChange: ({ target }) => {
              if (opts.single) {
                _pickDataItems = {};
              }
              delete _pickDataItems[value];
              if (target.checked) {
                Object.assign(_pickDataItems, { [value]: rowIndex });
              }
              this.setState({ _pickDataItems: {..._pickDataItems} }, () => {
                // Fire callback?!
                opts.onChange && opts.onChange(target, { value, tableMeta, dataItem });
              });
            }
          };
          return (
            <div className="text-center">
              <Checkbox {..._props} checked={_props.checked && !_props.disabled} />
            </div>
          );
        }
      },
    };
  };

  /**
   * Define/Get standard change-status column
   * @return {Object}
   */
  _stdColChangeStatus = (_opts = {}) => {
    let colOpts = this._columnDefaultOpts();
    const dataPK = this._modelClassPK(); // primary key

    return {
      name: "is_active",
      label: "Kích hoạt",
      options: {...colOpts, ...{
        customHeadRender: (columnMeta/*, handleToggleColumn*/) => {
          return (
            <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
              <div className="text-center">{columnMeta.label}</div>
            </th>
          )
        }},
        customBodyRender: (value, tableMeta/*, updateValue*/) => {
          let {data} = this.state;
          return (
            <div className="text-center">
              {('ACT_BTN_CHANGE_STATUS' in this._checkAccessConfig) ? <CheckAccess permission={this._checkAccessConfig.ACT_BTN_CHANGE_STATUS}>
                <FormControlLabel
                  label={value ? "Có" : "Không"}
                  value={value ? "Có" : "Không"}
                  control={<Switch color="primary" checked={('' + value) === '1'} value={value} />}
                  onChange={evt => {
                    let checked = ((1 * evt.target.value) === 1 ? 0 : 1);
                    this.handleChangeStatus(checked, data[tableMeta['rowIndex']][dataPK], tableMeta['rowIndex'], data[tableMeta['rowIndex']]);
                  }}
                />
              </CheckAccess> : null}
            </div>
          );
        }
      },
    };
  };

  /**
   * Define/Get standard actions column
   * @return {Object}
   */
  _stdColActions = (_opts = {}) => {
    let colOpts = this._columnDefaultOpts();
    const dataPK = this._modelClassPK(); // primary key

    return {
      name: "Thao tác",
      options: {...colOpts, ...{
        empty: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div className="text-center">
              {('ACT_BTN_DETAIL' in this._checkAccessConfig) ? <CheckAccess permission={this._checkAccessConfig.ACT_BTN_DETAIL}>
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={() => this.handleActionItemClick('read', this.state.data[tableMeta['rowIndex']][dataPK], tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
              </CheckAccess> : null}
              {('ACT_BTN_EDIT' in this._checkAccessConfig) ? <CheckAccess permission={this._checkAccessConfig.ACT_BTN_EDIT}>
                <Button color="success" title="Chỉnh sửa" className="mr-1" onClick={() => this.handleActionItemClick('update', this.state.data[tableMeta['rowIndex']][dataPK], tableMeta['rowIndex'])}>
                  <i className="fa fa-edit" />
                </Button>
              </CheckAccess> : null}
              {('ACT_BTN_DEL' in this._checkAccessConfig) ? <CheckAccess permission={this._checkAccessConfig.ACT_BTN_DEL}>
                <Button color="danger" title="Xóa" className="" onClick={() => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']][dataPK], tableMeta['rowIndex'])}>
                  <i className="fa fa-trash" />
                </Button>
              </CheckAccess> : null}
            </div>
          );
        }
      }}
    };
  };

  /**
   * Get query data,...
   * @param {Object} _q
   * @return Promise
   */
  _getQuery = (_q = {}) => {
    let q = Object.assign({}, this.state.query, _q, {
      totalItems: undefined,
      totalPages: undefined
    });
    // --- filter: remove empty data
    (_q = {}) && Object.keys(q).forEach(prop => {
      return _q[prop] = ((null === q[prop] || "" === q[prop]) ? undefined : q[prop]);
    });
    return _q;
  };

  /**
   * Get query data,...
   * @param {Object} _q
   * @param {Object} opts
   * @return Promise
   */
  getData = (_q = {}, opts = {}) => {
    // Get, format query
    let q = this._getQuery(_q);
    // State loading,...
    this.setState({ isLoading: true }, () => {
      // Send request
      const model = this._model();
      const api = model && (model[opts.api] || model['getList'] || model['list']);
      return api && api.bind(model)(q)
        .then(res => {
          let { items, ..._q } = res;
          let query = Object.assign(q, _q);
          this.setState({ isLoading: false, data: items, query });
        });
    });
  };

  componentDidMount() {
    // State loading,..
    this.setState({ isLoading: true }, async () => {
      // Get bundle data
      let bundle = await this._getBundleData();
      // +++
      Object.keys(bundle).forEach((key) => {
        let data = bundle[key];
        let value = this.state[key];
        if (data instanceof Array && value instanceof Array) {
          data = [value[0]].concat(data);
        }
        bundle[key] = data;
      });
      // console.log('bundle@grid: ', bundle);
      // Get query data
      this.setState({ ...bundle }, () => this.getData());
    });
  }

  /**
   * @param {Object} _q
   * @return Promise
   */
  handleSubmitFilter = (_q = {}) => this.getData(_q);

  /**
   * Handle top button "Add (create)"
   * @return void
   */
  handleClickAdd = () => _$g.rdr(this._getRoutes('create'));

  /**
   * Handle top button "Excel"
   * @param 
   * @return void
   */
  handleClickExcel = (_q = {}) => {
    // Get, format query
    let q = {};
    // Send request
    const model = this._model();
    const api = model && (model['exportExcel']);
    return api && api.bind(model)(q)
      .then(res => {
        const configDate = moment().format("DDMMYYYY");
        fileDownload(res, `file_${configDate}.csv`);
      })
      .catch((error) => {
        console.log(error)
      });
  };

  /**
   * Handle paging
   * @return void
   */
  handleChangePage = (page) => this.getData({ page: page + 1 });

  /**
   * Handle paging
   * @return void
   */
  handleChangeRowsPerPage = (event) => this.getData({
    itemsPerPage: event.target.value, page: 1
  });

  /**
   * Handle action buttons
   * @return void
   */
  handleActionItemClick = (type, id, rowIndex) => {
    const route = this._getRoutes(type);
    if (type.match(/del/i)) {
      _$g.dialogs.prompt(
        'Bạn có chắc chắn muốn xóa dữ liệu đang chọn?',
        'Xóa',
        (confirm) => this._handleClose(confirm, id, rowIndex)
      );
    } else {
      _$g.rdr(`${route}${id}`);
    }
  };

  _handleClose(confirm, id, rowIndex) {
    if (confirm) {
      this._model().delete(id)
        .then(() => this.getData())
        .catch((apiData) => {
          let { statusText, message } = apiData;
          const error = statusText || message || 'Đã có lỗi trong quá trình xử lý. Vui lòng thử lại sau hoặc liên hệ bộ phận IT để biết thêm chi tiết.';
          _$g.dialogs.alert(_$g._(error));
        });
    }
  }

  handleChangeStatus = (status, id, rowIndex, row) => {
    return _$g.dialogs.prompt(
      'Bạn có chắc chắn muốn thay đổi trạng thái dữ liệu đang chọn?',
      'Cập nhật',
      (confirm) => this._changeStatus(confirm, status, id, rowIndex)
    );
  };

  _changeStatus = (confirm, status, id, idx) => {
    if (confirm) {
      let postData = {is_active: status ? 1 : 0};
      this._model().changeStatus(id, postData)
        .then(() => {
          const data = [...this.state.data];
          data[idx].is_active = status;
          this.setState({ data }, () => _$g.toastr.show('Cập nhật trạng thái thành công.', 'success'));
        })
        .catch(() => _$g.toastr.show('Cập nhật trạng thái không thành công.', 'error'));
    }
  };

  _renderTopButtonAdd = () => {
    return ('TOP_BTN_ADD' in this._checkAccessConfig) ? (
      <CheckAccess permission={this._checkAccessConfig.TOP_BTN_ADD}>
        <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
          <i className="fa fa-plus" /> <span className="ml-1">{this._('BTN_ADD')}</span>
        </Button>
      </CheckAccess>
    ) : null;
  };

  _renderTopButtonExcel = () => {
    return ('TOP_BTN_EXCEL' in this._checkAccessConfig) ? (
      <CheckAccess permission={this._checkAccessConfig.TOP_BTN_EXCEL}>
        <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickExcel()} color="success" size="sm">
          <i className="fa fa-plus" /> <span className="ml-1">{this._('BTN_EXCEL')}</span>
        </Button>
      </CheckAccess>
    ) : null;
  };

  _renderTopButtons = () => {
    return (
      <div className="clearfix">
        {this._renderTopButtonAdd()}
        {this._renderTopButtonExcel()}
      </div>
    );
  };

  _renderFilterComponent = () => {
    const ComponentFilter = this._componentFilter();
    const styles = this._styles();

    return ComponentFilter ? (
      <Card className={styles.cardFilter}>
          <CardHeader className="d-flex">
            <div className="flex-fill font-weight-bold">Thông tin tìm kiếm</div>
            <div
              className="minimize-icon cur-pointer"
              onClick={() => this.setState(({ toggleSearch }) => ({ toggleSearch: !toggleSearch}))}
            >
              <i className={`fa ${this.state.toggleSearch ? 'fa-minus' : 'fa-plus'}`} />
            </div>
          </CardHeader>
          <CardBody className="px-0 py-0" hidden={!this.state.toggleSearch}>
            <div className="MuiPaper-filter__custom z-index-2">
              <ComponentFilter {...this.state.query} handleSubmit={this.handleSubmitFilter} />
            </div>
          </CardBody>
        </Card>
    ) : null;
  };

  _renderCardBodyHeader = () => null;

  _renderCardBodyFooter = () => null;

  render() {
    const {isLoading, query} = this.state;
    const options = configTableOptions(query.totalItems * 1, query.page * 1, query);
    const styles = this._styles();

    return (
      <div className={styles.root}>
        {/* Filters */}
        {this._renderFilterComponent()}
        {/* TOP buttons */}
        {this._renderTopButtons()}
        {/* @end#TOP buttons */}
        <Card className="animated fadeIn">
          <CardBody className="px-0 py-0">
            <div className="MuiPaper-root__custom">
                {this._renderCardBodyHeader()}
                {isLoading
                  ? (<div className="d-flex flex-fill justify-content-center mt-5 mb-5">
                    <CircularProgress />
                  </div>)
                  : (<div className="clearfix">
                    <MUIDataTable
                      data={this.state.data}
                      columns={this.columns()}
                      options={options}
                    />
                    <CustomPagination
                      count={options.count * 1}
                      rowsPerPage={options.rowsPerPage * 1}
                      page={(query.page * 1) - 1}
                      onChangePage={(evt, newPage) => this.handleChangePage(newPage)}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                    {this._renderCardBodyFooter()}
                  </div>)
                }
              </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

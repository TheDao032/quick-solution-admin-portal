import React from 'react';
import { Button } from 'reactstrap';

// Material
import { Checkbox } from '@material-ui/core';

// Util(s)
// ...

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
import { CheckAccess } from '../../navigation/VerifyAccess';
import BusinessFilter from './BusinessFilter';

// Model(s)
import BusinessModel from '../../models/BusinessModel';

// Assets
import './styles.scss';

/**
 * @class Businesss
 */
export default class Businesss extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return BusinessModel
   */
  _model() {
    // Init model(s)
    if (!this._businessModel) {
      this._businessModel = new BusinessModel();
    }
    return this._businessModel;
  }

  /**
   * Self regist component filter
   * @return {Object} BusinessFilter
   */
  _componentFilter = () => BusinessFilter;

  /**
   * Request/Get all needed data...
   */
  _getBundleData = async () => {
    let bundle = {};
    let all = [];
    if (all.length) {
      await this._callBundleData(all);
    }
    return bundle;
  }

  /**
   * Define permissions
   * @var {Object}
   */
  _checkAccessConfig = {
    TOP_BTN_ADD: "AM_BUSINESS_ADD",
    ACT_BTN_DETAIL: "AM_BUSINESS_VIEW",
    ACT_BTN_EDIT: "AM_BUSINESS_EDIT",
    ACT_BTN_DEL: "AM_BUSINESS_DEL",
    ACT_BTN_CHANGE_STATUS: "AM_BUSINESS_EDIT",
  };

  /**
   * Define routes
   * @return {Object|String}
   */
  _getRoutes = (type) => {
    let routes = {
      create: '/businesses/add',
      read: '/businesses/detail/',
      update: '/businesses/edit/',
      delete: '/businesses/delete/'
    };
    return type ? routes[type] : routes;
  };

  constructor(props) {
    super(props);

    // Init model(s)
    this._model(); // register main model

    // Init state
    // ...extends?!
    Object.assign(this.state, {
      // @var {Object}
      selectedItems: {},
      // @var {Object}
      query: {...this.state.query, ...{
        // @var {Number|String}
        is_active: "1",
        // @var {}
        handleActionSelect: props.handleActionSelect, 
      }}
    });
  }

  /**
   * Define/Get component styles
   * @return {Object}
   */
  _styles = () => {
    let { handleActionSelect } = this.props;
    let styles = this._stylesSelf();
    if (handleActionSelect) {
      styles = Object.assign({}, styles, {
        root: `${styles.root} modal-select-business`,
        cardFilter: `animated fadeIn z-index-222 m-0 rounded-0`,
      });
    }
    return styles;
  };

  /**
   * Define grid's columns
   * @return {Array}
   */
  columns = () => {
    const { handleActionSelect } = this.props;

    // Column default options
    const opts = this._columnDefaultOpts();
    const dataPK = this._modelClass().primaryKey; // primary key

    let columns = [
      this._cnfColIDRowTbl(dataPK, this._getRoutes('read')),
      {
        name: "company_name",
        label: "Trực thuộc công ty",
        options: {...opts}
      },
      {
        name: "area_name",
        label: "Khu vực",
        options: {...opts}
      },
      {
        name: "business_name",
        label: "Tên cơ sở",
        options: {...opts}
      },
      {
        name: "business_type_name",
        label: "Loại hình cơ sở",
        options: {...opts}
      },
      {
        name: "opening_date",
        label: "Ngày mở cửa",
        options: {...opts}
      },
      {
        name: "business_phone_number",
        label: "Số điện thoại",
        options: {...opts}
      },
      {
        name: "business_mail",
        label: "Email",
        options: {...opts}
      },
      {
        name: "business_website",
        label: "Website",
        options: {...opts}
      },
      {
        name: "business_address_full",
        label: "Địa chỉ",
        options: {...opts}
      },
      this._stdColChangeStatus(),
      this._stdColActions(),
    ];

    if (handleActionSelect) {
      //config columns for modal select business
      //get columns: name, type, phone and address
      columns = columns.filter((col, idx) => [1, 2, 3, 5, 6].indexOf(idx) > -1);
      columns.unshift({
          name: "business_id",
          label: "#",
          options: {
            filter: false,
            sort: false,
            customHeadRender: (columnMeta/*, handleToggleColumn*/) => {
              let { data, selectedItems } = this.state;
              let checked = Object.keys(selectedItems).length === (data || []).length && (data || []).length !== 0;
              return (
                <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                  <div className="text-center">
                    <Checkbox
                      checked={checked}
                      onChange={({ target }) => {
                        // let { selectedItems } = this.state;
                        if (target.checked) {
                          (data || []).forEach(({business_id, business_name}) => (
                            selectedItems[business_id] = {business_id, business_name}
                          ));
                          selectedItems = { ...selectedItems };
                        } else {
                          selectedItems = {};
                        }
                        this.setState({ selectedItems });
                      }}
                    />
                  </div>
                </th>
              )
            },
            customBodyRender: (value/*, tableMeta, updateValue*/) => {
              let { data, selectedItems } = this.state;
              return (
                <div className={`text-center color-overlay`}>
                  <Checkbox
                    name="business_id_selected"
                    checked={!!selectedItems[value]}
                    className="checkbox-click"
                    value={value}
                    onChange={(evt) => {
                      if (selectedItems[value]) {
                        delete selectedItems[value];
                      } else {
                        let item = (data || []).find((item) => (('' + item.business_id) === ('' + value)));
                        item && (selectedItems[value] = {business_id: item.business_id, business_name: item.business_name});
                      }
                      selectedItems = { ...selectedItems };
                      this.setState({ selectedItems });
                    }}
                  />
                </div>
              );
            }
          }
        })
    }

    return columns;
  };

  _renderTopButtonExcel() {
    return (
      <CheckAccess permission="AM_BUSINESS_EXPORT">
        <Button className="col-12 max-w-110 mb-2 mobile-reset-width" color="excel" size="sm">
          <i className="fa fa-download mr-1" />Xuất excel
        </Button>
      </CheckAccess>
    );
  }

  _renderTopButtons() {
    const { handleActionSelect } = this.props;

    return (
      !handleActionSelect ? (<div className="clearfix">
        {this._renderTopButtonAdd()}
        {this._renderTopButtonExcel()}
      </div>) : null
    );
  }

  _renderCardBodyFooter = () => {
    const { handleActionSelect } = this.props;
    let { selectedItems } = this.state;

    return handleActionSelect ? (<div className="position-absolute control-select">
      <Button onClick={() => handleActionSelect(selectedItems)} className="btn-block-sm btn-success mt-md-0 mt-sm-2 mr-2">
        <i className="fa fa-check-circle mr-1" />Chọn
      </Button>
      <Button onClick={() => handleActionSelect()} className="btn-block-sm mt-md-0 mt-sm-2 mr-2">
        <i className="fa fa-times-circle mr-1" />Đóng
      </Button>
    </div>) : null;
  };
}

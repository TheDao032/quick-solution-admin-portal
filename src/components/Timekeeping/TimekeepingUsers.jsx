import React from 'react';

// Assets
import "./styles.scss";

// Util(s)
// import { mapDataOptions4Select } from 'utils/html';

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
// import { CheckAccess } from '../../navigation/VerifyAccess';
import TimekeepingUserFilter from './TimekeepingUserFilter';
import TimekeepingUserConfirm from './TimekeepingUserConfirm';

// Model(s)
import TimekeepingUserModel from '../../models/TimekeepingUserModel';

// @var {Object}
const _$g = window._$g;

/**
 * @class TimekeepingUsers
 */
export default class TimekeepingUsers extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return TimekeepingUserModel
   */
  _model() {
    // Init model(s)
    if (!this._timekeepingUserModel) {
      this._timekeepingUserModel = new TimekeepingUserModel();
    }
    return this._timekeepingUserModel;
  }

  /**
   * Self regist component filter
   * @return {Object} TimekeepingUserFilter
   */
  _componentFilter = () => TimekeepingUserFilter;

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
   * @return {Object} Phrases
   */
  _phrases = () => {
    return Object.assign(this._phrData, {
      'BTN_ADD': 'Xác nhận',
    });
  };

  /**
   * Define permissions
   * @var {Object}
   */
  _checkAccessConfig = {
    TOP_BTN_ADD: "USER_TIMEKEEPING_CF",
    TOP_BTN_EXCEL: "",
    // ACT_BTN_DETAIL: "",
    ACT_BTN_EDIT: "SYS_USER_EDIT",
    ACT_BTN_DEL: "USER_TIMEKEEPING_DEL",
    // ACT_BTN_CHANGE_STATUS: "",
  };

  /**
   * Define routes
   * @return {Object|String}
   */
  _getRoutes = (type) => {
    let routes = {
      create: '/user-timekeeping/add',
      read: '/user-timekeeping/details/',
      update: '/user-timekeeping/edit/',
      delete: '/user-timekeeping/delete/'
    };
    return type ? routes[type] : routes;
  };

  constructor(props) {
    super(props)

    // Init model(s)
    this._model(); // register main model

    // Init state
    // ...extends?!
    Object.assign(this.state, {
      // @var {Boolean}
      willShowApproved: false,
      // @var {Object}
      query: {...this.state.query, ...{
        // @var {Number|String}
        "is_active": "",
      }}
    });
  }

  /**
   * Handle top button "Add (create)"
   * @return void
   */
  handleClickAdd = () => {
    let pickDataItems = Object.keys(this._getPickDataItems());
    // 
    if (pickDataItems.length <= 0) {
      return _$g.dialogs.alert(_$g._(`Bạn vui lòng chọn dòng dữ liệu cần xác nhận!`));
    }
    //
    this.setState({ willShowApproved: true });
  };

  /**
   * 
   * @return void
   */
  handleApproved = (data) => {
    //
    let post = (data || []).map(({
      time_keeping_id, start_time, end_time
    }) => ({
      time_keeping_id, start_time, end_time
    }));
    this._timekeepingUserModel.approve(post)
      .then(() => () => _$g.toastr.show('Xác nhận thành công.', 'success'))
      .catch(() => _$g.toastr.show('Xác nhận không thành công.', 'error'))
      .finally(() => this.setState({ willShowApproved: false }, () => this.getData()));
  };

  /**
   * @param {Object} dataItem
   * @return {Boolean}
   */
  _bdChkbEnabledByDataItem = (dataItem) => {
    if (dataItem['confirm_time']) {
      return false;
    }
    return true;
  };

  /**
   * Define grid's columns
   * @return {Array}
   */
  columns = () => {
    // Column default options
    const opts = this._columnDefaultOpts();
    const dataPK = this._modelClass().primaryKey; // primary key

    return [
      this._cnfColCheckboxRowTbl(dataPK),
      {
        name: "user_id",
        label: "Mã nhân viên",
        options: {...opts}
      },
      {
        name: "user_name",
        label: "Tên nhân viên",
        options: {...opts}
      },
      {
        name: "business_name",
        label: "Cơ sở phòng tập",
        options: {...opts}
      },
      {
        name: "department_name",
        label: "Phòng ban",
        options: {...opts}
      },
      {
        name: "shift",
        label: "Ca làm",
        options: {...opts}
      },
      {
        name: "timekeeping",
        label: "Ngày chấm công",
        options: {...opts}
      },
      {
        name: "time",
        label: "Giờ chấm công",
        options: {...opts}
      },
      {
        name: "confirm_time",
        label: "Xác nhận chấm công",
        options: {...opts}
      },
      // this._stdColChangeStatus(),
      this._stdColActions(),
    ];
  };

  _renderCardBodyHeader = () => {
    let data = Object.values(this._getPickDataItems());
    return this.state.willShowApproved ? (
      <div id="timekeeping_user-approved-div" className="">
        <div className="overlay"><div className="overlay-box">
          <TimekeepingUserConfirm
            data={data}
            onSave={this.handleApproved}
            onClose={() => this.setState({ willShowApproved: false })}
          />
        </div></div>
      </div>
    ) : null;
  };
}

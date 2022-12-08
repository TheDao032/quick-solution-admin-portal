// import React from 'react';

// Util(s)
// ...

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
// import { CheckAccess } from '../../navigation/VerifyAccess';
import MembershipFilter from './MembershipFilter';

// Model(s)
import MembershipModel from '../../models/MembershipModel';
// import { mapDataOptions4Select } from 'utils/html';

/**
 * @class Memberships
 */
export default class Memberships extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return MembershipModel
   */
  _model() {
    // Init model(s)
    if (!this._membershipModel) {
      this._membershipModel = new MembershipModel();
    }
    return this._membershipModel;
  }

  /**
   * Self regist component filter
   * @return {Object} MembershipFilter
   */
  _componentFilter = () => MembershipFilter;

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
    TOP_BTN_ADD: "CRM_MEMBERSHIP_ADD",
    ACT_BTN_DETAIL: "CRM_MEMBERSHIP_VIEW",
    ACT_BTN_EDIT: "CRM_MEMBERSHIP_EDIT",
    ACT_BTN_DEL: "CRM_MEMBERSHIP_DEL",
    ACT_BTN_CHANGE_STATUS: "CRM_MEMBERSHIP_EDIT",
  };

  /**
   * Define routes
   * @return {Object|String}
   */
  _getRoutes = (type) => {
    let routes = {
      create: '/memberships/add',
      read: '/memberships/details/',
      update: '/memberships/edit/',
      delete: '/memberships/delete/'
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
      // @var {Object}
      query: {...this.state.query, ...{
        // @var {Number|String}
        gender: "",
      }}
    });
  }

  /**
   * Define grid's columns
   * @return {Array}
   */
  columns = () => {
    // Column default options
    const opts = this._columnDefaultOpts();
    const dataPK = this._modelClass().primaryKey; // primary key

    return [
      this._cnfColIDRowTbl(dataPK, this._getRoutes('read')),
      {
        name: "customer_code",
        label: "Mã thẻ hội viên",
        options: {...opts}
      },
      {
        name: "full_name",
        label: "Tên hội viên",
        options: {...opts}
      },
      {
        name: "gender",
        label: "Giới tính",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta, updateValue) => {
            return this._membershipModel._entity.genderTextStatic(value);
          }
        }},
      },
      {
        name: "birth_day",
        label: "Ngày sinh",
        options: {...opts}
      },
      {
        name: "phone_number",
        label: "Số điện thoại",
        options: {...opts}
      },
      {
        name: "address_full",
        label: "Địa chỉ",
        options: {...opts}
      },
      {
        name: "business_name",
        label: "Cơ sở/Phòng tập",
        options: {...opts}
      },
      {
        name: "status_member_name",
        label: "Trạng thái",
        options: {...opts}
      },
      this._stdColChangeStatus(),
      this._stdColActions(),
    ];
  };
}

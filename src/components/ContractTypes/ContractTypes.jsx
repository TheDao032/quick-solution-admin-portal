import React from 'react';

// Util(s)
// ...

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
// import { CheckAccess } from '../../navigation/VerifyAccess';
import ContractTypeFilter from './ContractTypeFilter';

// Model(s)
import ContractTypeModel from '../../models/ContractTypeModel';
// import { mapDataOptions4Select } from 'utils/html';

/**
 * @class ContractType
 */
export default class ContractType extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return ContractTypeModel
   */
  _model() {
    // Init model(s)
    if (!this._contractTypeModel) {
      this._contractTypeModel = new ContractTypeModel();
    }
    return this._contractTypeModel;
  }

  /**
   * Self regist component filter
   * @return {Object} ContractTypeFilter
   */
  _componentFilter = () => ContractTypeFilter;

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
    TOP_BTN_ADD: "MD_CONTRACTTYPE_ADD",
    ACT_BTN_DETAIL: "MD_CONTRACTTYPE_VIEW",
    ACT_BTN_EDIT: "MD_CONTRACTTYPE_EDIT",
    ACT_BTN_DEL: "MD_CONTRACTTYPE_DEL",
    ACT_BTN_CHANGE_STATUS: "MD_CONTRACTTYPE_EDIT",
  };

  /**
   * Define routes
   * @return {Object|String}
   */
  _getRoutes = (type) => {
    let routes = {
      create: '/contract-types/add',
      read: '/contract-types/details/',
      update: '/contract-types/edit/',
      delete: '/contract-types/delete/'
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
        // "": "",
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
        name: "contract_type_name",
        label: "Tên loại họp đồng",
        options: {...opts}
      },
      {
        name: "",
        label: "Loại hợp đồng",
        options: {...opts}
      },
      {
        name: "description",
        label: "Mô tả",
        options: {...opts}
      },
      {
        name: "created_date",
        label: "Ngày tạo",
        options: {...opts}
      },
      this._stdColChangeStatus(),
      this._stdColActions(),
    ];
  };
}

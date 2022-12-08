import React from 'react';
import { Button } from 'reactstrap';

// Util(s)
// ...

// Component(s)
import CommonMUIGrid from '../Common/MUIGrid';
import { CheckAccess } from '../../navigation/VerifyAccess';
import ContractFilter from './ContractFilter';

// Model(s)
import ContractModel from '../../models/ContractModel';
// import { mapDataOptions4Select } from 'utils/html';

/**
 * @class Contracts
 */
export default class Contracts extends CommonMUIGrid {
  /**
   * Self regist component's main model
   * @return ContractModel
   */
  _model() {
    // Init model(s)
    if (!this._contractModel) {
      this._contractModel = new ContractModel();
    }
    return this._contractModel;
  }

  /**
   * Self regist component filter
   * @return {Object} ContractFilter
   */
  _componentFilter = () => ContractFilter;

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
    TOP_BTN_ADD: "CT_CONTRACT_ADD",
    TOP_BTN_EXCEL: "CT_CONTRACT_EXPORT",
    ACT_BTN_DETAIL: "CT_CONTRACT_VIEW",
    ACT_BTN_EDIT: "CT_CONTRACT_EDIT",
    ACT_BTN_DEL: "CT_CONTRACT_DEL",
    ACT_BTN_CHANGE_STATUS: "CT_CONTRACT_EDIT",
  };

  /**
   * Define routes
   * @return {Object|String}
   */
  _getRoutes = (type) => {
    let routes = {
      create: '/contracts/add',
      read: '/contracts/details/',
      update: '/contracts/edit/',
      delete: '/contracts/delete/'
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

  _renderTopButtons = () => {
    return (
      <div className="clearfix">
        {this._renderTopButtonAdd()}
        {this._renderTopButtonExcel()}
        <CheckAccess permission="CT_CONTRACT_REVIEW">
          <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickApprove()} color="success" size="sm">
            <i className="fa fa-plus" /> <span className="ml-1">Duyệt</span>
          </Button>
        </CheckAccess>
        <CheckAccess permission="CT_CONTRACT_EDIT">
          <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickTransfer()} color="success" size="sm">
            <i className="fa fa-plus" /> <span className="ml-1">Chuyển nhượng</span>
          </Button>
        </CheckAccess>
        <CheckAccess permission="CT_CONTRACT_EDIT">
          <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickBackup()} color="success" size="sm">
            <i className="fa fa-plus" /> <span className="ml-1">Bảo lưu</span>
          </Button>
        </CheckAccess>
        <CheckAccess permission="SL_RECEIPTS_ADD">
          <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickReceipts()} color="success" size="sm">
            <i className="fa fa-plus" /> <span className="ml-1">Tạo phiếu thu</span>
          </Button>
        </CheckAccess>
      </div>
    );
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
      // this._cnfColIDRowTbl(dataPK, this._getRoutes('read')),
      this._cnfColCheckboxRowTbl(dataPK, {
        noCheckboxAll: true,
        single: true
      }),
      {
        name: "contract_number",
        label: "Số hợp đồng",
        options: {...opts}
      },
      {
        name: "contract_type_name",
        label: "Loại hợp đồng",
        options: {...opts}
      },
      {
        name: "member_id",
        label: "Mã hợp đồng",
        options: {...opts}
      },
      {
        name: "user_name",
        label: "Tên hợp đồng",
        options: {...opts}
      },
      {
        name: "is_renew",
        label: "Hợp đồng gia hạn",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta, updateValue) => {
            return this._contractModel._entity.isRenewTextStatic(value);
          }
        }},
      },
      {
        name: "business_name",
        label: "Cơ sở/Phòng tập",
        options: {...opts}
      },
      {
        name: "active_date",
        label: "Ngày kích hoạt hợp đồng",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center">{value}</div>
            );
          }
        }},
      },
      {
        name: "pay_type_name",
        label: "Hình thức thanh toán",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta/*, updateValue*/) => {
            let {data} = this.state;
            let {is_pay, is_pay_full} = data[tableMeta['rowIndex']];
            return this._contractModel._entity.isPayTypeTextStatic(is_pay, is_pay_full);
          }
        }},
      },
      {
        name: "total_value",
        label: "Tổng giá trị",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-right">{value}</div>
            );
          }
        }},
      },
      {
        name: "contract_status",
        label: "Trạng thái duyệt",
        options: {...opts, ...{
          customBodyRender: (value, tableMeta, updateValue) => {
            return this._contractModel._entity.statusTextStatic(value);
          }
        }},
      },
      {
        name: "created_date",
        label: "Ngày tạo",
        options: {...opts}
      },
      // this._stdColChangeStatus(),
      this._stdColActions(),
    ];
  };
}

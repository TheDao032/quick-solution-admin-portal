import React, { Component } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap'

// Assets
import "./styles-list.scss";

// Material
import MUIDataTable from 'mui-datatables';
import {FormControlLabel, Switch, CircularProgress, Checkbox} from '@material-ui/core';
import CustomPagination from '../../utils/CustomPagination';

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';
import CustomerDataLeadFilter from './CustomerDataLeadFilter';
import CustomerDataLeadCareToolsSms from './CustomerDataLeadCareTools/Sms';
import CustomerDataLeadCareToolsEmail from './CustomerDataLeadCareTools/Email';
import TaskAdd from '../Task/TaskAdd';

// Util(s)
import {configTableOptions, configIDRowTable} from '../../utils/index';

// Model(s)
import BusinessModel from "../../models/BusinessModel";
import CompanyModel from "../../models/CompanyModel";
import CustomerDataLeadModel from '../../models/CustomerDataLeadModel';

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class CustomerDataLeads
 */
class CustomerDataLeads extends Component {
  _customerDataLeadsModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._businessModel = new BusinessModel()
    this._companyModel = new CompanyModel()
    this._customerDataLeadsModel = new CustomerDataLeadModel()

    // Bind method(s)
    this.handleCareAction = this.handleCareAction.bind(this);
  }

  state = {
    toggleSearch: true,
    isLoading: false,
    /** @var {String} */
    careAction: '',
    /** @var {Object} */
    careDataLeadsItems: {},
    page: 0,
    count: 1,
    data: [],
    query: {
      itemsPerPage: 25,
      page: 1,
      is_active: 1,
    },
    /** @var {Object} */
    _pickDataItems: {}
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ isLoading: true });
    (async () => {
      let bundle = await this._getBundleData();
      let { data } = bundle;
      let dataConfig = data ? data.items : []
      let isLoading = false;
      let count = data ? data.totalItems : 0
      let page = 0
      let {
        businessArr = [],
        companies = [],
      } = this.state;
      //
      businessArr = businessArr.concat(bundle.businessArr || []);
      companies = companies.concat(bundle.companies || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig, businessArr, companies,
          count, page,
        });
      })
    })();
    //.end
  }

  /**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    let bundle = {}
    let all = [
      // @TODO:
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['companies'] = data)),
      this._businessModel.getOptionsByUser()
        .then(data => (bundle['businessArr'] = data)),
    ]
    await Promise.all(all)

    let listBusinessID = ''
    if (bundle.businessArr.length > 0) {
      for (let m = 0; m < bundle.businessArr.length; m++) {
        if (m === bundle.businessArr.length - 1) {
          listBusinessID += bundle.businessArr[m].id
        } else {
          listBusinessID += `${bundle.businessArr[m].id}|`
        }
      }
    }

    let getList = [
      this._customerDataLeadsModel.getList({
        itemsPerPage: 25,
        page: 1,
        is_active: 1,
        business_id: !userAuth._isAdministrator() ? listBusinessID : null,
      })
        .then(data => (bundle['data'] = data)),
    ]

    await Promise.all(getList)
      .catch(err => {
        window._$g.dialogs.alert(
          window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
          () => {
            window.location.reload();
          }
        )
      })

    // console.log('bundle: ', bundle);
    return bundle
  }

  // get data
  getData = ( _query ) => {
    this.setState({ isLoading: true });
    let { query } = this.state;
    query = Object.assign(_query || query, this.props.stateQuery);
    return this._customerDataLeadsModel.getList(query)
      .then(res => {
        let data = res.items;
        let isLoading = false;
        let count = res.totalItems;
        let page = query['page'] - 1 || 0;
        this.setState({
          data, isLoading,
          count, page, query
        })
      });
  }

  handleClickAdd = () => {
    window._$g.rdr('/customer-data-leads/add')
  }

  handleChangeStatus = (status, id, rowIndex) => {
    window._$g.dialogs.prompt(
      'Bạn có chắc chắn muốn thay đổi trạng thái dữ liệu đang chọn?',
      'Cập nhật',
      (confirm) => this.onChangeStatus(confirm, status, id, rowIndex)
    )
  }

  onChangeStatus = (confirm, status, id, idx) => {
    if (confirm) {
      let postData = {is_active: status ? 1 : 0};
      this._customerDataLeadsModel.changeStatus(id, postData)
      .then(() => {
        const cloneData = [...this.state.data]
        cloneData[idx].is_active = status
        this.setState({
          data: cloneData,
        }, () => {
          window._$g.toastr.show('Cập nhật trạng thái thành công.', 'success');
        });
      })
      .catch(() => {
        window._$g.toastr.show('Cập nhật trạng thái không thành công.', 'error');
      });
    }
  }

  handleActionItemClick(type, id, rowIndex) {
    let routes = {
      detail: '/customer-data-leads/detail/',
      delete: '/customer-data-leads/delete/',
      edit: '/customer-data-leads/edit/',
      changePassword: '/customer-data-leads/change-password/',
    }
    const route = routes[type]
    if (type.match(/detail|edit|changePassword/i)) {
      window._$g.rdr(`${route}${id}`)
    } else {
      window._$g.dialogs.prompt(
        'Bạn có chắc chắn muốn xóa dữ liệu đang chọn?',
        'Xóa',
        (confirm) => this.handleClose(confirm, id, rowIndex)
      )
    }
  }

  handleClose(confirm, id, rowIndex) {
    const { data } = this.state
    if (confirm) {
      this._customerDataLeadsModel.delete(id)
      .then(() => {
        const cloneData = JSON.parse(JSON.stringify(data))
        cloneData.splice(rowIndex, 1)
        this.setState({
          data: cloneData,
        })
      })
      .catch(() => {
        window._$g.dialogs.alert(
          window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
        )
      })
    }
  }

  handleGetStatusKeys(key) {
    let query = {...this.state.query}
    query = Object.assign(query, {status_data_leads_key: key})
    this.getData(query)
  }

  handleSubmitFilter = (
    isReset,
    search,
    created_date_from,
    created_date_to,
    country_id,
    province_id,
    district_id,
    ward_id,
    gender,
    business_id,
    segment_id,
    status_data_leads_id,
    is_active,
    company_id,
  ) => {
    let query = {...this.state.query}
    query.page = 1
    if (isReset) {
      query = Object.assign(query, {
        status_data_leads_key: null
      })
    }
    query = Object.assign(query, {
      search,
      created_date_from,
      created_date_to,
      country_id,
      province_id,
      district_id,
      ward_id,
      gender,
      business_id,
      segment_id,
      status_data_leads_id,
      is_active,
      company_id,
    })
    this.setState({ careDataLeadsItems: {} });
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
  }

  handleChangeRowsPerPage = (event ) => {
    let query = {...this.state.query};
    query.itemsPerPage = event.target.value;
    query.page = 1;
    this.getData(query);
  }

  handleChangePage = (event, newPage) => {
    let query = {...this.state.query};
    query.page = newPage + 1;
    this.getData(query);
  }

  handleCareAction = (type) => {
    let { careDataLeadsItems = {} } = this.state;
    careDataLeadsItems = Object.values(careDataLeadsItems);
    // Case: create task
    if ('task' === type) {
      if (careDataLeadsItems.length) {
        careDataLeadsItems = careDataLeadsItems
          .filter(item => ('NOT_ASSIGNED' === item.status_data_leads_key))
        ;
        if (!careDataLeadsItems.length) {
          return window._$g.dialogs.alert(`Vui lòng chọn khách hàng "chưa phân công việc" để thực hiện!`);
        }
      }
    }
    if (!careDataLeadsItems.length) {
      return window._$g.dialogs.alert("Vui lòng chọn khách hàng cần thao tác!");
    }
    this.setState({ careAction: type });
  }

  getColorTask(type) {
    let color = ''
    switch(type) {
      case 'Đã phân công việc':
        color = 'blue'
        break;
      case 'Đang xử lý':
        color = 'organe'
        break;
      default:
        color = 'default'
        // code block
    }
    return color
  }

  render() {
    const {
      data, count, page, query, careAction, careDataLeadsItems
    } = this.state;
    const options = configTableOptions(count, page, query);
    let { handlePick } = this.props;
    let columns = [
      handlePick
      ? configIDRowTable("data_leads_id", "/customer-data-leads/detail/", this.state.query)
      : {
        name: "data_leads_id",
        label: "#",
        options: {
          filter: false,
          sort: false,
          customHeadRender: (columnMeta, handleToggleColumn) => {
            let _data = (data || []);
            let checked = (Object.keys(careDataLeadsItems).length === _data.length) && _data.length;
            return (
              <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                <div className="text-center">
                  <Checkbox
                    checked={checked}
                    onChange={({ target }) => {
                      let { careDataLeadsItems } = this.state;
                      if (target.checked) {
                        _data.forEach((item) => (careDataLeadsItems[item.data_leads_id] = item));
                        careDataLeadsItems = {...careDataLeadsItems};
                      } else {
                        careDataLeadsItems = {};  
                      }
                      this.setState({ careDataLeadsItems });
                    }}
                  />
                </div>
              </th>
            )
          },
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                <Checkbox
                  name="care_data_leads_id"
                  checked={!!careDataLeadsItems[value]}
                  className="checkbox-click"
                  value={value}
                  onChange={(evt) => {
                    let { careDataLeadsItems } = this.state;
                    if (careDataLeadsItems[value]) {
                      delete careDataLeadsItems[value];
                    } else {
                      let item = (data || []).find((item) => (('' + item.data_leads_id) === ('' + value)));
                      item && (careDataLeadsItems[value] = item);
                    }
                    careDataLeadsItems = {...careDataLeadsItems};
                    this.setState({ careDataLeadsItems });
                  }}
                />
              </div>
            );
          }
        }
      },
      {
        name: "data_leads_id",
        label: "Mã khách hàng",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "full_name",
        label: "Tên khách hàng",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "gender",
        label: "Giới tính",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                {value === 1 ? "Nam" : value === 0 ? "Nữ" : "Khác"}
              </div>
            );
          }
        }
      },
      {
        name: "phone_number",
        label: "Số điện thoại",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "email",
        label: "Email",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "birthday",
        label: "Ngày sinh",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "address_full",
        label: "Địa chỉ",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "company_name",
        label: "Công ty",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "campaign_name",
        label: "Thuộc chiến dịch",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "status_data_leads_name",
        label: "Trạng thái khách hàng",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "task_status_name",
        label: "Trạng thái công việc",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "created_date",
        label: "Ngày tạo",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            const color = this.getColorTask(tableMeta.rowData[10])
            return (
              <div className={`text-center color-overlay ${color}`}>
                {value}
              </div>
            )
          }
        }
      },
      {
        name: "is_active",
        label: "Kích hoạt",
        options: {
          filter: false,
          sort: false,
          customHeadRender: (columnMeta, handleToggleColumn) => {
            return (
              <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                <div className="text-center">
                  {columnMeta.label}
                </div>
              </th>
            )
          },
          customBodyRender: (value, tableMeta, updateValue) => {
            let { controlIsActiveProps = {} } = this.props;
            const color = this.getColorTask(tableMeta.rowData[10]);
            return (
              <div className={`text-center color-overlay ${color}`}>
                <CheckAccess permission="CRM_CUSDATALEADS_EDIT">
                  <FormControlLabel
                    label={value ? "Có" : "Không"}
                    value={value ? "Có" : "Không"}
                    control={
                    <Switch
                      color="primary"
                      checked={value === 1}
                      value={value}
                    />
                    }
                    onChange={event => {
                      let checked = ((1 * event.target.value) === 1 ? 0 : 1)
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].data_leads_id, tableMeta['rowIndex'])
                    }}
                    {...controlIsActiveProps}
                  />
                </CheckAccess>
              </div>
            );
          }
        },
      },
      {
        name: "Thao tác",
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            if (handlePick) {
              let { _pickDataItems } = this.state;
              let item = this.state.data[tableMeta['rowIndex']];
              return (
                <div className="text-center mb-1">
                  <Checkbox
                    checked={!!_pickDataItems[item.data_leads_id]}
                    onChange={({ target }) => {
                      if (handlePick.single) {
                        _pickDataItems = {};
                      }
                      delete _pickDataItems[item.data_leads_id];
                      if (target.checked) {
                        _pickDataItems[item.data_leads_id] = item;
                      }
                      this.setState({ _pickDataItems: {..._pickDataItems} });
                    }}
                  />
                </div>
              );
            }
            const color = this.getColorTask(tableMeta.rowData[10]);
            return (
              <div className={`text-center color-overlay ${color}`}>
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].data_leads_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="CRM_CUSDATALEADS_EDIT">
                  <Button color="primary" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].data_leads_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="CRM_CUSDATALEADS_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].data_leads_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-trash" />
                  </Button>
                </CheckAccess>
              </div>
            );
          }
        }
      },
    ];

    return (
      <div className="animated fadeIn">
        {(() => {
          if (careAction) {
            let { careDataLeadsItems } = this.state;
            let careDataList = [];
            let careDataListTask = {};
            Object.values(careDataLeadsItems).forEach(item => {
              let { data_leads_id, phone_number, full_name, email } = item;
              (careAction === 'sms') && careDataList.push({ data_leads_id, phone_number, full_name });
              if (careAction === 'task') {
                ('NOT_ASSIGNED' === item.status_data_leads_key) && (careDataListTask[data_leads_id] = item);
              } 
              (careAction === 'email') && careDataList.push({ data_leads_id, email });
            });
            return (
              <div className={`animated fadeIn overlay care-data-leads care-data-leads-${careAction}`}>
                <div className="overlay-box p-3">
                  <div className="overlay-toolbars pb-3 hidden" hidden>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => this.setState({ careAction: '' })}
                    >
                      <i className="fa fa-remove" />
                    </Button>
                  </div>
                  {(careAction === 'sms') ? (
                    <CustomerDataLeadCareToolsSms
                      task_data_leads_list={careDataList}
                      handleActionClose={() => this.setState({ careAction: '' })}
                      handleFormikSubmitSucceed={() => this.setState({ careAction: '' })}
                      handleActionReset={false}
                    />
                  ) : null}
                  {(careAction === 'task') ? (
                    <TaskAdd
                      CustomerEnts={careDataListTask}
                      // handleActionSave={false}
                      handleActionClose={() => this.setState({ careAction: '' })}
                      handleFormikSubmitSucceed={() => {
                        window._$g.toastr.show('Tạo công việc thành công!', 'success');
                        // Refresh list
                        if (this._refCustomerDataLeadFilter) {
                          this._refCustomerDataLeadFilter.onSubmit();
                        }
                        this.setState({ careAction: '' });
                        return false;
                      }}
                    />
                  ) : null}
                  {(careAction === 'email') ? (
                    <CustomerDataLeadCareToolsEmail
                      task_data_leads={careDataList}
                      handleActionClose={() => this.setState({ careAction: '' })}
                      handleFormikSubmitSucceed={() => this.setState({ careAction: '' })}
                      handleActionReset={false}
                    />
                  ) : null}
                </div>
              </div>
            );
          }
        })()}
        <Card className="animated fadeIn z-index-222 mb-3">
          <CardHeader className="d-flex">
            <div className="flex-fill font-weight-bold">
              Thông tin tìm kiếm
            </div>
            <div
              className="minimize-icon cur-pointer"
              onClick={() => this.setState(prevState => ({
                toggleSearch: !prevState.toggleSearch
              }))}
            >
              <i className={`fa ${this.state.toggleSearch ? 'fa-minus' : 'fa-plus'}`} />
            </div>
          </CardHeader>
          {this.state.toggleSearch && (
            <CardBody className="px-0 py-0">
              <div className="MuiPaper-filter__custom z-index-2">
                <CustomerDataLeadFilter
                  ref={ref => (this._refCustomerDataLeadFilter = ref)}
                  companies={this.state.companies}
                  businessArr={this.state.businessArr}
                  handleSubmit={this.handleSubmitFilter}
                  {...this.props.filterProps}
                />
              </div>
            </CardBody>
          )}
        </Card>
        {handlePick ? (<div className="text-right mb-1">
          <Button
            color="success" size="sm"
            className="col-12 max-w-110 ml-2 mobile-reset-width"
            onClick={() => {
              let { _pickDataItems } = this.state;
              handlePick(_pickDataItems);
            }}
          >
            <i className="fa fa-plus mr-1" />Chọn
          </Button>
        </div>) : null}
        {!handlePick ? (<div>
          <CheckAccess permission="CRM_CUSDATALEADS_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
          <CheckAccess permission="CRM_CUSDATALEADS_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" color="excel" size="sm">
              <i className="fa fa-download mr-1" />Xuất excel
            </Button>
          </CheckAccess>
          <CheckAccess permission={[
            "CRM_CUSDATALEADSDETAIL_SENDSMS",
            "CRM_CUSDATALEADSDETAIL_SENDEMAIL",
            "CRM_TASK_ADD",
          ]} any>
            <ButtonDropdown
              className="max-w-110 mb-2 mobile-reset-width"
              isOpen={this.state.dropdownOpenActions}
              toggle={() => {
                return this.setState(({ dropdownOpenActions }) => ({
                  dropdownOpenActions: !dropdownOpenActions
                }));
              }}
            >
              <DropdownToggle caret color="primary" size="sm">
                <i className="fa fa-cogs mr-1" />Thao tác
              </DropdownToggle>
              <DropdownMenu>
                <CheckAccess permission="CRM_CUSDATALEADSDETAIL_SENDSMS">
                  <DropdownItem
                    onClick={() => this.handleCareAction('sms')}
                  >
                    <i className="fa fa-rss mr-1" />Gửi SMS
                  </DropdownItem>
                </CheckAccess>
                <CheckAccess permission="CRM_CUSDATALEADSDETAIL_SENDEMAIL">
                  <DropdownItem
                    onClick={() => this.handleCareAction('email')}
                  >
                    <i className="fa fa-send-o mr-1" />Gửi Email
                  </DropdownItem>
                </CheckAccess>
                <CheckAccess permission="CRM_TASK_ADD">
                  <DropdownItem
                    onClick={() => this.handleCareAction('task')}
                  >
                    <i className="fa fa-tasks mr-1" />Tạo công việc
                  </DropdownItem>
                </CheckAccess>
              </DropdownMenu>
            </ButtonDropdown>
          </CheckAccess>

          <div className="ml-2 table-tags float-right d-inline-flex">
            <h5 onClick={() => this.handleGetStatusKeys('ASSIGNED')} className="cur-pointer">
              <Badge className="table-tag complete ml-2" color="info">Đã phân công việc</Badge>
            </h5>
            <h5 onClick={() => this.handleGetStatusKeys('NOT_ASSIGNED')} className="cur-pointer">
              <Badge className="table-tag ml-2" color="light">Chưa phân công việc</Badge>
            </h5>
            <h5 onClick={() => this.handleGetStatusKeys('IN_PROCESS')} className="cur-pointer">
              <Badge className="table-tag doing ml-2" color="warning">Đang xử lý</Badge>
            </h5>
          </div>
        </div>) : null}
        <div className="clearfix" />
        <Card className="animated fadeIn">
          <CardBody className="px-0 py-0">
            <div className="MuiPaper-root__custom">
              {this.state.isLoading
                ? (
                  <div className="d-flex flex-fill justify-content-center mt-5 mb-5">
                    <CircularProgress />
                  </div>
                )
                : (
                  <div>
                    <MUIDataTable
                      data={this.state.data}
                      columns={columns}
                      options={options}
                    />
                    <CustomPagination
                      count={count}
                      rowsPerPage={query.itemsPerPage}
                      page={page}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                  </div>
                )
              }
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default CustomerDataLeads

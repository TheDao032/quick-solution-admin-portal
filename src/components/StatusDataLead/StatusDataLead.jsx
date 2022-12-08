import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'
import fileDownload from "js-file-download";
import moment from 'moment';
// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination';

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import StatusDataLeadFilter from './StatusDataLeadFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import StatusDataLeadModel from '../../models/StatusDataLeadModel'
import CompanyModel from '../../models/CompanyModel'
import BusinessModel from '../../models/BusinessModel';
// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Users
 */
class StatusDataLead extends Component {
  /**
   * @var {UserGroupModel}
   */
  _statusDataLeadModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._statusDataLeadModel = new StatusDataLeadModel()
    this._companyModel = window._companyModel = new CompanyModel()
    this._businessModel = window._businessModel = new BusinessModel();
  }

  state = {
    toggleSearch: true,
    isLoading: false,
    page: 0,
    count: 1,
    data: [],
    query: {
      itemsPerPage: 25,
      page: 1,
      is_active: 1,
      is_system: 2,
      is_deleted: 0,
    },
    /** @var {Array} */
    company: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    business: [
      { name: "-- Chọn --", id: "" },
    ],
  };

  componentDidMount() {
    this.getData({...this.state.query});

    this.setState({ isLoading: true });
    (async () => {
      let bundle = await this._getBundleData();
      // let { data } = bundle;
      // let dataConfig = data ? data.items : []
      let isLoading = false;
    
      let {
        business = [],
        company = [],
      } = this.state;
      company = company.concat(bundle.company || []);
      business = business.concat(bundle.business || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          business,
          company,
        });
      })
    })();
  }

/**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    let bundle = {}
    let all = [
      // @TODO:
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['company'] = data)),
      this._businessModel.getOptions()
        .then(data => (bundle['business'] = data)),
    ]
    await Promise.all(all)
      .catch(err => {
        window._$g.dialogs.alert(
          window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
          () => {
            window.location.reload();
          }
        )
      })
    return bundle
  }

  // get data
  getData = ( query = {} ) => {
    this.setState({ isLoading: true });
    return this._statusDataLeadModel.getList(query)
    .then(res => {
      let data = [...res.items];
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;
      this.setState({
        isLoading, data, count, page, query
      })
    });
    
  }

  handleClickRefresh = () => {
    this.getData({...this.state.query});
  }

  handleClickAdd = () => {
    window._$g.rdr('/status-data-lead/add');
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
      this._statusDataLeadModel.changeStatus(id, postData)
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

  handleActionItemClick = (type, id, rowIndex) => {
    let routes = {
      detail: '/status-data-lead/detail/',
      delete: '/status-data-lead/delete/',
      edit: '/status-data-lead/edit/',
    }
    const route = routes[type]
    if (type.match(/detail|edit/i)) {
      window._$g.rdr(`${route}${id}`)
    } else {
      window._$g.dialogs.prompt(
        'Bạn có chắc chắn muốn xóa dữ liệu đang chọn?',
        'Xóa',
        (confirm) => this.handleDelete(confirm, id, rowIndex)
      )
    }
  }

  handleDelete = (confirm, id, rowIndex) => {
    const { data } = this.state
    if (confirm) {
      this._statusDataLeadModel.delete(id)
      .then(() => {
        const cloneData = [...data]
        cloneData.splice(rowIndex, 1)
        const count = cloneData.length
        this.setState({
          data: cloneData, count
        })
      })
      .catch(() => {
        window._$g.dialogs.alert(
          window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
        )
      })
    }
  }

  handleSubmitFilter = (search, is_active, is_deleted, create_date_from, create_date_to, company_id, business_id) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {search, is_active, is_deleted, create_date_from, create_date_to, company_id, business_id});
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

  //Export excel
  handleExport = () => {
    this._statusDataLeadModel.exportExcel()
    .then(response => {
      const configDate = moment().format("DDMMYYYY");
      fileDownload(response, `StatusDataLeads_${configDate}.csv`);
    })
    .catch((error) => {
      console.log(error)
    });
  }

  render() {
    const columns = [
      configIDRowTable("status_data_leads_id", "/status-data-lead/detail/", this.state.query),
      {
        name: "status_name",
        label: "Tên khách hàng tiềm năng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "company_name",
        label: "Công ty áp dụng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "business_name",
        label: "Cơ sở áp dụng",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value) => {
            return <span className="d-block text-right">{value || 0}</span>;
          }
        }
      },
      {
        name: "created_date",
        label: "Ngày tạo",
        options: {
          filter: false,
          sort: false,
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
            return (
              <div className="text-center">
                <CheckAccess permission="AM_STATUSDATALEAD_EDIT">
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
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].status_data_leads_id, tableMeta['rowIndex'])
                    }}
                  />
                </CheckAccess>
              </div>
            );
          }
        },
      },
      {
        name: "is_deleted",
        label: "Đã xóa",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center">
                {value ? "Có" : "Không"}
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
            return (
              <div className="text-center">
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].status_data_leads_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="AM_STATUSDATALEAD_EDIT">
                  <Button color="success" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].status_data_leads_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="AM_STATUSDATALEAD_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].status_data_leads_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-trash" />
                  </Button>
                </CheckAccess>
              </div>
            );
          }
        }
      },
    ]

    const {count, page, query} = this.state;
    const options = configTableOptions(count, page, query)

    return (
      <div>
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
                <StatusDataLeadFilter
                  businessArr={this.state.business}
                  companyArr={this.state.company}
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>

        <div>
          <CheckAccess permission="AM_STATUSDATALEAD_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
          <CheckAccess permission="AM_STATUSDATALEAD_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width" onClick={() => this.handleExport()} color="excel"  size="sm">
              <i className="fa fa-download mr-1" />Xuất excel
            </Button>
          </CheckAccess>
        </div>
        
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
    );
  }
}

export default StatusDataLead;

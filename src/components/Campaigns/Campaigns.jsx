import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'
import moment from 'moment'

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import CampaignFilter from './CampaignFilter'
import NumberFormat from '../Common/NumberFormat'
// Util(s)
import { configTableOptions, configIDRowTable } from '../../utils/index';

// Model(s)
import CampaignModel from '../../models/CampaignModel'
import CampaignStatusModel from '../../models/CampaignStatusModel'
import CampaignTypeModel from '../../models/CampaignTypeModel'

/**
 * @class Campaigns
 */
class Campaigns extends Component {
  constructor(props) {
    super(props)

    // Init model(s)
    this._campaignModel = new CampaignModel()
    this._campaignStatusModel = new CampaignStatusModel()
    this._campaignTypeModel = new CampaignTypeModel()
  }

  state = {
    toggleSearch: true,
    page: 0,
    count: 1,
    data: [],
    isLoading: false,
    query: {
      itemsPerPage: 25,
      page: 1,
    }
  };

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
        campaignStatus = [],
        campaignType = [],
      } = this.state;
      //
      campaignStatus = campaignStatus.concat(bundle.campaignStatus || []);
      campaignType = campaignType.concat(bundle.campaignType || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          count, page,
          campaignStatus,
          campaignType,
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
      this._campaignStatusModel.getOptions()
        .then(data => (bundle['campaignStatus'] = data)),
      this._campaignTypeModel.getOptions4List()
        .then(data => (bundle['campaignType'] = data)),
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
    // console.log('bundle: ', bundle);
    return bundle
  }

  // get data
  getData = ( query = {} ) => {
    this.setState({ isLoading: true });
    return this._campaignModel.getList(query)
    .then(res => {
      let data = res.items;
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;
      this.setState({
        data, isLoading,
        count, page, query
      })
    })
  }

  handleClickAdd = () => {
    window._$g.rdr('/campaigns/add');
  }

  handleChangeStatus = (status, id, rowIndex, row) => {
    if (moment().isBefore(moment(moment(row.end_date, 'DD/MM/YYYY')).format('MM/DD/YYYY')) || !row.end_date) {
      window._$g.dialogs.prompt(
        'Bạn có chắc chắn muốn thay đổi trạng thái dữ liệu đang chọn?',
        'Cập nhật',
        (confirm) => this.onChangeStatus(confirm, status, id, rowIndex)
      )
    } else {
      window._$g.toastr.show('Ngày duyệt chiến dịch đã kết thúc, bạn không thể thay đổi trạng thái', 'error');
    }
  }

  onChangeStatus = (confirm, status, id, idx) => {
    if (confirm) {
      let postData = {is_active: status ? 1 : 0};
      this._campaignModel.changeStatus(id, postData)
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
      detail: '/campaigns/details/',
      delete: '/campaigns/delete/',
      edit: '/campaigns/edit/',
      changePassword: '/campaigns/change-password/',
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
      this._campaignModel.delete(id)
      .then(() => {
        const cloneData = JSON.parse(JSON.stringify(data))
        cloneData.splice(rowIndex, 1)
        this.setState({
          data: cloneData,
        })
      })
      .catch((apiData) => {
        let { statusText, message } = apiData;
        const error = statusText || message || 'Đã có lỗi trong quá trình xử lý. Vui lòng thử lại sau hoặc liên hệ bộ phận IT để biết thêm chi tiết'
        window._$g.dialogs.alert(
          window._$g._(error)
        )
      })
    }
  }

  handleSubmitFilter = (search, is_active, is_reviewed, campaign_status_id, campaign_type_id, from_start_date, to_start_date, from_end_date, to_end_date) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {search, is_active, is_reviewed, campaign_status_id, campaign_type_id, from_start_date, to_start_date, from_end_date, to_end_date})
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

  render() {
    const columns = [
      configIDRowTable("campaign_id", "/campaigns/details/", this.state.query),
      {
        name: "campaign_name",
        label: "Tên chiến dịch",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "campaign_type_name",
        label: "Loại chiến dịch",
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
        },
      },
      {
        name: "business_name",
        label: "Cơ sở áp dụng",
        options: {
          filter: false,
          sort: false,
        },
      },
      {
        name: "campaign_status_name",
        label: "Trạng thái",
        options: {
          filter: false,
          sort: false,
        },
      },
      {
        name: "start_date",
        label: "Ngày bắt đầu",
        options: {
          filter: false,
          sort: false,
        },
      },
      {
        name: "end_date",
        label: "Ngày kết thúc",
        options: {
          filter: false,
          sort: false,
        },
      },
      {
        name: "total_values",
        label: "Ngân sách",
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
                <NumberFormat
                  defaultValue={value}
                  displayType={'text'}
                />
              </div>
            );
          }
        },
      },
      {
        name: "is_reviewed",
        label: "Trạng thái duyệt",
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
                {(null === value) ? "Chưa duyệt" : (value ? "Đã duyệt" : "Không duyệt")}
              </div>
            );
          }
        },
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
                <CheckAccess permission="CRM_CAMPAIGN_EDIT">
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
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].campaign_id, tableMeta['rowIndex'], this.state.data[tableMeta['rowIndex']])
                    }}
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
            return (
              <div className="text-center">
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].campaign_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="CRM_CAMPAIGN_EDIT">
                  <Button color="success" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].campaign_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="CRM_CAMPAIGN_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].campaign_id, tableMeta['rowIndex'])}>
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
                <CampaignFilter
                  campaignStatus={this.state.campaignStatus}
                  campaignType={this.state.campaignType}
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <CheckAccess permission="CRM_CAMPAIGN_ADD">
          <Button className="col-12 max-w-110 mb-3 mobile-reset-width" onClick={() => this.handleClickAdd()} color="success" size="sm">
            <i className="fa fa-plus" />
            <span className="ml-1">Thêm mới</span>
          </Button>
        </CheckAccess>
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

export default Campaigns;

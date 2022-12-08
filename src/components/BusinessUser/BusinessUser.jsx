import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import BusinessUserFilter from './BusinessUserFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import BusinessUserModel from '../../models/BusinessUserModel'
import CompanyModel from '../../models/CompanyModel'

// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class BusinessUser
 */
class BusinessUser extends Component {
  /**
   * @var {BusinessUserModel}
   */
  _BusinessUserModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._BusinessUserModel = new BusinessUserModel()
    this._companyModel = window._companyModel = new CompanyModel()
    // Bind method(s)
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
    },
    /** @var {Array} */
    company: [
      { name: "-- Chọn --", id: "" },
    ],
    business_id: null,
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
        company = [],
      } = this.state;
      company = company.concat(bundle.company || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          count, page,
          company,
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
        .then(data => (bundle['company'] = data)),
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
    
    return this._BusinessUserModel.getList(query)
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
    if(!this.state.business_id){
      window._$g.toastr.show('Vui lòng chọn cơ sở', 'error');
    }else{
      window._$g.rdr(`/business-user/add/${this.state.business_id}`)
    }
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
      this._BusinessUserModel.changeStatus(id, postData)
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

  handleActionItemClick( business_id, user_id, rowIndex) {
    window._$g.dialogs.prompt(
      'Bạn có chắc chắn muốn xóa dữ liệu đang chọn?',
      'Xóa',
      (confirm) => this.handleClose(confirm, business_id, user_id, rowIndex)
    )
  }

  handleClose(confirm, business_id, user_id, rowIndex) {
    const { data } = this.state
    if (confirm) {
      this._BusinessUserModel.delete(business_id, user_id)
      .then(() => {
        const cloneData = JSON.parse(JSON.stringify(data))
        cloneData.splice(rowIndex, 1)
        this.setState({
          data: cloneData,
        })
      })
      .catch((err) => {
        let mess = 'Bạn vui lòng chọn dòng dữ liệu cần thao tác!';
        if(err.errors === null && err.message === "BusinessUser used by SEG_DATALEADS"){
          mess = 'Phân khúc đang được sử dụng';
        }
        window._$g.dialogs.alert(
          window._$g._(mess)
        )
      })
    }
  }

  handleSubmitFilter = (search, company_id, business_id) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {search, company_id, business_id});
    
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
    this.setState({business_id});
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
      configIDRowTable("business_id", null, this.state.query),
      {
        name: "user_name",
        label: "Tên đăng nhập",
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "full_name",
        label: "Tên nhân viên",
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "department_name",
        label: "Phòng ban",
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "position_name",
        label: "Chức vụ",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "Xóa",
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center">
                <CheckAccess permission="SYS_BUSINESS_USER_DEL">
                  <Button title="Xóa" className="btn-bg-transparent" onClick={evt => this.handleActionItemClick(
                    this.state.data[tableMeta['rowIndex']].business_id,
                    this.state.data[tableMeta['rowIndex']].user_id,
                    tableMeta['rowIndex']
                  )}>
                    <i className="fa fa-times" fontSize={30} />
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
                <BusinessUserFilter
                  companyArr={this.state.company}
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <div>
          <CheckAccess permission="SYS_BUSINESS_USER_ADD">
            <Button className="col-12 max-w-190 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm nhân viên cho cơ sở
            </Button>
          </CheckAccess>
          {/* <CheckAccess permission="CRM_SEGMENT_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width" color="excel"  size="sm">
              <i className="fa fa-download mr-1" />Xuất excel
            </Button>
          </CheckAccess> */}
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
    )
  }
}

export default BusinessUser

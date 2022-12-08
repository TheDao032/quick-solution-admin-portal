import React, { PureComponent } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination';

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';
import UserFilter from './UserFilter'

// Util(s)
// import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import UserModel from '../../models/UserModel'
import PositionModel from '../../models/PositionModel'
import DepartmentModel from '../../models/DepartmentModel'

// Set layout full-wh
// layoutFullWidthHeight()

/**
 * @class Users
 */
class Users extends PureComponent {
  /**
   * @var {UserModel}
   */
  _userModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._userModel = new UserModel()
    this._positionModel = window._positionModel = new PositionModel()
    this._departmentModel = window._departmentModel = new DepartmentModel()
    // Bind method(s)
  }

  state = {
    toggleSearch: true,
    page: 0,
    count: 1,
    data: [],
    query: {
      itemsPerPage: 25,
      page: 1,
    },
    isLoading: false,
    isOpenSnackbar: false,
    snackbarMsg: '',
    snackBarClss: 'info',
    /** @var {Array} */
    positions: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    departments: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    roles: [
      { name: "Role 1", value: "1" },
      { name: "Role 2", value: "2" },
      { name: "Role 3", value: "3" },
      { name: "Role 4", value: "4" },
    ],
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ isLoading: true });
    (async () => {
      let bundle = await this._getBundleData();
      let { data = {} } = bundle;
      let dataConfig = data.items || [];
      let isLoading = false;
      let count = data.totalItems;
      let page = 0
      let {
        positions = [],
        departments = [],
      } = this.state;
      //
      positions = positions.concat(bundle.positions || []);
      departments = departments.concat(bundle.departments || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          count, page,
          positions,
          departments,
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
      this._userModel.list()
        .then(data => (bundle['data'] = data)),
      this._positionModel.getOptions()
        .then(data => (bundle['positions'] = data)),
      this._departmentModel.getOptions()
        .then(data => (bundle['departments'] = data)),
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
    return this._userModel.list(query)
    .then(res => {
      let data = res.items;
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] -1 || 0;
      this.setState({
        data, isLoading,
        count, page, query
      })
    })
  }

  handleClickAdd = () => {
    window._$g.rdr('/users/add')
  }

  handleActionItemClick(type, id, rowIndex) {
    let routes = {
      detail: '/users/detail/',
      delete: '/users/delete/',
      edit: '/users/edit/',
      changePassword: '/users/change-password/',
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
      this._userModel.delete(id)
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

  handleSubmitFilter = (search, department_id, position_id, gender) => {
    let query = {...this.state.query}
    query.page = 1
    query = Object.assign(query, {search, department_id, position_id, gender})
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
      configIDRowTable("user_id", "/users/detail/", this.state.query),
      {
        name: "user_name",
        label: "Mã NV",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "full_name",
        label: "Họ và tên",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "department_name",
        label: "Phòng ban",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "position_name",
        label: "Chức vụ",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "gender",
        label: "Giới tính",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            let result = null;
            switch ('' + value) {
              case '0':
                result = (<span>Nữ</span>);
                break;
              case '1':
                result = (<span>Nam</span>);
                break;
              default:
                result = (<span>Khác</span>);
            }
            return result;
          }
        }
      },
      {
        name: "phone_number",
        label: "Điện thoại",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "address_full",
        label: "Địa chỉ",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "email",
        label: "Email",
        options: {
          filter: false,
          sort: false,
        }
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
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].user_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="SYS_USER_EDIT">
                  <Button color="primary" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].user_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="SYS_USER_PASSWORD">
                  <Button color="success" title="Thay đổi mật khẩu" className="mr-1" onClick={evt => this.handleActionItemClick('changePassword', this.state.data[tableMeta['rowIndex']].user_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-lock"></i>
                  </Button>
                </CheckAccess>
                <CheckAccess permission="SYS_USER_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].user_id, tableMeta['rowIndex'])}>
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
                <UserFilter
                  positions={this.state.positions}
                  departments={this.state.departments}
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <CheckAccess permission="SYS_USER_ADD">
          <Button className="col-12 max-w-110 mb-3 mobile-reset-width" onClick={() => this.handleClickAdd()} color="success" size="sm">
            <i className="fa fa-plus" />
            <span className="ml-1">Thêm mới</span>
          </Button>
        </CheckAccess>
        <Card className="animated fadeIn">
          <CardBody className="px-0 py-0">
            <div className="MuiPaper-root__custom MuiPaper-user">
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

export default Users

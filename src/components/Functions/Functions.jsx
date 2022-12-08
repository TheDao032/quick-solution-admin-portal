import React, { PureComponent } from "react";
// import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Button } from "reactstrap";

import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination';
// Util(s)
// import {} from '../../utils/html';
import { configTableOptions, configIDRowTable } from '../../utils/index';
// Model(s)
import FunctionModel from "../../models/FunctionModel";
import FunctionGroupModel from "../../models/FunctionGroupModel";
// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess';
import FunctionFilter from './FunctionFilter';

/** @var {Object} */
const userAuth = window._$g.userAuth;

/**
 * @class Functions
 */
class Functions extends PureComponent {
  /**
   * @var {FunctionModel}
   */
  _functionModel;

  constructor(props) {
    super(props);

    // Init model(s)
    this._functionModel = new FunctionModel();
    this._functionGroupModel = new FunctionGroupModel();

    // Init state
    this.state = {
      toggleSearch: true,
      page: 0,
      count: 1,
      data: [],
      isLoading: false,
      query: {
        itemsPerPage: 25,
        page: 1,
        is_active: 1,
        is_system: 2
      }
    };
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ isLoading: true });
    (async () => {
      let bundle = await this._getBundleData();
      let {
        functionGroup = [],
      } = this.state;
      //
      functionGroup = functionGroup.concat(bundle.functionGroup || []);
      //
      this.setState({
        functionGroup
      }, () => {
        const id = bundle.functionGroup[0].id;
        const query = Object.assign(this.state.query, { function_group_id: id });
        this.getData(query);
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
      this._functionGroupModel.getOptions()
        .then(data => (bundle['functionGroup'] = data)),
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
    return this._functionModel.list(query)
    .then(res => {
      let data = [...res.items];
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;

      this.setState({
        isLoading
      }, () => {
        this.setState({
          data,
          count, page, query
        });
      })
    });
  }

  handleClickAdd = () => {
    window._$g.rdr('/functions/add');
  }

  handleActionItemClick = (type, id, rowIndex) => {
    let routes = {
      detail: '/functions/details/',
      delete: '/functions/delete/',
      edit: '/functions/edit/',
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
      this._functionModel.delete(id)
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
      this._functionModel.changeStatus(id, postData)
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
  handleSubmitFilter = (search, is_active, getFunctionGroupID) => {
    let query = {...this.state.query}
    query.page = 1
    this.setState({ getFunctionGroupID })
    const function_group_id = getFunctionGroupID; // ? getFunctionGroupID : this.state.functionGroup[0].id
    query = Object.assign(query, {search, is_active, function_group_id})
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
    // const id = this.state.getFunctionGroupID ? this.state.getFunctionGroupID : this.state.functionGroup[0].id
    // query.function_group_id = id
    this.getData(query);
  }

  handleChangePage = (event, newPage) => {
    let query = {...this.state.query};
    query.page = newPage + 1;
    // const id = this.state.getFunctionGroupID ? this.state.getFunctionGroupID : this.state.functionGroup[0].id
    // query.function_group_id = id
    this.getData(query);
  }

  render() {
    const columns = [
      configIDRowTable("function_id", "/functions/details/", this.state.query),
      {
        name: "function_name",
        label: "Tên quyền",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "function_alias",
        label: "Mã hiệu quyền",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "function_group_name",
        label: "Nhóm quyền",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "description",
        label: "Mô tả",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "is_system",
        label: "Hệ thống",
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
                {value ? "Có" : "Không"}
              </div>
            );
          }
        },
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
          filter: true,
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
                <CheckAccess permission="SYS_FUNCTION_EDIT">
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
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].function_id, tableMeta['rowIndex'])
                    }}
                    disabled={!(userAuth._isAdministrator() || this.state.data[tableMeta['rowIndex']].is_system === 0)}
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
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].function_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="SYS_FUNCTION_EDIT">
                  <Button color="success" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].function_id, tableMeta['rowIndex'])}
                    disabled={!(userAuth._isAdministrator() || this.state.data[tableMeta['rowIndex']].is_system === 0)}
                  >
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="SYS_FUNCTION_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].function_id, tableMeta['rowIndex'])}
                    disabled={!(userAuth._isAdministrator() || this.state.data[tableMeta['rowIndex']].is_system === 0)}
                  >
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
                <FunctionFilter
                  functionGroup={this.state.functionGroup}
                  handleSubmit={this.handleSubmitFilter}
                  handleAdd={this.handleClickAdd}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <CheckAccess permission="SYS_FUNCTION_ADD">
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

export default Functions;

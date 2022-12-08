import React, { PureComponent } from "react";
import { Card, CardBody, CardHeader, Button } from "reactstrap";

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination';

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import MenuFilter from './MenuFilter';
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html';
import { configTableOptions, configIDRowTable } from '../../utils/index';
// Model(s)
import MenuModel from "../../models/MenuModel";

/** @var {Object} */
const userAuth = window._$g.userAuth;

// Set layout full-wh
layoutFullWidthHeight();
const StatusType = {
  'STATUS' : 'STATUS',
  'BUSINESS' : 'BUSINESS',
  'SYSTEM' : 'SYSTEM',
};
/**
 * @class Menus
 */
class Menus extends PureComponent {
  /**
   * @var {MenuModel}
   */
  _menuModel;

  constructor(props) {
    super(props);

    // Init model(s)
    this._menuModel = new MenuModel();
  }
  state = {
    toggleSearch: true,
    page: 0,
    count: 1,
    data: [],
    isLoading: false,
    query: {
      itemsPerPage: 100, // @TODO: get all records
      page: 1,
      is_active: 1,
      is_system: 2,
      _format: {
        recursive: true
      }
    },
  };

  componentDidMount() {
    this.getData({...this.state.query});
  }

  // get data
  getData = ( query = {} ) => {
    this.setState({ isLoading: true });
    return this._menuModel.list(query)
    .then(res => {
      let data = [...res.items];
      console.log(data)
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
    window._$g.rdr('/menus/add');
  }

  handleActionItemClick = (type, id, rowIndex) => {
    let routes = {
      detail: '/menus/details/',
      delete: '/menus/delete/',
      edit: '/menus/edit/',
    };
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
      this._menuModel.delete(id)
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

  handleChangeStatus = (status, id, rowIndex, type = StatusType.STATUS) => {
    window._$g.dialogs.prompt(
      'Bạn có chắc chắn muốn thay đổi trạng thái dữ liệu đang chọn?',
      'Cập nhật',
      (confirm) => this.onChangeStatus(confirm, status, id, rowIndex, type)
    )
  }

  onChangeStatus = (confirm, status, id, idx, type) => {
    if (confirm) {
      let postData;
      switch(type){

        case StatusType.SYSTEM :
          // postData = {is_system: status ? 1 : 0};
          // this._menuModel.changeStatus(id, postData)
          // .then(() => {
          //   const cloneData = [...this.state.data]
          //   cloneData[idx].is_system = status
          //   this.setState({
          //     data: cloneData,
          //   }, () => {
          //     this.showSnackBar('Cập nhật system thành công.', 'success');
          //   });
          // })
          // .catch(() => {
          //   this.showSnackBar('Cập nhật system không thành công.', 'error');
          // });
        break;

        case StatusType.BUSINESS :
          // postData = {is_bussiness: status ? 1 : 0};
          // this._menuModel.changeStatus(id, postData)
          // .then(() => {
          //   const cloneData = [...this.state.data]
          //   cloneData[idx].is_bussiness = status
          //   this.setState({
          //     data: cloneData,
          //   }, () => {
          //     this.showSnackBar('Cập nhật business thành công.', 'success');
          //   });
          // })
          // .catch(() => {
          //   this.showSnackBar('Cập nhật business không thành công.', 'error');
          // });
        break;

        default :
          postData = {is_active: status ? 1 : 0};
          this._menuModel.changeStatus(id, postData)
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
        break;
      }
    }
  }

  handleSubmitFilter = (search, function_id, selectedOption, is_bussiness, is_system) => {
    let query = {...this.state.query}
    let is_active = selectedOption;
    console.log('is_active:' + is_active);
    query = Object.assign(query, {search, function_id, is_active, is_bussiness, is_system})
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
      configIDRowTable("menu_id", "/menus/details/", this.state.query),
      {
        name: "icon_path",
        label: "Icon",
        options: {
          filter: false,
          sort: true,
          customBodyRender: (value) => {
            return value
              ? (<span><i className={value}></i> <small>({value})</small></span>)
              : null
            ;
          }
        }
      },
      {
        name: "menu_name",
        label: "Tên menu",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "function_name",
        label: "Quyền",
        options: {
          filter: false,
          sort: true
        }
      },
      {
        name: "link_menu",
        label: "Link",
        options: {
          filter: false,
          sort: true,
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
        name: "order_index",
        label: "Thứ tự",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value) => {
            return <span className="d-block text-right">{value || 0}</span>;
          }
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
                <CheckAccess permission="SYS_MENU_EDIT">
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
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].menu_id, tableMeta['rowIndex'])
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
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].menu_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="SYS_MENU_EDIT">
                  <Button color="success"  title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].menu_id, tableMeta['rowIndex'])}
                    disabled={!(userAuth._isAdministrator() || this.state.data[tableMeta['rowIndex']].is_system === 0)}
                  >
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="SYS_MENU_DEL">
                  <Button color="danger"  title="Xóa"  className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].menu_id, tableMeta['rowIndex'])}
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
        <Card className="animated fadeIn z-index-222">
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
                <MenuFilter
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>

        <CheckAccess permission="SYS_MENU_ADD">
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

export default Menus;

import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress,Checkbox } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import SetupServicesFilter from './SetupServicesFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import SetupServicesModel from '../../models/SetupServicesModel'
// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class SetupServices
 */
class SetupServices extends Component {
  /**
   * @var {SetupServicesModel}
   */
  _setupServicesModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._setupServicesModel = new SetupServicesModel();
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
    WebsiteCategoryOptions: [
      { name: "-- Chọn --", id: "" },
    ],
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
        WebsiteCategoryOptions = [],
      } = this.state;
      WebsiteCategoryOptions = WebsiteCategoryOptions.concat(bundle.WebsiteCategoryOptions || []);

      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          WebsiteCategoryOptions,
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
      this._setupServicesModel.list(this.state.query)
        .then(data => (bundle['data'] = data)),
      this._setupServicesModel.getOptions({ is_active: 1 })
        .then(data => (bundle['WebsiteCategoryOptions'] = data)),
    ]

    await Promise.all(all)
      .catch(err => {
        // window._$g.dialogs.alert(
        //   window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        //   () => {
        //     window.location.reload();
        //   }
        // )
      })
     console.log('bundle: ', bundle);
    return bundle
  }


  // get data
  getData = ( query = {} ) => {
    this.setState({ isLoading: true });
    return this._setupServicesModel.list(query)
    .then(res => {
      console.log(res)
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
    window._$g.rdr('/setup-service/add')
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
      this._setupServicesModel.changeStatus(id, postData)
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
      detail: '/setup-service/detail/',
      delete: '/setup-service/delete/',
      edit: '/setup-service/edit/',
    }
    const route = routes[type]
  
    if (type.match(/detail|edit/i)) {
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
      this._setupServicesModel.delete(id)
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

  handleSubmitFilter = (search, webcategory_id, create_date_from, create_date_to, is_active) => {
    let query = {...this.state.query};
    query.page = 1;
    query = Object.assign(query, {search, webcategory_id, create_date_from, create_date_to, is_active});
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
    let { handlePick } = this.props;

    const columns = [
      configIDRowTable("setup_service_id", "/setup-service/detail/", this.state.query),
      {
        name: "setup_service_title",
        label: "Tiêu đề",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "category_name",
        label: "Danh mục website",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "system_name_setup",
        label: "Tên hệ thống",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "create_date",
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
            let { controlIsActiveProps = {} } = this.props;
            return (
              <div className="text-center">
                <CheckAccess permission="CMS_SETUPSERVICE_EDIT">
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
                      console.log(this.state.data[tableMeta['rowIndex']]);
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].setup_service_id, tableMeta['rowIndex'])
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
              return (
                <div className="text-center mb-1">
                  <Checkbox
                    onChange={({ target }) => {
                      let item = this.state.data[tableMeta['rowIndex']];
                      let { _pickDataItems = {} } = this;
                      if (target.checked) {
                        _pickDataItems[item.setup_service_id] = item;
                      } else {
                        delete _pickDataItems[item.setup_service_id];
                      }
                      Object.assign(this, { _pickDataItems });
                    }}/>
                </div>
              );
            }
            return (
              <div className="text-center">
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].setup_service_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="CMS_SETUPSERVICE_EDIT">
                  <Button color="success" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].setup_service_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="CMS_SETUPSERVICE_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].setup_service_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-trash" />
                  </Button>
                </CheckAccess>
              </div>
            );
          }
        }
      },
    ]

    const { count, page, query } = this.state;
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
                <SetupServicesFilter
                  WebsiteCategoryOptions={this.state.WebsiteCategoryOptions}
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
              let { _pickDataItems } = this;
              handlePick(_pickDataItems);
            }}
          >
            <i className="fa fa-plus mr-1" />Chọn
          </Button>
        </div>) : null}
        {!handlePick ? (<div>
          <CheckAccess permission="CMS_SETUPSERVICE_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
        </div>) : null}
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

export default SetupServices

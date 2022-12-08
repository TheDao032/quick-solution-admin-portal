import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import TaskFilter from './TaskFilter';
import { CheckAccess } from '../../navigation/VerifyAccess'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index';
// Model(s)
import TaskModel from '../../models/TaskModel'


// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Task
 */
class Task extends Component {
  /**
   * @var {TaskModel}
   */
  _TaskModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._TaskModel = new TaskModel()
    // Bind method(s)
  }

  state = {
    toggleSearch: true,
    isLoading: false,
    page: 0,
    count: 1,
    data: [],
    dataRender: [],
    query: {
      itemsPerPage: TaskModel._MAX_ITEMS_PER_PAGE,
      page: 1,
      is_active: 1,
    },
    
    customItemsPerPage: 25,
    permissionDel: 1,
    permissionEdit: 1,
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ isLoading: true });
    (async () => {
      let bundle = await this._getBundleData();
      let { data } = bundle;
      let dataConfig = data ? data.items : [];
      let isLoading = false;
      let count = data ? data.totalItems - 1 : 0;
      
      let dataRender = dataConfig;
      if(dataConfig.length > 0){
        dataConfig = this.parentAndChildrenTask(dataConfig);
        dataRender = this.paginationList(dataConfig, this.state.page, this.state.customItemsPerPage);
      }

      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          dataRender,
          count
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
      // this._TaskModel.getList(this.state.query)
      //   .then(data =>(bundle['data'] = data )),
      // this._TaskModel.getOptions()
      //   .then(data => (bundle['taskParentArr'] = data)),
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
  getData = ( query = {}, isPagination ) => {
    this.setState({ isLoading: true });
    return this._TaskModel.getList(query)
    .then(res => {
      let data, dataRender = [];
      let page = query['page'] - 1 || 0;
      let isLoading = false;
      let count = res.totalItems;

      if(res.items.length > 0){
        data = this.parentAndChildrenTask(res.items);
        dataRender = this.paginationList(data,page,this.state.customItemsPerPage);
      }
      
      this.setState({
        data, isLoading,
        count, page, query,
        dataRender
      })
    })
  }

  parentAndChildrenTask(data){

    // check input no data
    if(data.length <= 0){
      return [];
    }

    let dataList = {};
    data.map((value, key) => {
      if(dataList[`k-${value.parent_id}`]){
        return dataList[`k-${value.parent_id}`][`k-${value.task_id}`] = value;
      }
      dataList[`k-${value.parent_id}`] = {};
      return dataList[`k-${value.parent_id}`][`k-${value.task_id}`] = value;
    });

    let result = [];
    let stt = 0;
    // return true format data is sort
    for(let key in dataList["k-0"]){
      stt ++;
      let parent = dataList["k-0"][key]; 
      let childrents = dataList[`k-${parent.task_id}`];
      
      // add parent
      result.push(Object.assign(parent, {"stt":stt}) );
      let sttChild = 0;

      // loop to add children
      for(let keyChild in childrents){
        sttChild ++;
        result.push(Object.assign({"stt": (stt + "." + sttChild) },childrents[keyChild]) );
      }
      // remove child
      delete dataList[`k-${parent.task_id}`];
    }
    
    // remove object parent
    delete dataList["k-0"];
    stt ++;
    let sttChild = 0;
    // get task without parent
    for(let key in dataList){
      for(let keyChild in dataList[key]){
        sttChild ++;
        result.push( Object.assign(dataList[key][keyChild], {"stt": (stt + "." + sttChild)}) );
      }
    }
    return result;
  }

  /**
   * @param {Array[Object]} dataRoot 
   * @param {number} page | start from 0
   * @param {number} customItemsPerPage 
   */
  paginationList(dataRoot = [], page = 0, customItemsPerPage = 25){
    if(dataRoot.length <= 0){
      return [];
    }
    let startID = page*customItemsPerPage;
    let endID = (page+1)*customItemsPerPage;
    let data = dataRoot.slice(startID,endID);
    // prepar parent
    let number = data[0].stt.toString().indexOf('.');
    // exists parent need get
    if( number > 0 ){
      let numberChild = data[0].stt.slice(number+1);
      // add parent line
      if(dataRoot[startID-numberChild]){
        data.unshift(dataRoot[startID-numberChild]);
      }
    }
    return data;
  }

  handleClickAdd = () => {
    window._$g.rdr('/task/add')
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
      this._TaskModel.changeStatus(id, postData)
      .then(() => {
        const cloneData = [...this.state.dataRender]
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

  handleActionItemClick(type, id) {
    let routes = {
      detail: '/task/detail/',
      delete: '/task/delete/',
      edit: '/task/edit/',
      changePassword: '/task/change-password/',
    }
    const route = routes[type];
    if (type.match(/detail|edit|changePassword/i)) {
      window._$g.rdr(`${route}${id}`)
    } else {
      window._$g.dialogs.prompt(
        'Bạn có chắc chắn muốn xóa dữ liệu đang chọn?',
        'Xóa',
        (confirm) => this.handleClose(confirm, id)
      )
    }
  }

  handleClose(confirm, id) {
    const { data, page, customItemsPerPage } = this.state
    if (confirm) {
      this._TaskModel.delete(id)
      .then(() => {
        let newData = Object.values(data);
        newData.map((item, index) => {
          return (item.task_id === id) && newData.splice(index, 1);
        });
        newData = this.parentAndChildrenTask(newData);
        const dataRender = this.paginationList(newData,page,customItemsPerPage);
        this.setState({
          data: newData,
          dataRender,
          count: newData.length,
        });
      })
      .catch((err) => {
        console.log('err', err);
        let errorMessage;
        switch(err.message){
          case 'Task used by TASK': errorMessage = 'Công việc không thể xóa vì có công việc con'; break;
          default: errorMessage = 'Có lỗi trong quá trình xử lý, bạn vui lòng thao tác lại!'; break;
        }
        window._$g.dialogs.alert(
          window._$g._(errorMessage)
        )
      })
    }
  }

  handleSubmitFilter = (search, start_date_from, start_date_to, task_type_id, parent_id, end_date_from, end_date_to, is_active, is_completed) => {
    let query = {...this.state.query}
    task_type_id = task_type_id || {};
    query = Object.assign(query, {
      page:1,
      search,
      start_date_from,
      start_date_to,
      task_type_id: task_type_id.value,
      parent_id,
      end_date_from,
      end_date_to,
      is_active,
      is_completed
    });
    this.getData(query, false)
    .catch((err) => {
      console.log('err', err);
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
    this.setState({
      permissionDel: task_type_id.delete,
      permissionEdit: task_type_id.edit,
    })
  }

  handleChangeRowsPerPage = (event ) => {
    let customItemsPerPage = event.target.value;
    let newPage = 0;
    let { data } = this.state;

    let newData = this.paginationList(data,newPage,customItemsPerPage);

    this.setState({
      dataRender: newData,
      page: newPage,
      customItemsPerPage
    });
  }

  handleChangePage = (event, newPage) => {
    let { data, customItemsPerPage } = this.state;
    let newData = this.paginationList(data,newPage,customItemsPerPage);
    this.setState({dataRender: newData, page: newPage})
  }

  render() {

    const {count, query, page, customItemsPerPage, dataRender, permissionDel, permissionEdit} = this.state;
    const options = configTableOptions(count, page, query);
    const columns = [
      configIDRowTable("task_id", "/task/edit/", this.state.query,2),
      {
        name: "task_name",
        label: "Tên công việc",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name:'stt',
        options: {
          display: false,
        }
      },
      {
        name: "task_type_name",
        label: "Loại công việc",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "start_date",
        label: "Ngày bắt đầu",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "end_date",
        label: "Ngày kết thúc",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "full_name",
        label: "Nhân viên xử lý",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "supervisor_full_name",
        label: "Nhân viên giám sát",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "count_dataleads_complete",
        label: "Số khách hàng đã hoàn thành chăm sóc",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "is_completed",
        label: "Đã hoàn thành",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center">
                <input type="checkbox" defaultChecked={value} disabled={true}/>
              </div>
            );
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
            return (
              <div className="text-center">
                { (permissionEdit || window._$g.userAuth.isAdministrator) ?
                  <CheckAccess permission="CRM_TASK_EDIT">
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
                        this.handleChangeStatus(checked, this.state.dataRender[tableMeta['rowIndex']].task_id, tableMeta['rowIndex'])
                      }}
                    />
                  </CheckAccess>
                  : 
                  <FormControlLabel
                    label={value ? "Có" : "Không"}
                    value={value ? "Có" : "Không"}
                    control={
                    <Switch
                      color="primary"
                      checked={value === 1}
                      value={value}
                      disabled={true}
                    />
                    }
                  />
                }
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
                <CheckAccess permission="CRM_TASK_VIEW">
                  <Button
                    color="warning"
                    title="Danh sách khách hàng"
                    className="mr-1" 
                    onClick={()=>{window._$g.rdr(`/task/customers/${dataRender[tableMeta['rowIndex']].task_id}`)}}
                  >
                    <i className="fa fa-list" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="CRM_TASK_VIEW">
                  <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', dataRender[tableMeta['rowIndex']].task_id)}>
                    <i className="fa fa-info" />
                  </Button>
                </CheckAccess>
                { (permissionEdit || window._$g.userAuth.isAdministrator) ?
                  <CheckAccess permission="CRM_TASK_EDIT">
                    <Button color="primary" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', dataRender[tableMeta['rowIndex']].task_id)}>
                      <i className="fa fa-edit" />
                    </Button>
                  </CheckAccess> : null
                }
                { (permissionDel || window._$g.userAuth.isAdministrator) ?
                  <CheckAccess permission="CRM_TASK_DEL">
                    <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', dataRender[tableMeta['rowIndex']].task_id)}>
                      <i className="fa fa-trash" />
                    </Button>
                  </CheckAccess> : null
                }
              </div>
            );
          }
        }
      },
    ]
    
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
                <TaskFilter
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <div>
          <CheckAccess permission="CRM_TASK_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
          <CheckAccess permission="CRM_TASK_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width" color="excel"  size="sm">
              <i className="fa fa-download mr-1" />Xuất excel
            </Button>
          </CheckAccess>
        </div>
        <Card className="animated fadeIn">
          <CardBody className="px-0 py-0">
            <div className="MuiPaper-root__custom MuiPaper-root__myCustom">
              {this.state.isLoading
                ? (
                  <div className="d-flex flex-fill justify-content-center mt-5 mb-5">
                    <CircularProgress />
                  </div>
                )
                : (
                  <div>
                    <MUIDataTable
                      data={this.state.dataRender}
                      columns={columns}
                      options={options}
                    />
                    <CustomPagination
                      count={count}
                      rowsPerPage={customItemsPerPage}
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

export default Task

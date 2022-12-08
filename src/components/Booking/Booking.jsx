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
import BookingFilter from './BookingFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import BookingModel from '../../models/BookingModel'
import CompanyModel from '../../models/CompanyModel'
import BusinessModel from '../../models/BusinessModel';
import PositionModel from '../../models/PositionModel';
import BookingStatusModel from '../../models/BookingStatusModel';
// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Users
 */
class Booking extends Component {
  /**
   * @var {UserGroupModel}
   */
  _BookingModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._bookingModel = new BookingModel()
    this._companyModel = window._companyModel = new CompanyModel()
    this._businessModel = window._businessModel = new BusinessModel();
    this._positionModel = window._positionModel = new PositionModel();
    this._bookingStatusModel = window._bookingStatusModel = new BookingStatusModel();
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
      is_system: 2
    },
    /** @var {Array} */
    company: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    business: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    position: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    bookingStatusArr:[
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
        position =[],
        bookingStatusArr=[],
      } = this.state;
      company = company.concat(bundle.company || []);
      business = business.concat(bundle.business || []);
      position = position.concat(bundle.position || []);
      bookingStatusArr = bookingStatusArr.concat(bundle.bookingStatusArr || []);
      console.log(bookingStatusArr);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          business,
          company,
          position,
          bookingStatusArr,
        });
      })
      console.log(this.state)
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
      this._positionModel.getOptions()
        .then(data => (bundle['position'] = data)),
      this._bookingStatusModel.getOptions()
      .then(data => (bundle['bookingStatusArr'] = data)),
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
    console.log(bundle);
    return bundle
  }

  // get data
  getData = ( query = {} ) => {
    this.setState({ isLoading: true });
    return this._bookingModel.getList(query)
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
    window._$g.rdr('/booking/add');
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
      this._bookingModel.changeStatus(id, postData)
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
      detail: '/booking/detail/',
      delete: '/booking/delete/',
      edit: '/booking/edit/',
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
      this._bookingModel.delete(id)
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

  handleSubmitFilter = (search, status, create_date_from, create_date_to) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {create_date_from,create_date_to, status, search});
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
    this._bookingModel.exportExcel()
    .then(response => {
      const configDate = moment().format("DDMMYYYY");
      fileDownload(response, `Booking_${configDate}.csv`);
    })
    .catch((error) => {
      console.log(error)
    });
  }

  render() {
    const columns = [
      configIDRowTable("booking_id", "/booking/detail/", this.state.query),
      {
        name: "booking_no",
        label: "Số đơn hàng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "full_name",
        label: "Tên khách hàng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "phone_number",
        label: "Số điện thoại ",
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
        name: "total_money",
        label: "Tổng tiền",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "booking_date",
        label: "Ngày tạo đơn hàng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "status_name",
        label: "Trạng thái đơn đặt hàng",
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
                <Button color="warning" title="Chi tiết" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].booking_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="SL_BOOKING_EDIT">
                  <Button color="success" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].booking_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="SL_BOOKING_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].booking_id, tableMeta['rowIndex'])}>
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
                <BookingFilter
                  businessArr={this.state.business}
                  companyArr={this.state.company}
                  positionArr = {this.state.position}
                  bookingStatusArr = {this.state.bookingStatusArr}
                  handleSubmit={this.handleSubmitFilter}

                />
              </div>
            </CardBody>
          )}
        </Card>

        <div>
          <CheckAccess permission="SL_BOOKING_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
          <CheckAccess permission="SL_BOOKING_EXPORT">
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

export default Booking;

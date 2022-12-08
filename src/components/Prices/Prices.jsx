import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button, Label } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import PriceFilter from './PriceFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index';
// Model(s)
import PriceModel from '../../models/PriceModel'
import BusinessModel from "../../models/BusinessModel";
import OutputTypeModel from "../../models/OutputTypeModel";
// Constant(s)
import { PRICE_REVIEW_ARRAY } from "../../actions/constants/price"

// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Price
 */
class Price extends Component {
  /**
   * @var {Price}
   */
  _priceModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._priceModel = new PriceModel()
    this._businessModel = new BusinessModel();
    this._outputTypeModel = new OutputTypeModel();
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
    },
    /** @var {Array} */
    businesses: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    outputType: [
      { name: "-- Chọn --", id: "" },
    ],
    productIdSelect: null,
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
      let page = 0;

      // prepare data for checkbox
      let dataToCheck = {};
      dataConfig.map((value)=>{
        return dataToCheck[value.product_code] = value
      })

      let {
        businesses = [],
        outputType = [],
      } = this.state;
      businesses = businesses.concat(bundle.businesses || []);
      outputType = outputType.concat(bundle.outputType || []);

      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          count, page,
          dataToCheck,
          businesses,
          outputType
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
      this._priceModel.getList(this.state.query)
        .then(data => (bundle['data'] = data)),
      this._businessModel.getOptions({ is_active: 1 })
        .then(data => (bundle['businesses'] = data)),
      this._outputTypeModel.getOptions()
        .then(data => (bundle['outputType'] = data)),
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
    return this._priceModel.getList(query)
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
    if(this.state.productIdSelect){
      window._$g.rdr('/prices/add/'+this.state.productIdSelect);
    }else{
      window._$g.toastr.show('Bạn cần chọn sản phẩm để thêm giá', 'error');
    }
  }

  // handleChangeStatus = (status, id, rowIndex) => {
  //   window._$g.dialogs.prompt(
  //     'Bạn có chắc chắn muốn thay đổi trạng thái dữ liệu đang chọn?',
  //     'Cập nhật',
  //     (confirm) => this.onChangeStatus(confirm, status, id, rowIndex)
  //   )
  // }

  // onChangeStatus = (confirm, status, id, idx) => {
  //   // call api update
  //   if (confirm) {
  //     let postData = {is_active: status ? 1 : 0};
  //     this._priceModel.changeStatus(id, postData)
  //     .then(() => {
  //       const cloneData = [...this.state.data]
  //       cloneData[idx].is_active = status
  //       this.setState({
  //         data: cloneData,
  //       }, () => {
  //         window._$g.toastr.show('Cập nhật trạng thái thành công.', 'success');
  //       });
  //     })
  //     .catch(() => {
  //       window._$g.toastr.show('Cập nhật trạng thái không thành công.', 'error');
  //     });
  //   }
  // }

  handleActionItemClick(type, id, rowIndex) {
    let routes = {
      review: '/prices/review/',
      delete: '/prices/delete/',
      edit: '/prices/edit/',
      changePassword: '/prices/change-password/',
    }
    const route = routes[type]
    if (type.match(/review|edit|changePassword/i)) {
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
      this._priceModel.delete(id)
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

  handleSubmitFilter = (search, output_type_id, area_id, business_id, is_service, is_review, start_date, end_date, is_output_for_web) => {
    let query = {...this.state.query}
    query.page = 1;
    
    query = Object.assign(query, {search, output_type_id, area_id, business_id, is_service, is_review, start_date, end_date, is_output_for_web})
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

  handleChangeCheckbox = (tableMeta) => {
    let { productIdSelect } = this.state;
    let id = tableMeta.rowData[1];
    productIdSelect = productIdSelect !== id ? id : null;
    this.setState({ productIdSelect })
  }
  
  render() {
    
    const columns = [
      configIDRowTable(),
      {
        name: "product_id",
        options: {
          display: false,
        }
      },
      {
        name: "price_id",
        options: {
          display: false,
        }
      },
      {
        name: "product_code",
        label: "Mã sản phẩm",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "product_name",
        label: "Tên sản phẩm",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "output_type_name",
        label: "Hình thức xuất",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "company_name",
        label: "Công ty",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "area_name",
        label: "Khu vực",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "business_name",
        label: "Cơ sở phòng tập",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "price",
        label: "Giá sản phẩm",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "price_vat",
        label: "Giá sau VAT",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "apply_time",
        label: "Thời gian áp dụng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "is_review",
        label: "Trạng thái",
        options: {
          filter: false,
          sort: false,
          customBodyRender:(value) => <Label>{ PRICE_REVIEW_ARRAY[value] }</Label>
        }
      },
      {
        name: "is_output_for_web",
        label: "Giá hiển thị web",
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
                <CheckAccess permission="SL_OUTPUTTYPE_EDIT">
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
                    disabled
                    // onChange={event => {
                    //   let checked = ((1 * event.target.value) === 1 ? 0 : 1)
                    //   this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].output_type_id, tableMeta['rowIndex'])
                    // }}
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
                <CheckAccess permission="SL_PRICES_EDIT">
                  {
                    this.state.data[tableMeta['rowIndex']].product_id &&
                    <Button color="primary" title="Chỉnh sửa" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].product_id, tableMeta['rowIndex'])}>
                      <i className="fa fa-edit" />
                    </Button>
                  }
                </CheckAccess>
                <CheckAccess permission="SL_PRICES_VIEW">
                  {
                    this.state.data[tableMeta['rowIndex']].product_id &&
                    <Button color="warning" title="Duyệt giá" className="mr-1" onClick={evt => this.handleActionItemClick('review', this.state.data[tableMeta['rowIndex']].product_id, tableMeta['rowIndex'])}>
                      <i className="fa fa-check-circle mr-1" />
                    </Button>
                  }
                </CheckAccess>
                <CheckAccess permission="SL_PRICES_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].price_id, tableMeta['rowIndex'])}>
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
    const options = configTableOptions(count, page, query);
    options['setRowProps'] = (rowDatas,b,c) => ({
      onDoubleClick: (row) => {
        if(rowDatas[2]){
          this.handleActionItemClick('detail', rowDatas[2], null)
        }
      }
      // this.handleChangeCheckbox(rowData);
    });
    console.log('state', this.state.data);
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
                <PriceFilter
                  handleSubmit={this.handleSubmitFilter}
                  businesses={this.state.businesses}
                  outputType={this.state.outputType}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <div>
          <CheckAccess permission="SL_PRICES_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width" color="excel"  size="sm">
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
    )
  }
}

export default Price

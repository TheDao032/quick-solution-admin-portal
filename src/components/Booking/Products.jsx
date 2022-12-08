import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button, Label, FormGroup } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress, Checkbox } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination';
import classnames from 'classnames';

// Component(s)DEFAULT_COUNTRY_ID
import ProductsFilter from './ProductsFilter'
import { DEFAULT_COUNTRY_ID } from '../Common/Address'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions } from '../../utils/index'
import { mapDataOptions4Select } from '../../utils/html';


// Model(s)
import ProductModel from '../../models/ProductModel'
import ManufacturerModel from '../../models/ManufacturerModel'
import ProductCategoryModel from "../../models/ProductCategoryModel";
// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Products
 */
class Products extends Component {
  _customerDataLeadsModel

  constructor(props) {
    super(props)

    // Init model(s) 
    this._productModel = new ProductModel();
    this._productCategoryModel = new ProductCategoryModel();
    this._manufacturerModel = new ManufacturerModel();
    // Bind method(s)
  }

  state = {
    isLoading: false,
    page: 0,
    count: 1,
    data: [],
    dataToCheck:{},
    query: {
      itemsPerPage: 25,
      page: 1,
      is_active: 1,
    },
    customerSelect: {},
    /** @var {Array} */
    segment: [
      { label: "-- Chọn --", value: "", id:"", name: "-- Chọn --" },
    ],
    checkCanBeAddCustomer:{},
     /** @var {Array} --*/ 
     productCategoryOptions: [
      { name: "-- Chọn --", id: "" },
    ],
    /** @var {Array} */
    manufacturerOptions: [
      { name: "-- Chọn --", id: "" },
    ],
  }

  componentDidMount() {
    this.getData();
    // Get bundle data
    this.setState({ 
      isLoading: true,
      customerSelect: Object.assign({},this.props.customersSelect)
    });
    (async () => {
      let bundle = await this._getBundleData();
      console.log('bundle')
      console.log(bundle)
      let { data } = bundle;
      let dataConfig = data ? data.items : []
      let isLoading = false;
      let count = data ? data.totalItems : 0
      let page = 0
      let {
        segment,
        statusDataLead = [],
        productCategoryOptions = [],
        manufacturerOptions = [],
      } = this.state;
      //
      segment = [segment[0]].concat(bundle.segment || []);
      statusDataLead = statusDataLead.concat(bundle.statusDataLead || []);
      productCategoryOptions = productCategoryOptions.concat(bundle.productCategoryOptions || []);
      manufacturerOptions = manufacturerOptions.concat(bundle.manufacturerOptions || []);
      // prepare data for checkbox
      let dataToCheck = {};

      dataConfig.map((value)=>{
        return dataToCheck[value.booking_id] = value
      })

      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig, segment, statusDataLead,
          count, page, dataToCheck,
          productCategoryOptions,
          manufacturerOptions,
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
      this._productCategoryModel.getOptionsForList({ is_active: 1 })
        .then(data => (bundle['productCategoryOptions'] = data)),
      this._manufacturerModel.getOptions({ is_active: 1 })
        .then(data => (bundle['manufacturerOptions'] = data)),
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
   getData = ( _query ) => {
    this.setState({ isLoading: true });
    let { query } = this.state;
    query = Object.assign(_query || query, this.props.stateQuery);
 
    return this._productModel.getList(query)
      .then(res => {
        let {
          items = [],
          totalItems,
          totalPages,
          ...rest
        } = res;
        let data = res.items;
        let isLoading = false;

        // prepare data for checkbox
        let dataToCheck = {};
        data.map((value)=>{
          return dataToCheck[value.product_code] = value;
        }) 
        console.log('data')
        console.log(data)
        console.log(totalItems)
        console.log(totalPages)
        this.setState({
          isLoading,
          data: items,
          totalItems,
          totalPages,
          query: Object.assign(query, rest),
          dataToCheck,
        });
      });
  }


  clearData = () => this.setState({data:[]})

  handleSubmitFilter = (search, product_category_id, status_product_id, manufacturer_id, created_date_from, created_date_to, is_service, is_active, is_show_web) => {
    let query = {...this.state.query}
    query.page = 1
    query = Object.assign(query, {search, product_category_id, status_product_id, manufacturer_id, created_date_from, created_date_to, is_service, is_active, is_show_web})
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
  }


  handleAdd = () => {
    //if(!Object.keys(this.state.checkCanBeAddCustomer).length){
      this.props.handleAdd(this.state.customerSelect, this.state.query);
   // }else{
   //   window._$g.toastr.show('Không thể thêm khách hàng đã có công việc', 'error');
    //}
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

  handleChangeCheckbox = (rowData) => {
    let { customerSelect, checkCanBeAddCustomer } = this.state;
    if(!customerSelect[rowData[1]]){
      customerSelect[rowData[1]] = this.state.dataToCheck[rowData[1]];
      customerSelect[rowData[1]].quantity = 1;
      customerSelect[rowData[1]].price = 0;
      console.log(customerSelect);
      // check customer already in other task
      if(
     //   rowData[2] !== STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED &&
        rowData[3] !== this.props.bookingID
      ){
        checkCanBeAddCustomer[rowData[1]] = true;
      }
    }else{
      delete customerSelect[rowData[1]];
      delete checkCanBeAddCustomer[rowData[1]];
    }
    this.setState({
      customerSelect: Object.assign({}, customerSelect),
      checkCanBeAddCustomer: Object.assign({}, checkCanBeAddCustomer),
    });
  }

  checkedAll = (event) => {
    let customerSelect = {};
    let checkCanBeAddCustomer = {};
    if(event.target.checked){
      this.state.data.map((value)=>{
        if(
         // value.status_data_leads_key !== STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED &&
          value.booking_id !== this.props.bookingID
        ){
          checkCanBeAddCustomer[value.product_code] = true;
        }
        return customerSelect[value.product_code] = value;
      });
    }
    this.setState({ customerSelect, checkCanBeAddCustomer });
  }

  render() {
    const {customerSelect, data} = this.state;
    console.log('data');
    console.log(data);
    const columns = [
      {
        name: '#',
        label: "#",
        options: {
          filter: false,
          sort: false,
          customHeadRender: (columnMeta) => {
            return (
              <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                <div className="text-center">
                  <Checkbox
                    // style={{backgroundColor:'white'}}
                    onChange={(event)=>{this.checkedAll(event)}}
                    checked={Object.keys(customerSelect).length === data.length && data.length > 0}
                  />
                </div>
              </th>
            )
          },
          customBodyRender: (value, tableMeta) => {
            return (
              <div className="text-center">
                <Checkbox checked={!!this.state.customerSelect[tableMeta.rowData[1]]}/>
              </div>
            );
          }
        }
      },
      {
        name: "product_code",
        label: "Mã sản phẩm",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "product_name",
        label: "Tên sản phẩm",
      },
      {
        name: "category_name",
        label: "Danh mục sản phẩm",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "model_name",
        label: "Model",
        options: {
          filter: false,
          sort: false,
        }
      },
   
      {
        name: "is_service",
        label: "Là sản phẩm dịch vụ",
        options: {
          filter: false,
          sort: false,
          //customHeadRender: (columnMeta) => {
          // return (
          //    <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
          //      <div className="text-center">
          //        {columnMeta.label}
          //      </div>
          //    </th>
          //  )
          //},
          customBodyRender: (value, tableMeta) => {
            return (
              <div className="text-center">
                <FormControlLabel
                  label={value ? "Có" : "Không"}
                  value={value ? "Có" : "Không"}
                  control={
                  <Switch
                    color="primary"
                    defaultChecked={value === 1}
                    value={value}
                    disabled={true}
                  />
                  }
                />
              </div>
            );
          }
        },
      },
      {
        name: "manufacturer_name",
        label: "Nhà sản xuất",
        options: {
          filter: false,
          sort: false,
        }
      },
    ]

    const {count, page, query} = this.state;
    let options = configTableOptions(count, page, query);

    options['onRowClick'] = (rowData) => {
      this.handleChangeCheckbox(rowData);
    };
    options['setRowProps'] = (row,dataIndex) =>{
      return {
        className: classnames(row[2])
      }
    };
    
    return (
      <div style={{ backgroundColor:'white', maxHeight:'100%', overflowY:'scroll'}}>
        <Card className="animated fadeIn z-index-222">
          <CardHeader className="d-flex">
            <div className="flex-fill font-weight-bold">
              Thông tin tìm kiếm
            </div>
            <div
              className="minimize-icon cur-pointer"
              onClick={this.props.toggleCustomer}
            >
              <i className='fa fa-times' />
            </div>
          </CardHeader>
          <CardBody className="px-0 py-0" >
            <div className="MuiPaper-filter__custom z-index-2">
              <ProductsFilter
                productCategoryOptions={this.state.productCategoryOptions}
                manufacturerOptions={this.state.manufacturerOptions}
                segment={this.state.segment}
                handleSubmit={this.handleSubmitFilter}
                handleAdd={this.handleAdd}
                clearData={this.clearData}
              />
            </div>
          </CardBody>
        </Card>
        <Card className="animated fadeIn mb-0">
          <CardBody>
            <div className="MuiPaper-root__custom disabledPosition">
              {this.state.isLoading
                ? (
                  <div className="d-flex flex-fill justify-content-center mt-5">
                    <CircularProgress />
                  </div>
                )
                : (
                  <div>
                    <div>
                      <MUIDataTable
                        data={this.state.data}
                        columns={columns}
                        options={options}
                      />
                    </div> 
                    <CustomPagination
                      count={1 * this.state.totalItems}
                      rowsPerPage={1 * query.itemsPerPage}
                      page={(1 * query.page) - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                    <div className="d-flex flex-fill justify-content-end">
                      <FormGroup className="mb-2 ml-2 mb-sm-0">
                        <Button className="mr-1 MuiPaper-filter__custom--button" onClick={this.props.toggleCustomer} size="sm">
                          <i className="fa fa-close" />
                          <span className="ml-1">Đóng</span> 
                        </Button>
                      </FormGroup>
                    </div>
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

export default Products

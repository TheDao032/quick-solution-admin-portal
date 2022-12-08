import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button, FormGroup } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import { CircularProgress, Checkbox } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import AttributeListFilter from './AttributeListFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions } from '../../utils/index'
// Model(s)
import ProductAttributeModel from '../../models/ProductAttributeModel'

// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class CustomerDataLeads
 */
class AttributeList extends Component {
  _productAttributeModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._productAttributeModel = new ProductAttributeModel()
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
      is_deleted: 0,
    },
    attributeSelect: {},
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ 
      isLoading: true,
      attributeSelect: Object.assign({},this.props.attributesSelect)
    });
    (async () => {
      let bundle = await this._getBundleData();
      let { data } = bundle;
      let dataConfig = data ? data.items : []
      let isLoading = false;
      let count = data ? data.totalItems : 0
      let page = 0

      // prepare data for checkbox
      let dataToCheck = {};

      dataConfig.map((value)=>{
        return dataToCheck[value.product_attribute_id] = value
      })

      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          count, page, dataToCheck
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
      this._productAttributeModel.getList(this.state.query)
        .then(data => (bundle['data'] = data)),
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
    return this._productAttributeModel.getList(query)
    .then(res => {
      let data = res.items;
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;

      // prepare data for checkbox
      let dataToCheck = {};
      data.map((value)=>{
        return dataToCheck[value.product_attribute_id] = value;
      })

      this.setState({
        data, isLoading,
        count, page, query,
        dataToCheck
      })
    })
  }

  handleSubmitFilter = ( search ) => {
    let query = {...this.state.query}
    // query.page = 1
    query = Object.assign(query, { search });
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
  }

  handleAdd = () => {
    this.props.handleAdd(this.state.attributeSelect, this.state.query);
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
    let { attributeSelect } = this.state;
    if(!attributeSelect[rowData[1]]){
      attributeSelect[rowData[1]] = this.state.dataToCheck[rowData[1]];
    }else{
      delete attributeSelect[rowData[1]];
    }
    this.setState({attributeSelect: Object.assign({}, attributeSelect)})
  }

  checkedAll = (event) => {
    let attributeSelect = {};
    if(event.target.checked){
      this.state.data.map((value)=>{

        return attributeSelect[value.product_attribute_id] = value;
      });
    }
    this.setState({ attributeSelect });
  }

  render() {
    const {attributeSelect, data} = this.state;
    const columns = [
      {
        name: '#',
        label: "#",
        options: {
          filter: false,
          sort: false,
          customHeadRender: (columnMeta) => {
            return (
              <th width="1%" key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                <div className="text-center">
                  <Checkbox
                    // style={{backgroundColor:'white'}}
                    onChange={(event)=>{this.checkedAll(event)}}
                    checked={Object.keys(attributeSelect).length === data.length && data.length > 0}
                  />
                </div>
              </th>
            )
          },
          customBodyRender: (value, tableMeta) => {
            return (
              <div className="text-center">
                <Checkbox checked={!!this.state.attributeSelect[tableMeta.rowData[1]]}/>
              </div>
            );
          }
        }
      },
      {
        name: "product_attribute_id",
        options: {
          display: false,
        }
      },
      {
        name: "attribute_name",
        label: "Tên thuộc tính",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "unit_name",
        label: "Đơn vị tính",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "attribute_description",
        label: "Mô tả",
      },
      {
        name: "created_date",
        label: "Ngày tạo",
        options: {
          filter: false,
          sort: false,
        }
      }
    ]

    const {count, page, query} = this.state;
    let options = configTableOptions(count, page, query);

    options['onRowClick'] = (rowData) => {
      this.handleChangeCheckbox(rowData);
    };
    
    return (
      <div xs={12} style={{ backgroundColor:'white', maxHeight:'100%', overflowY:'scroll'}}>
        <Card className="animated fadeIn z-index-222">
          <CardHeader className="d-flex">
            <div className="flex-fill font-weight-bold">
              Thông tin tìm kiếm
            </div>
            <div
              className="minimize-icon cur-pointer"
              onClick={this.props.toggleAttribute}
            >
              <i className='fa fa-times' />
            </div>
          </CardHeader>
          <CardBody className="px-0 py-0" >
            <div className="MuiPaper-filter__custom z-index-2">
              <AttributeListFilter
                segment={this.state.segment}
                handleSubmit={this.handleSubmitFilter}
                handleAdd={this.handleAdd}
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
                      count={count}
                      rowsPerPage={query.itemsPerPage}
                      page={page}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                    <div className="d-flex flex-fill justify-content-between">
                      <FormGroup className="mb-2 ml-2 mb-sm-0">
                        <Button className="mr-1 col-12 MuiPaper-filter__custom--button" onClick={()=>this.handleAdd()} size="sm">
                          <i className="fa fa-plus-circle" />
                          <span className="ml-1">Thêm</span>
                        </Button>
                      </FormGroup>
                      <FormGroup className="mb-2 ml-2 mb-sm-0">
                        <Button className="mr-1 MuiPaper-filter__custom--button" onClick={this.props.toggleAttribute} size="sm">
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

export default AttributeList

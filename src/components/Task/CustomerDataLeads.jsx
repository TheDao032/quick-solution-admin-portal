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
import CustomerDataLeadFilter from './CustomerDataLeadFilter'
import { DEFAULT_COUNTRY_ID } from '../Common/Address'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions } from '../../utils/index'
import { mapDataOptions4Select } from '../../utils/html';

// Constant(s)
import { STATUS_CUSTOMER_DATA_LEAD } from '../../actions/constants/customer_data_lead';
// Model(s)
import SegmentModel from '../../models/SegmentModel'
import StatusDataLeadModel from '../../models/StatusDataLeadModel'
import CustomerDataLeadModel from '../../models/CustomerDataLeadModel'

// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class CustomerDataLeads
 */
class CustomerDataLeads extends Component {
  _customerDataLeadsModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._segmentModel = new SegmentModel()
    this._statusDataLeadModel = new StatusDataLeadModel()
    this._customerDataLeadsModel = new CustomerDataLeadModel()
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
      is_active: 2,
      country_id:DEFAULT_COUNTRY_ID
    },
    customerSelect: {},
    /** @var {Array} */
    segment: [
      { label: "-- Chọn --", value: "", id:"", name: "-- Chọn --" },
    ],
    checkCanBeAddCustomer:{},
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ 
      isLoading: true,
      customerSelect: Object.assign({},this.props.customersSelect)
    });
    (async () => {
      let bundle = await this._getBundleData();
      let { data } = bundle;
      let dataConfig = data ? data.items : []
      let isLoading = false;
      let count = data ? data.totalItems : 0
      let page = 0
      let {
        segment,
        statusDataLead = [],
      } = this.state;
      //
      segment = [segment[0]].concat(bundle.segment || []);
      statusDataLead = statusDataLead.concat(bundle.statusDataLead || []);

      // prepare data for checkbox
      let dataToCheck = {};

      dataConfig.map((value)=>{
        return dataToCheck[value.data_leads_id] = value
      })

      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig, segment, statusDataLead,
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
      this._segmentModel.getOptions({ is_active: 1 })
        .then(data => (bundle['segment'] = mapDataOptions4Select(data))),
      this._statusDataLeadModel.getOptions({ is_active: 1, is_won: 2, is_lost: 2 })
        .then(data => (bundle['statusDataLead'] = data)),
      this._customerDataLeadsModel.getList(this.state.query)
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
    return this._customerDataLeadsModel.getList(query)
    .then(res => {
      let data = res.items;
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;

      // prepare data for checkbox
      let dataToCheck = {};
      data.map((value)=>{
        return dataToCheck[value.data_leads_id] = value;
      })

      this.setState({
        data, isLoading,
        count, page, query,
        dataToCheck
      })
    })
  }

  clearData = () => this.setState({data:[]})

  handleSubmitFilter = (
    search,
    created_date_from,
    created_date_to,
    country_id,
    province_id,
    district_id,
    ward_id,
    gender,
    segment_id,
    marital_status,
    is_active,
    status_data_leads_key
  ) => {
    let query = {...this.state.query}
    // query.page = 1
    query = Object.assign(query, {
      page:1,
      search,
      created_date_from,
      created_date_to,
      country_id,
      province_id,
      district_id,
      ward_id,
      gender,
      segment_id,
      marital_status,
      is_active,
      status_data_leads_key
    });
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
  }

  handleAdd = () => {
    if(!Object.keys(this.state.checkCanBeAddCustomer).length){
     
      this.props.handleAdd(this.state.customerSelect, this.state.query);
    }else{
      window._$g.toastr.show('Không thể thêm khách hàng đã có công việc', 'error');
    }
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
      // check customer already in other task
      if(
        (rowData[2] !== STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED || rowData[17] ) &&
        rowData[3] !== this.props.taskID
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
    })
  }

  checkedAll = (event) => {
    let customerSelect = {};
    let checkCanBeAddCustomer = {};
    if(event.target.checked){
      this.state.data.map((value)=>{
        if(
          value.status_data_leads_key !== STATUS_CUSTOMER_DATA_LEAD.NOT_ASSIGNED &&
          value.task_id !== this.props.taskID
        ){
          checkCanBeAddCustomer[value.data_leads_id] = true;
        }
        return customerSelect[value.data_leads_id] = value;
      });
    }
    this.setState({ customerSelect, checkCanBeAddCustomer });
  }

  render() {
    const {customerSelect, data} = this.state;
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
        name: "data_leads_id",
        label: "Mã khách hàng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "status_data_leads_key",
        options: {
          display: false,
        }
      },
      {
        name: "task_id",
        options: {
          display: false,
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
        name: "gender",
        label: "Giới tính",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center">
                {/* {value === 1 ? "Nam" : value === 0 ? "Nữ" : "Khác"} */}
                {value === 1 ? "Nam" : "Nữ"}
              </div>
            );
          }
        }
      },
      {
        name: "phone_number",
        label: "Số điện thoại",
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
        name: "birthday",
        label: "Ngày sinh",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "id_card",
        label: "Số CMND",
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
        name: "marital_status",
        label: "Tình trạng hôn nhân",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value) => {
            return (
              <div className="text-center">
                <Label>{value ? "Đã kết hôn" : "Độc thân"}</Label>
              </div>
            );
          }
        }
      },
      {
        name: "segment_name",
        label: "Phân khúc khách hàng",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value) => {
            return ( value &&
              <div>
                {value.map((item, key)=><div key={key}><Label >{item}</Label></div>)}
              </div>
            );
          }
        }
      },
      {
        name: "campaign_name",
        label: "Thuộc chiến dịch",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value) => {
            return ( value &&
              <div>
                {value.map((item, key)=><div key={key}><Label >{item}</Label></div>)}
              </div>
            );
          }
        }
      },
      {
        name: "status_data_leads_name",
        label: "Trạng thái khách hàng",
        options: {
          filter: false,
          sort: false,
        }
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
          filter: false,
          sort: false,
          customHeadRender: (columnMeta) => {
            return (
              <th key={`head-th-${columnMeta.label}`} className="MuiTableCell-root MuiTableCell-head">
                <div className="text-center">
                  {columnMeta.label}
                </div>
              </th>
            )
          },
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
        name: "is_completed",
        options: {
          display: false,
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
              <CustomerDataLeadFilter
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
                      count={count}
                      rowsPerPage={query.itemsPerPage}
                      page={page}
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

export default CustomerDataLeads

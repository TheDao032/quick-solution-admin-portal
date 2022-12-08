import React, { Component } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import { CircularProgress, Checkbox } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import BusinessUserAddFilter from './BusinessUserAddFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions } from '../../utils/index'
// Model(s)
import UserModel from '../../models/UserModel'
import CompanyModel from '../../models/CompanyModel'
import BusinessUserModel from '../../models/BusinessUserModel'
import { Object } from 'core-js'

// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class BusinessUserAdd
 */
class BusinessUserAdd extends Component {
  /**
   * @var {BusinessUserModel}
   */
  _UserModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._UserModel = new UserModel()
    this._companyModel = window._companyModel = new CompanyModel()
    this._BusinessUserModel = window._BusinessUserModel = new BusinessUserModel()
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
    business_id:this.props.match.params.businessId,
    /** @var {Array} */
    company: [
      { name: "-- Chọn --", id: "" },
    ],
    userSelect: {},
    dataToCheck:{},
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ isLoading: true });
    (async () => {
      let bundle = await this._getBundleData();
      let { data, userSelectData } = bundle;
      let dataConfig = data ? data.items : []
      let isLoading = false;
      let count = data ? data.totalItems : 0
      let page = 0
      let {
        company = [],
      } = this.state;
      company = company.concat(bundle.company || []);
      //
      let userSelect = {};
      userSelectData.items.map( (value)=> userSelect[value.user_id] = value)
      
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          count, page,
          company,
          userSelect
        });
      })
    })();
    //.end
  }

  /**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    const { business_id } = this.state;
    let bundle = {}
    let all = [
      // @TODO:
      this._companyModel.getOptions({ is_active: 1 })
        .then(data => (bundle['company'] = data)),
      this._BusinessUserModel.getAllUserOfBusiness(business_id)
        .then(data => (bundle['userSelectData'] = data)),
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
    
    return this._UserModel.list(query)
    .then(res => {
      let data = res.items;
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;

      // prepare data for checkbox
      let dataToCheck = {};
      data.map((value)=>{
        return dataToCheck[value.user_id] = value;
      })

      this.setState({
        data, isLoading,
        count, page, query, dataToCheck
      })
    })
  }

  handleSubmitFilter = (search, company_id, department_id) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {search, company_id, department_id});
    
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('Bạn vui lòng chọn dòng dữ liệu cần thao tác!')
      )
    })
  }

  handleChangeCheckbox = (rowData) => {
    let { userSelect } = this.state;
    
    if(!userSelect[rowData[1]]){
      userSelect[rowData[1]] = this.state.dataToCheck[rowData[1]];
    }else{
      delete userSelect[rowData[1]];
    }
    this.setState({userSelect: Object.assign({}, userSelect)})
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

  submitForm = () => {
    const { business_id } = this.state;
    let user_list = Object.keys(this.state.userSelect);
    this._BusinessUserModel.create({user_list, business_id})
      .then(() => {
        window._$g.toastr.show('Thêm nhân viên thành công', 'success');
      })
  }

  render() {
    const columns = [
      {
        name: "#",
        label: "Chọn",
        options: {
            customBodyRender: (value, tableMeta) => {
                return (
                <div className="text-center">
                    <Checkbox checked={!!this.state.userSelect[tableMeta.rowData[1]]}/>
                </div>
                );
            }
        }
      },
      {
        name: "user_id",
        options: {
          display: false,
        }
      },
      {
        name: "user_name",
        label: "Mã người dùng",
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "full_name",
        label: "Họ và tên",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "department_name",
        label: "Phòng ban",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "phone_number",
        label: "Điện thoại",
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
        },
        customHeadRender: (columnMeta, handleToggleColumn) => {
            return (
              <th className="">
                <div className="text-center">
                  {columnMeta.label}
                </div>
              </th>
            )
        },
        customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center" style={{maxWidth:'auto !important', width:'auto'}}>{value}</div>
            );
        }
      },
    ]

    const {count, page, query} = this.state;
    const options = configTableOptions(count, page, query)

    options['onRowClick'] = (rowData) => {
        this.handleChangeCheckbox(rowData);
    };

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
                <BusinessUserAddFilter
                  companyArr={this.state.company}
                  handleSubmit={this.handleSubmitFilter}
                  submitForm={this.submitForm}
                />
              </div>
            </CardBody>
          )}
        </Card>
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

export default BusinessUserAdd

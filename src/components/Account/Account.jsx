import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'

// Material
import MUIDataTable from 'mui-datatables'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'

// Component(s)
import { CheckAccess } from '../../navigation/VerifyAccess'
import AccountFilter from './AccountFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index';
// Model(s)
import AccountModel from '../../models/AccountModel'

// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Account
 */
class Account extends Component {
  /**
   * @var {AccountModel}
   */
  _accountModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._accountModel = new AccountModel()
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
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
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
      this._accountModel.getList(this.state.query)
        .then(data => (bundle['data'] = data)),
    ]
    await Promise.all(all)
      .catch(err => {
        window._$g.dialogs.alert(
          window._$g._(`Kh???i t???o d??? li???u kh??ng th??nh c??ng (${err.message}).`),
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
    return this._accountModel.getList(query)
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
    window._$g.rdr('/account/add')
  }

  handleChangeStatus = (status, id, rowIndex) => {
    window._$g.dialogs.prompt(
      'B???n c?? ch???c ch???n mu???n thay ?????i tr???ng th??i d??? li???u ??ang ch???n?',
      'C???p nh???t',
      (confirm) => this.onChangeStatus(confirm, status, id, rowIndex)
    )
  }

  onChangeStatus = (confirm, status, id, idx) => {
    if (confirm) {
      let postData = {is_active: status ? 1 : 0};
      this._accountModel.changeStatus(id, postData)
      .then(() => {
        const cloneData = [...this.state.data]
        cloneData[idx].is_active = status
        this.setState({
          data: cloneData,
        }, () => {
          window._$g.toastr.show('C???p nh???t tr???ng th??i th??nh c??ng.', 'success');
        });
      })
      .catch(() => {
        window._$g.toastr.show('C???p nh???t tr???ng th??i kh??ng th??nh c??ng.', 'error');
      });
    }
  }

  handleActionItemClick(type, id, rowIndex) {
    let routes = {
      detail: '/account/detail/',
      delete: '/account/delete/',
      edit: '/account/edit/',
    }
    const route = routes[type]
    console.log(route)
    if (type.match(/detail|edit/i)) {
      window._$g.rdr(`${route}${id}`)
    } else {
      window._$g.dialogs.prompt(
        'B???n c?? ch???c ch???n mu???n x??a d??? li???u ??ang ch???n?',
        'X??a',
        (confirm) => this.handleClose(confirm, id, rowIndex)
      )
    }
  }

  handleClose(confirm, id, rowIndex) {
    const { data } = this.state
    if (confirm) {
      this._accountModel.delete(id)
      .then(() => {
        const cloneData = JSON.parse(JSON.stringify(data))
        cloneData.splice(rowIndex, 1)
        this.setState({
          data: cloneData,
        })
      })
      .catch(() => {
        window._$g.dialogs.alert(
          window._$g._('B???n vui l??ng ch???n d??ng d??? li???u c???n thao t??c!')
        )
      })
    }
  }

  handleSubmitFilter = (
    isReset,
    search,
    country_id,
    province_id,
    district_id,
    ward_id,
    from_birth_day,
    to_birth_day,
    type_register,
    gender,
    is_active
  ) => {
    let query = {...this.state.query}
    query.page = 1
    if (isReset) {
      query = Object.assign(query, {
        account_key: null
      })
    }
    query = Object.assign(query, {
      search,
      country_id,
      province_id,
      district_id,
      ward_id,
      from_birth_day,
      to_birth_day,
      type_register,
      gender,
      is_active
    }) 
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('B???n vui l??ng ch???n d??ng d??? li???u c???n thao t??c!')
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
      configIDRowTable("member_id", "/account/detail/", this.state.query),
      {
        name: "customer_code",
        label: "M?? th??? kh??ch h??ng",
        options: {
          filter: false,
          sort: true,
        }
      },
     
      {
        name: "full_name",
        label: "T??n kh??ch h??ng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "gender",
        label: "Gi???i t??nh",
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            let result = null;
            switch ('' + value) {
              case '0':
                result = (<span>N???</span>);
                break;
              case '1':
                result = (<span>Nam</span>);
                break;
              default:
                result = (<span>Kh??c</span>);
            }
            return result;
          }
        }
      },
      {
        name: "birth_day",
        label: "Ng??y sinh",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "phone_number",
        label: "S??? ??i???n tho???i",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "address_full",
        label: "?????a ch???",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "type_register",
        label: "H??nh th???c ????ng k??",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "is_active",
        label: "K??ch ho???t",
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
                <CheckAccess permission="CRM_ACCOUNT_EDIT">
                  <FormControlLabel
                    label={value ? "C??" : "Kh??ng"}
                    value={value ? "C??" : "Kh??ng"}
                    control={
                    <Switch
                      color="primary"
                      checked={value === 1}
                      value={value}
                    />
                    }
                    onChange={event => {
                      let checked = ((1 * event.target.value) === 1 ? 0 : 1)
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].member_id, tableMeta['rowIndex'])
                    }}
                  />
                </CheckAccess>
              </div>
            );
          }
        },
      },
      {
        name: "Thao t??c",
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="text-center">
                <Button color="warning" title="Chi ti???t" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].member_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="CRM_ACCOUNT_EDIT">
                  <Button color="primary" title="Ch???nh s???a" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].member_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="CRM_ACCOUNT_DEL">
                  <Button color="danger" title="X??a" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].member_id, tableMeta['rowIndex'])}>
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
              Th??ng tin t??m ki???m
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
                <AccountFilter
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <div>
          <CheckAccess permission="CRM_ACCOUNT_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Th??m m???i
            </Button>
          </CheckAccess>
          <CheckAccess permission="CRM_ACCOUNT_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width" color="excel"  size="sm">
              <i className="fa fa-download mr-1" />Xu???t excel
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

export default Account

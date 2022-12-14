import React, { PureComponent } from "react";
import { Card, CardBody, CardHeader, Button } from "reactstrap";
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
import CompaniesFilter from './CompaniesFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html';
import { configTableOptions, configIDRowTable } from '../../utils/index';

// Model(s)
import CompaniesModel from "../../models/CompanyModel";
import CountryModel from "../../models/CountryModel";
import ProvinceModel from "../../models/ProvinceModel";
import DistrictModel from "../../models/DistrictModel";
import WardModel from "../../models/WardModel";

// Set layout full-wh
layoutFullWidthHeight();

/**
 * @class FunctionGroups
 */
class Companies extends PureComponent {
  /**
   * @var {FunctionGroupModel}
   */
  _companiesModel;
  _countryModel;
  _provinceModel;
  _districtModel;
  _wardModel;
  constructor(props) {
    super(props);

    // Init model(s)
    this._companiesModel = new CompaniesModel();
    this._countryModel = new CountryModel();
    this._provinceModel = new ProvinceModel();
    this._districtModel = new DistrictModel();
    this._wardModel = new WardModel();
  }
  state = {
    toggleSearch: true,
    page: 0,
    count: 1,
    data: [],
    isLoading: true,
    wards: [],
    districts: [],
    provinces: [],
    countries: [],
    query: {
      itemsPerPage: 25,
      page: 1,
      is_active: 1,
      country_id: null,
      province_id: null,
      district_id: null,
      ward_id: null,
      search: ''
    }
  };

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData({...this.state.query});
      this.setState({ ...bundle, isLoading: false });
    })();
    //.end
  }

  async _getBundleData(query) {
    let bundle = {};
    let {country_id} = this.state
    let all = [
      this._companiesModel.getList(query)
      .then(res => {
        bundle['data'] = [...res.items];
        bundle['count'] = res.totalItems;
        bundle['page'] = (query.page || 1) - 1;
      }),
      this._countryModel.getOptions()
        .then(data => (bundle['countries'] = [{name: '-- Chon --', id: null}].concat(data))),
      this._provinceModel.getOptions(country_id)
        .then(data => (bundle['provinces'] = [{name: '-- Chon --', id: null}].concat(data)))
    ]
    await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Kh???i t???o d??? li???u kh??ng th??nh c??ng (${err.message}).`)
        //,() => window.location.reload()
      ))
    ;

    //
    return bundle;
  }

  // get data
  getData = ( query = {} ) => {
    this.setState({ isLoading: true });
    return this._companiesModel.getList(query)
    .then(res => {
      let data = [...res.items];
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;

      this.setState({
        isLoading, data,
        count, page, query
      });
    });
  }

  handleClickAdd = () => {
    window._$g.rdr('/companies/add');
  }

  handleExport = () => {
    this._companiesModel.exportExcel()
    .then(response => {
      const configDate = moment().format("DDMMYYYY");
      fileDownload(response, `Company_${configDate}.csv`);
    })
    .catch((error) => {
      console.log(error)
    });
  }

  handleActionItemClick = (type, id, rowIndex) => {
    let routes = {
      detail: '/companies/details/',
      delete: '/companies/delete/',
      edit: '/companies/edit/',
    }
    const route = routes[type]
    if (route.match(/details|edit/i)) {
      window._$g.rdr(`${route}${id}`)
    } else {
      window._$g.dialogs.prompt(
        'B???n c?? ch???c ch???n mu???n x??a d??? li???u ??ang ch???n?',
        'X??a',
        (confirm) => this.handleDelete(confirm, id, rowIndex)
      )
    }
  }

  handleDelete = (confirm, id, rowIndex) => {
    const { data } = this.state
    if (confirm) {
      this._companiesModel.delete(id)
      .then(() => {
        const cloneData = [...data]
        cloneData.splice(rowIndex, 1)
        const count = cloneData.length
        this.setState({
          data: cloneData, count
        })
      })
      .catch((err) => {
        window._$g.dialogs.alert(
          window._$g._('B???n vui l??ng ch???n d??ng d??? li???u c???n thao t??c!' + err.message)
        )
      })
    }
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
      this._companiesModel.changeStatus(id, postData)
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
  handleChangeCountries = (countryId) => {
    if( countryId ){
      this._provinceModel.getOptions(countryId)
        .then(data => {
          const provinces = [{name: '-- Chon --', id: null},...data]
          const districts = [{name: '-- Chon --', id: null}]
          const wards = [{name: '-- Chon --', id: null}]
          this.setState({provinces, districts, wards})
        })
    }else {
      const provinces = [{name: '-- Chon --', id: null}]
      const districts = [{name: '-- Chon --', id: null}]
      const wards = [{name: '-- Chon --', id: null}]
      this.setState({provinces, districts, wards})
    }
  }

  handleChangeProvinces = (provinceId) => {
    if( provinceId ){
      this._districtModel.getOptions(provinceId)
        .then(data => {
          const districts = [{name: '-- Chon --', id: null}, ...data]
          const wards = [{name: '-- Chon --', id: null}]
          this.setState({districts, wards})
        })
    }else {
      const districts = [{name: '-- Chon --', id: null}]
      const wards = [{name: '-- Chon --', id: null}]
      this.setState({districts, wards})
    }
  }

  handleChangeDistricts  = (districtId) => {
    if( districtId ){
      this._wardModel.getOptions(districtId)
        .then(data => {
          const wards = [{name: '-- Chon --', id: null}, ...data]
          this.setState({wards})
        })
    }else {
      const wards = [{name: '-- Chon --', id: null}]
      this.setState({ wards})
    }
  }
  handleSubmitFilter = (search, country_id, province_id, district_id, ward_id, is_active) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {search, country_id, province_id, district_id, ward_id, is_active});
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
      configIDRowTable("company_id", "/companies/details/", this.state.query),
      {
        name: "company_name",
        label: "T??n c??ng ty",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "company_type_name",
        label: "Lo???i h??nh c??ng ty",
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
          sort: false
        }
      },
      {
        name: "email",
        label: "Email",
        options: {
          filter: false,
          sort: false
        }
      },
      {
        name: "address_full",
        label: "?????a ch???",
        options: {
          filter: false,
          sort: false
        }
      },
      {
        name: "bank_account_id",
        label: "S??? TK ng??n h??ng",
        options: {
          filter: false,
          sort: false
        }
      },
      {
        name: "bank_name",
        label: "T??n ng??n h??ng",
        options: {
          filter: false,
          sort: false
        }
      },

      {
        name: "is_active",
        label: "K??ch ho???t",
        options: {
          filter: true,
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
                <CheckAccess permission="AM_COMPANY_EDIT">
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
                      let checked = ((event.target.value*1) === 1 ? 0 : 1)
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].company_id, tableMeta['rowIndex'])
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
                <Button color="warning" title="Chi ti???t" className="mr-1" onClick={evt => this.handleActionItemClick('detail', this.state.data[tableMeta['rowIndex']].company_id, tableMeta['rowIndex'])}>
                  <i className="fa fa-info" />
                </Button>
                <CheckAccess permission="AM_COMPANY_EDIT">
                  <Button color="success" title="Ch???nh s???a" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].company_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="AM_COMPANY_DEL">
                  <Button color="danger" title="X??a" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].company_id, tableMeta['rowIndex'])}>
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
                <CompaniesFilter
                  handleChangeDistricts={this.handleChangeDistricts}
                  handleChangeProvinces={this.handleChangeProvinces}
                  handleChangeCountries={this.handleChangeCountries}
                  handleSubmit={this.handleSubmitFilter}
                  handleAdd={this.handleClickAdd}
                  countries={this.state.countries}
                  provinces={this.state.provinces}
                  districts={this.state.districts}
                  wards={this.state.wards}
                />
              </div>
            </CardBody>
          )}
        </Card>
        <div>
          <CheckAccess permission="AM_COMPANY_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Th??m m???i
            </Button>
          </CheckAccess>
          <CheckAccess permission="AM_COMPANY_EXPORT">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width" onClick={() => this.handleExport()} color="excel"  size="sm">
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
    );
  }
}

export default Companies;

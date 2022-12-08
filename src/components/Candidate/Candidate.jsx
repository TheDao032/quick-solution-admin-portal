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
import CandidateFilter from './CandidateFilter'
// Util(s)
import { layoutFullWidthHeight } from '../../utils/html'
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import CandidateModel from '../../models/CandidateModel'
import CompanyModel from '../../models/CompanyModel'
import BusinessModel from '../../models/BusinessModel';
import PositionModel from '../../models/PositionModel';
// Set layout full-wh
layoutFullWidthHeight()

/**
 * @class Users
 */
class Candidate extends Component {
  /**
   * @var {UserGroupModel}
   */
  _CandidateModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._candidateModel = new CandidateModel()
    this._companyModel = window._companyModel = new CompanyModel()
    this._businessModel = window._businessModel = new BusinessModel();
    this._positionModel = window._positionModel = new PositionModel();
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
      } = this.state;
      company = company.concat(bundle.company || []);
      business = business.concat(bundle.business || []);
      position = position.concat(bundle.position || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          business,
          company,
          position
        });
      })
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
    return this._candidateModel.getList(query)
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
    window._$g.rdr('/candidate/add');
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
      this._candidateModel.changeStatus(id, postData)
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
      detail: '/candidate/detail/',
      delete: '/candidate/delete/',
      edit: '/candidate/edit/',
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
      this._candidateModel.delete(id)
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

  handleSubmitFilter = (search, status, create_date_from, create_date_to, business_id, position_id) => {
    let query = {...this.state.query}
    query.page = 1;
    query = Object.assign(query, {create_date_from,create_date_to, business_id,position_id, status, search});
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
    this._candidateModel.exportExcel()
    .then(response => {
      const configDate = moment().format("DDMMYYYY");
      fileDownload(response, `Candidate_${configDate}.csv`);
    })
    .catch((error) => {
      console.log(error)
    });
  }

  render() {
    const columns = [
      configIDRowTable("candidate_id", "/candidate/detail/", this.state.query),
      {
        name: "candidate_full_name",
        label: "Tên ứng viên",
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
        }
      },
      {
        name: "birthday",
        label: "Ngày sinh ",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "communications",
        label: "Thông tin liên hệ",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "introduction",
        label: "Giới thiệu bản thân",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "recruit_title",
        label: "Tiêu đề tin tuyển dụng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "position_name",
        label: "Vị trí ứng tuyển",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "business_name",
        label: "Cơ sở",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "create_date",
        label: "Ngày ứng tuyển",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "status",
        label: "Trạng thái",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "hr_description",
        label: "Ghi chú ứng viên",
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
            return (
              <div className="text-center">
                <CheckAccess permission="HR_CANDIDATE_EDIT">
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
                      this.handleChangeStatus(checked, this.state.data[tableMeta['rowIndex']].candidate_id, tableMeta['rowIndex'])
                    }}
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
                <CheckAccess permission="HR_CANDIDATE_EDIT">
                  <Button color="success" title="Thông tin" className="mr-1" onClick={evt => this.handleActionItemClick('edit', this.state.data[tableMeta['rowIndex']].candidate_id, tableMeta['rowIndex'])}>
                    <i className="fa fa-edit" />
                  </Button>
                </CheckAccess>
                <CheckAccess permission="HR_CANDIDATE_DEL">
                  <Button color="danger" title="Xóa" className="" onClick={evt => this.handleActionItemClick('delete', this.state.data[tableMeta['rowIndex']].candidate_id, tableMeta['rowIndex'])}>
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
                <CandidateFilter
                  businessArr={this.state.business}
                  companyArr={this.state.company}
                  positionArr = {this.state.position}
                  handleSubmit={this.handleSubmitFilter}
                />
              </div>
            </CardBody>
          )}
        </Card>

        <div>
          <CheckAccess permission="HR_CANDIDATE_ADD">
            <Button className="col-12 max-w-110 mb-2 mobile-reset-width mr-2" onClick={() => this.handleClickAdd()} color="success" size="sm">
              <i className="fa fa-plus mr-1" />Thêm mới
            </Button>
          </CheckAccess>
          <CheckAccess permission="HR_CANDIDATE_EXPORT">
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

export default Candidate;

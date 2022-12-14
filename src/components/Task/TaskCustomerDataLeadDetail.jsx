import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Button, Col, Row } from 'reactstrap'
import moment from 'moment';

// Material
import MUIDataTable from 'mui-datatables'
import { CircularProgress } from '@material-ui/core'
import CustomPagination from '../../utils/CustomPagination'
import classnames from 'classnames';

// Component(s)
import TaskCustomerDataLeadDetailFilter from './TaskCustomerDataLeadDetailFilter'
import { CheckAccess } from '../../navigation/VerifyAccess'

// Util(s)
import { MOMENT_FORMAT_DATE } from '../../utils/html';
import { configTableOptions, configIDRowTable } from '../../utils/index'
// Model(s)
import TaskModel from "../../models/TaskModel";
import StatusDataLeadModel from "../../models/StatusDataLeadModel";

/**
 * @class TaskCustomerDataLeadDetail
 */
class TaskCustomerDataLeadDetail extends Component {
  _TaskModel

  constructor(props) {
    super(props)

    // Init model(s)
    this._TaskModel = new TaskModel();
    this._statusDataLeadModel = new StatusDataLeadModel();
    // Bind method(s)
  }

  state = {
    isLoading: false,
    page: 0,
    count: 1,
    data: [],
    taskDetail: {},
    query: {
      itemsPerPage: 25,
      page: 1,
      is_active: 2,
      task_id:this.props.match.params.id,
    },
  }

  componentDidMount() {
    // Get bundle data
    this.setState({ 
      isLoading: true,
    });
    (async () => {
      let bundle = await this._getBundleData();
      let { data, taskDetail } = bundle;
      let dataConfig = data ? data.items : []
      let isLoading = false;
      let count = data ? data.totalItems : 0
      let page = 0
      
      let {
        statusDataLeads = [],
      } = this.state;
      statusDataLeads = statusDataLeads.concat(bundle.statusDataLeads || []);
      //
      this.setState({
        isLoading
      }, () => {
        this.setState({
          data: dataConfig,
          statusDataLeads,
          count, page,
          taskDetail
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
      this._TaskModel.getDataLeads(this.state.query)
        .then(data => (bundle['data'] = data)),
      this._TaskModel.read(this.state.query.task_id)
        .then(data => (bundle['taskDetail'] = data)),
      this._statusDataLeadModel.getOptionsWonLost()
        .then(data => (bundle["statusDataLeads"] = data)),
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
    return this._TaskModel.getDataLeads(query)
    .then(res => {
      let data = res.items;
      let isLoading = false;
      let count = res.totalItems;
      let page = query['page'] - 1 || 0;

      this.setState({
        data, isLoading,
        count, page, query,
      })
    })
  }

  handleSubmitFilter = (
    search,
    birth_day_from,
    birth_day_to,
    country_id,
    province_id,
    district_id,
    ward_id,
    status,
  ) => {
    let query = {...this.state.query}
    // query.page = 1
    query = Object.assign(query, {
      search,
      birth_day_from,
      birth_day_to,
      country_id,
      province_id,
      district_id,
      ward_id,
      status,
    });
    this.getData(query)
    .catch(() => {
      window._$g.dialogs.alert(
        window._$g._('B???n vui l??ng ch???n d??ng d??? li???u c???n thao t??c!')
      )
    })
  }

  handleAdd = () => {
    this.props.handleAdd(this.state.customerSelect, this.state.query);
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
    const { taskDetail } = this.state;
    let link = "/task/customers/" + this.state.query.task_id + "/";

    if(taskDetail.end_date) {
      const date1 = moment();
      const date2 = moment(taskDetail.end_date, MOMENT_FORMAT_DATE);

      // if(date1 > date2 || taskDetail.is_completed){
      if(taskDetail.is_completed){
        link = null;
      }
    }

    const columns = [
      configIDRowTable("data_leads_id",link, this.state.query),
      {
        name: "data_leads_id",
        label: "M?? kh??ch h??ng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "full_name_customer",
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
            return (
              <div className="text-center">
                {value === 1 ? "Nam" :"N???"}
              </div>
            );
          }
        }
      },
      {
        name: "birth_day",
        label: "Nga??y sinh",
      },
      {
        name: "phone_number",
        label: "S??? ??i???n tho???i",
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
        name: "address_full",
        label: "?????a ch???",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "status_name",
        label: "Tra??ng tha??i kha??ch ha??ng",
        options: {
          filter: false,
          sort: false,
        }
      },
      {
        name: "status",
        options: {
          display: false,
        }
      },
      {
        name: "Thao t??c",
        options: {
          filter: false,
          sort: false,
          empty: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return link && (
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_VIEW">
                <div className="text-center">
                  <Button title="Chi ti???t" className="mr-1 btn-bg-transparent" onClick={()=>{window._$g.rdr(`/task/customers/${this.state.query.task_id}/${tableMeta.rowData[1]}`)}}>
                    <i className="fa fa-eye" />
                  </Button>
                </div>
              </CheckAccess>
            );
          }
        }
      },
    ]

    const {count, page, query} = this.state;
    let options = configTableOptions(count, page, query);
    options['setRowProps'] = (row,dataIndex) =>{
      return {
        className: classnames('MUIRow_bgColor-'+row[9])
      }
    };
    
    return (
      <div>
        <Card className="animated fadeIn z-index-222">
          <CardHeader className="d-flex">
            <div className="flex-fill font-weight-bold">
              Th??ng tin t??m ki???m
            </div>
          </CardHeader>
          <CardBody className="px-0 py-0" >
            <div className="MuiPaper-filter__custom z-index-2">
              <TaskCustomerDataLeadDetailFilter
                statusDataLeads={this.state.statusDataLeads}
                handleSubmit={this.handleSubmitFilter}
              />
            </div>
          </CardBody>
        </Card>
        <Row>
          <Col xs={12}>
            <CheckAccess permission="CRM_TASKDATALEAD_EXPORT">
              <Button className="col-12 max-w-110 mb-2 mobile-reset-width" color="excel"  size="sm">
                <i className="fa fa-download mr-1" />Xu???t excel
              </Button>
            </CheckAccess>
          </Col>
        </Row>
        <div className="MuiPaper-root__custom">
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
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

export default TaskCustomerDataLeadDetail

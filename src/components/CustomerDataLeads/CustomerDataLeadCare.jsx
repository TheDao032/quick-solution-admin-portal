import React, { PureComponent } from "react";
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  // Form,
  // FormGroup,
  Label,
  // Input,
  // FormText,
  // Media,
  // InputGroup,
  // InputGroupAddon,
  // InputGroupText,
  // CustomInput,
  Media,
} from "reactstrap";
import Select from 'react-select';

// Assets
import "./styles.scss";

// Component(s)
import Loading from '../Common/Loading';
import CustomerDataLeadCareComments from './CustomerDataLeadCareComments';
import CustomerDataLeadCareTools from './CustomerDataLeadCareTools';
import { CheckAccess } from "navigation/VerifyAccess";

// Util(s)
import { mapDataOptions4Select } from "utils/html";

// Model(s)
import CustomerDataLeadModel from "../../models/CustomerDataLeadModel";
import StatusDataLeadModel from "../../models/StatusDataLeadModel";
import TaskModel from "../../models/TaskModel";
import TaskTypeModel from "../../models/TaskTypeModel";

// @var UserEntity
const userAuth = window._$g.userAuth;

/**
 * @class CustomerDataLeadCare
 */
export default class CustomerDataLeadCare extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._taskModel = new TaskModel();
    this._taskTypeModel = new TaskTypeModel();
    this._statusDataLeadModel = new StatusDataLeadModel();

    // Bind method(s)
    this.handleChangeTaskWorkflow = this.handleChangeTaskWorkflow.bind(this);

    // Init state
    // +++
    // let { customerDataLeadEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Array} */
      statusDataLeads: [
        { "label" : "-- Chọn --", value: "" }
      ],
      /** @var {Object} */
      taskTypeEnt: null,
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let { _id } = this.state;
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, _id: (1 + _id), ready: true });
    })();
    //.end
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    let { /* customerDataLeadEnt, */taskEnt } = this.props;
    let bundle = {};
    let all = [
      this._statusDataLeadModel.getOptionsWonLost()
       .then(data => (bundle["statusDataLeads"] = mapDataOptions4Select(data))),
      this._taskTypeModel.read(taskEnt.task_type_id || -1)
        .then(data => (bundle["taskTypeEnt"] = data))
    ];
    all.length && await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ))
    ;
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = [stateValue[0]].concat(data).filter(_i => !!_i);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  handleChangeTaskWorkflow(item) {
    let { customerDataLeadEnt, taskEnt } = this.props;
    let { task_work_follow_id: task_workflow_id, is_complete } = item;
    let { task_id } = taskEnt;
    let { data_leads_id } = customerDataLeadEnt;
    let formData = {};
    //
    (async () => {
      let IS_WON_LOST = await new Promise((resolve) => {
        // Case: complete?
        if (!is_complete) {
          return resolve(null);
        }
        let { statusDataLeads } = this.state;
        let content = (
          <div className="clearfix">
            <p>
              <span className="d-block mb-1">Hoàn tất chăm sóc khách hàng?</span>
              <span className="d-block mb-1">Vui lòng chọn trạng thái đơn hàng để tiếp tục!</span>
            </p>
            <Label for="status_data_leads_id"><b>Trạng thái khách hàng:</b></Label>
            <Select
              id="status_data_leads_id"
              name="status_data_leads_id"
              onChange={(item) => {
                Object.assign(formData, { status_data_leads_id: item.id });
                // Hide buttons
                this._irefBtnMkOrder && (this._irefBtnMkOrder.hidden = true);
                this._irefBtnEnd && (this._irefBtnEnd.hidden = true);
                // Show button
                if (item.is_won) {
                  this._irefBtnMkOrder.hidden = false;
                }
                if (item.is_lost) {
                  this._irefBtnEnd.hidden = false;
                }
              }}
              isSearchable={true}
              placeholder={statusDataLeads[0].label}
              defaultValue={statusDataLeads[0]}
              options={statusDataLeads}
              isDisabled={item._isLoadingTaskWorkflow}
            />
            <small className="d-block alert alert-warning mt-1 p-1">Tính năng "tạo đơn hàng" đang được xây dựng!</small>
          </div>
        );
        window._$g.dialogs.prompt(
          content,
          'Chuyển bước xử lý',
          (result) => {
            let isMkOrder = (20 === result);
            let isEnd = (10 === result);
            if (!(isMkOrder || isEnd)) {
              return;
            }
            // is loading???
            if (item._isLoadingTaskWorkflow) {
              return false; // prevent close dialog
            }
            // Check form data
            if (!formData.status_data_leads_id) {
              window._$g.dialogs.alert('Vui lòng chọn trạng thái khách hàng!');
              return false; // prevent close dialog
            }

            // Case: tao don hang
            if (isMkOrder) {
              // @TODO: ...
            }
            // Case: ket thuc
            if (isEnd) {
              // @TODO: ...
            }

            // Call API
            this._customerDataLeadModel.update(
              data_leads_id,
              Object.assign(customerDataLeadEnt, formData)
            )
              .then(() => resolve(result))
            ;
          },
          {
            btnYesLabel: false,
            btnComponents: (btnComps, { handleClose }) => {
              // let { status_data_leads } = formData;
              btnComps.splice(btnComps.length - 1, 0, [
                <Button
                  innerRef={ref => { this._irefBtnMkOrder = ref; }}
                  hidden
                  key="btn-1th"
                  color="primary"
                  onClick={() => handleClose(20 /* TAO DON HANG */)}
                >
                  Tạo đơn hàng
                </Button>,
                <Button
                  innerRef={ref => { this._irefBtnEnd = ref; }}
                  hidden
                  key="btn-2nd"
                  color="success"
                  onClick={() => handleClose(10 /* KET THUC */)}
                >
                  Kết thúc
                </Button>
              ]);
            },
            propsDialog: {
              className: "no-overflow"
            }
          }
        );
      });

      // Mark is loading on
      Object.assign(item, { _isLoadingTaskWorkflow: true });
      // Re render
      this.forceUpdate();

      //
      let { status_data_leads_id } = formData;
      this._customerDataLeadModel.changeTaskWorkflow({
        task_workflow_id,
        task_id,
        data_leads_id,
        status_data_leads_id,
        IS_WON_LOST
      })
        .then(() => {
          //
          window._$g.toastr.show('Chuyển bước xử lý thành công.', 'success');
          // Update: current step
          let { taskEnt } = this.props;
          Object.assign(taskEnt._dataLeadsTask.current, {
            task_workflow_id
          });
        })
        .catch(err => window._$g.dialogs.alert(
          window._$g._(`Chuyển bước xử lý không thành công (${err.message}).`)
        ))
        .finally(() => {
          // Mark is loading off
          delete item._isLoadingTaskWorkflow;
          // Re render
          this.componentDidMount(); // this.forceUpdate();
        })
      ;
    })();
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      taskTypeEnt
    } = this.state;
    let { customerDataLeadEnt, taskEnt, noEdit } = this.props;
    let { _dataLeadsTask } = taskEnt;
    let { list_task_work_follow = [] } = taskTypeEnt || {};
    let { current: currentDataLeadsTask } = _dataLeadsTask;
    // Neu task_work_follow la buoc cuoi cung --> khong cho edit
    if (!noEdit && currentDataLeadsTask && list_task_work_follow.length) {
      let currentTaskWorkFollow = list_task_work_follow.find(item => {
        return ('' + item.task_work_follow_id === '' + currentDataLeadsTask.task_workflow_id);
      });
      if (currentTaskWorkFollow && currentTaskWorkFollow.is_complete) {
        noEdit = true;
      }
    }

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} id="cdl-care" className="animated fadeIn">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <b>Màn hình chi tiết chăm sóc khách hàng</b>
              </CardHeader>
              <CardBody>
                {/* general alerts */}
                {alerts.map(({ color, msg }, idx) => {
                  return (
                    <Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
                      <span dangerouslySetInnerHTML={{ __html: msg }} />
                    </Alert>
                  );
                })}
                <Row className="no-gutters">
                  <Col xs={12} className="cdl-arrows ps-relative">
                    <Button
                      className="cdl-arrow cdl-arrow-left"
                      size="lg"
                      color="primary"
                      disabled={!_dataLeadsTask.previous}
                      onClick={() => {
                        if (_dataLeadsTask.previous) {
                          let url = `/task/customers/${taskEnt.task_id}/${_dataLeadsTask.previous.data_leads_id}`;
                          return window._$g.rdr(url);
                        }
                      }}
                    >
                      <i className="fa fa-chevron-left" />
                    </Button>
                    <Button
                      className="cdl-arrow cdl-arrow-right"
                      size="lg"
                      color="primary"
                      disabled={!_dataLeadsTask.next}
                      onClick={() => {
                        if (_dataLeadsTask.next) {
                          let url = `/task/customers/${taskEnt.task_id}/${_dataLeadsTask.next.data_leads_id}`;
                          return window._$g.rdr(url);
                        }
                      }}
                    >
                      <i className="fa fa-chevron-right" />
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6}>
                    <h2>{customerDataLeadEnt.full_name}</h2>
                  </Col>
                  <Col xs={12} sm={6}>
                    <h4>{taskEnt.department_name}</h4>
                    <Media
                      object
                      src={userAuth.__proto__.constructor.defaultPictureUrlStatic(taskEnt.supervisor_default_picture_url)}
                      alt=""
                      className="user-imgage radius-50-percent"
                    />&nbsp;<span><b>[{taskEnt.supervisor_name}]</b> {taskEnt.supervisor_full_name}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className="d-flex mb-3 workflows">
                    {(() => {
                      let { task_workflow_id: curTskWrkflowId } = currentDataLeadsTask;
                      return list_task_work_follow.map((item, idx) => {
                        let { task_work_follow_id } = item;
                        let isCurTskWrkflow = (task_work_follow_id === curTskWrkflowId);
                        let html = (
                          <div key={`list_task_work_follow_${idx}`} className="p-1 mr-2">
                            <Button
                              color="link"
                              size="sm"
                              onClick={() => this.handleChangeTaskWorkflow(item)}
                              disabled={noEdit || isCurTskWrkflow}
                            >
                              <span
                                className={isCurTskWrkflow ? "text-danger font-weight-bold" : ""}
                              >
                                {item.task_work_follow_name}
                              </span>
                            </Button>
                          </div>
                        );
                        
                        return html;
                      });
                    })()}
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Row className="mb-3">
                      <Col xs={12}>
                        <b className="underline">Thông tin công việc</b>
                        <CheckAccess permission="CRM_TASK_EDIT">
                          <Button color="link" size="lg" onClick={() => window._$g.rdr(`/task/edit/${taskEnt.task_id}`)}>
                            <i className="fa fa-pencil-square-o" />
                          </Button>
                        </CheckAccess>
                      </Col>
                      <Col xs={12}>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Loại công việc:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{taskEnt.task_type_name}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Tên công việc:
                          </Label>
                          <Col xs={9}>
                            <CheckAccess permission="CRM_TASK_VIEW">
                            {(isYes) => {
                              return (
                                <Button color="link" className="underline pl-0" onClick={!isYes ? undefined : () => window._$g.rdr(`/task/detail/${taskEnt.task_id}`)}>
                                  {taskEnt.task_name}
                                </Button>
                              );
                            }}
                            </CheckAccess>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3} sm={3}>
                            Ngày bắt đầu
                          </Label>
                          <Col xs={9} sm={3}>
                            <div className="pt-2">{taskEnt.start_date}</div>
                          </Col>
                          <Label for="task_type_name" xs={3} sm={3}>
                            Ngày kết thúc
                          </Label>
                          <Col xs={9} sm={3}>
                            <div className="pt-2">{taskEnt.end_date}</div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={12}>
                        <b className="underline">Thông tin khách hàng</b>
                        <CheckAccess permission="CRM_CUSDATALEADS_EDIT">
                          <Button color="link" size="lg" onClick={() => window._$g.rdr(`/customer-data-leads/edit/${customerDataLeadEnt.data_leads_id}`)}>
                            <i className="fa fa-pencil-square-o" />
                          </Button>
                        </CheckAccess>
                      </Col>
                      <Col xs={12}>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Mã khách hàng:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.data_leads_id}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Tên khách hàng:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.full_name}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Ngày sinh:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.birthday}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Giới tính:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">
                              {'0' === '' + customerDataLeadEnt.gender ? 'Nam' : ''}
                              {'1' === '' + customerDataLeadEnt.gender ? 'Nữ' : ''}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Email:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.email}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Địa chỉ:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.address_full}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Số điện thoại:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.phone_number}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Số CMND:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{customerDataLeadEnt.id_card}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Phân khúc khách hàng:
                          </Label>
                          <Col xs={9}>
                            <div className="pt-2">{(customerDataLeadEnt.segment_name || []).join(', ')}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Label for="task_type_name" xs={3}>
                            Chiến dịch:
                          </Label>
                          <Col xs={9}>
                            <CheckAccess permission="CRM_CAMPAIGN_VIEW">
                            {(isYes) => {
                              return (
                                <Button color="link" className="underline pl-0" onClick={!isYes ? undefined : () => window._$g.rdr(`/campaigns/details/${customerDataLeadEnt.campaign_id}`)}>
                                  {customerDataLeadEnt.campaign_name}
                                </Button>
                              );
                            }}
                            </CheckAccess>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={12}>
                        <b className="underline">Nhân viên xử lý</b>
                      </Col>
                      <Col xs={12}>
                        <Row className="p-3">
                          <Media
                            object
                            src={userAuth.__proto__.constructor.defaultPictureUrlStatic(taskEnt.default_picture_url)}
                            alt=""
                            className="user-imgage radius-50-percent"
                          />
                          <CheckAccess permission="SYS_USER_VIEW">
                          {(isYes) => {
                            return (
                              <Button color="link" className="underline ml-1 p-0" onClick={!isYes ? undefined : () => window._$g.rdr(`/users/detail/${taskEnt.user_id}`)}>
                                <b>[{taskEnt.user_name}]</b> {taskEnt.full_name}
                              </Button>
                            );
                          }}
                          </CheckAccess>
                        </Row>
                      </Col>
                    </Row>
                    <CustomerDataLeadCareComments
                      customerDataLeadEnt={customerDataLeadEnt}
                      taskEnt={taskEnt}
                      noEdit={noEdit}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Row className="mb-3">
                      <Col xs={12}>
                        <b className="underline">Chăm sóc khách hàng</b>
                      </Col>
                      <Col xs={12} className="py-3">
                        <CustomerDataLeadCareTools
                          customerDataLeadEnt={customerDataLeadEnt}
                          taskEnt={taskEnt}
                          noEdit={noEdit}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} className="mt-2">
                    <Row>
                      <Col sm={12} className="text-right">
                        <Button disabled={false} onClick={this.props.handleActionClose || (() => window._$g.rdr(`/task/customers/${taskEnt.task_id}`))} className="btn-block-sm mt-md-0 mt-sm-2">
                          <i className="fa fa-times-circle mr-1" />Đóng
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

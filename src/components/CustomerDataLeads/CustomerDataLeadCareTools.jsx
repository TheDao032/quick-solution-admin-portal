import React, { PureComponent } from "react";
import {
  Alert,
  Col,
  Row,
  Button,
  Media,
  Nav,
  NavItem,
  NavLink,
  TabPane,
  TabContent,
  Label
} from "reactstrap";

// Assets
import "./styles.scss";

// Component(s)
import Loading from '../Common/Loading';
import { CheckAccess } from '../../navigation/VerifyAccess'
import CustomerDataLeadCareToolsSms from './CustomerDataLeadCareTools/Sms';
import CustomerDataLeadCareToolsCall from './CustomerDataLeadCareTools/Call';
import CustomerDataLeadCareToolsMeeting from './CustomerDataLeadCareTools/Meeting';
import CustomerDataLeadCareToolsEmail from './CustomerDataLeadCareTools/Email';

// Util(s)
// import * as utils from '../../utils';

// Model(s)
import UserModel from "../../models/UserModel";
import CustomerDataLeadModel from "../../models/CustomerDataLeadModel";
import DataLeadsHistoryModel from "../../models/DataLeadsHistoryModel";
import DataLeadsCallModel from "../../models/DataLeadsCallModel";

/**
 * @class CustomerDataLeadCareTools
 */
export default class CustomerDataLeadCareTools extends PureComponent {

  /** @var {Object} */
  formikProps = null;

  constructor(props) {
    super(props);

    // Init model(s)
    this._userModel = new UserModel();
    this._customerDataLeadModel = new CustomerDataLeadModel();
    this._dataLeadHistoryModel = new DataLeadsHistoryModel();
    this._dataLeadCallModel = new DataLeadsCallModel();

    // Bind method(s)
    this.toggleTab = this.toggleTab.bind(this);

    // Init state
    // +++
    // let { customerDataLeadEnt } = props;
    // +++
    this.state = {
      /** @var {Number} */
      _id: 0,
      /** @var {Boolean} */
      ready: true,
      /** @var {Array} */
      alerts: [],
      /** @var {Boolean} */
      activeTab: null,
      /** @var {Array} */
      callTypeIds: this._dataLeadCallModel._entity.getCallTypesIdOpts(),
      /** @var {Array} */
      history: {
        items: null,
        itemsPerPage: 25,
        page: 1,
        totalItems: 0,
        totalPages: 0
      },
    };
  }

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
    // Active tab
    this._dataActiveTabs[0] && this.toggleTab(this._dataActiveTabs[0]);
  }

  /**
   * 
   * @return {Object}
   */
  getInitialValues(type) {
    // let { customerDataLeadEnt } = this.props;
    let values = Object.assign({}, {});
    // Format
    Object.keys(values).forEach(key => {
      if (null === values[key]) {
        values[key] = "";
      }
    });

    // Return;
    return values;
  }

  _getBundleDataHistory(skipSetState) {
    let { customerDataLeadEnt, taskEnt } = this.props;
    let { history: { page, itemsPerPage } } = this.state;
    let data = { page, itemsPerPage };
    return this._dataLeadHistoryModel.getList(Object.assign(data, {
      data_leads_id: customerDataLeadEnt.data_leads_id,
      task_id: taskEnt.task_id,
    }))
      .then(history => {
        !skipSetState && this.setState({ history });
        return history;
      });
  }

  /**
   * Goi API, lay toan bo data lien quan,...
   */
  async _getBundleData() {
    // let { customerDataLeadEnt } = this.props;
    let bundle = {};
    let all = [
      this._getBundleDataHistory(true)
        .then(data => (bundle["history"] = data)),
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

  /** @var {Array} */
  _dataActiveTabs = [];

  toggleTab(activeTab) {
    this.setState({ activeTab });
  }

  handleCareToolsFormikSubmitDone = () => {
    // Refresh history
    this._getBundleDataHistory();
  }

  render() {
    let {
      _id,
      ready,
      alerts,
      callTypeIds,
      history,
    } = this.state;
    let { customerDataLeadEnt, taskEnt, noEdit } = this.props;

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div key={`view-${_id}`} className="animated fadeIn">
        {/* general alerts */}
        {alerts.map(({ color, msg }, idx) => {
          return (
            <Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
              <span dangerouslySetInnerHTML={{ __html: msg }} />
            </Alert>
          );
        })}
        <CheckAccess permission={[
          "CRM_CUSDATALEADSDETAIL_SENDSMS",
          "CRM_CUSDATALEADSDETAIL_CALL",
          "CRM_CUSDATALEADSDETAIL_MEETING",
          "CRM_CUSDATALEADSDETAIL_SENDEMAIL",
        ]}>
          <Row><Col xs={12}>
            <Nav tabs>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_SENDSMS">
              {((isYes) => {
                return (isYes && this._dataActiveTabs.push('sms')) ? (
                  <NavItem>
                    <NavLink className={`${this.state.activeTab === 'sms' ? 'active' : ''}`} onClick={() => this.toggleTab('sms')}>SMS</NavLink>
                  </NavItem>
                ) : null;
              })}
              </CheckAccess>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_CALL">
              {((isYes) => {
                return (isYes && this._dataActiveTabs.push('call')) ? (
                  <NavItem>
                    <NavLink className={`${this.state.activeTab === 'call' ? 'active' : ''}`} onClick={() => this.toggleTab('call')}>Call</NavLink>
                  </NavItem>
                ) : null;
              })}
              </CheckAccess>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_MEETING">
              {((isYes) => {
                return (isYes && this._dataActiveTabs.push('meeting')) ? (
                  <NavItem>
                    <NavLink className={`${this.state.activeTab === 'meeting' ? 'active' : ''}`} onClick={() => this.toggleTab('meeting')}>Lịch hẹn</NavLink>
                  </NavItem>
                ) : null;
              })}
              </CheckAccess>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_SENDEMAIL">
              {((isYes) => {
                return (isYes && this._dataActiveTabs.push('email')) ? (
                  <NavItem>
                    <NavLink className={`${this.state.activeTab === 'email' ? 'active' : ''}`} onClick={() => this.toggleTab('email')}>Email</NavLink>
                  </NavItem>
                ) : null;
              })}
              </CheckAccess>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_SENDSMS">
                <TabPane tabId="sms">
                  <Row>
                    <Col sm="12">
                      <CustomerDataLeadCareToolsSms
                        customerDataLeadEnt={customerDataLeadEnt}
                        taskEnt={taskEnt}
                        noEdit={noEdit}
                        handleFormikSubmitDone={this.handleCareToolsFormikSubmitDone}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </CheckAccess>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_CALL">
                <TabPane tabId="call">
                  <Row>
                    <Col sm="12">
                      <CustomerDataLeadCareToolsCall
                        customerDataLeadEnt={customerDataLeadEnt}
                        taskEnt={taskEnt}
                        noEdit={noEdit}
                        handleFormikSubmitDone={this.handleCareToolsFormikSubmitDone}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </CheckAccess>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_MEETING">
                <TabPane tabId="meeting">
                  <Row>
                    <Col sm="12">
                      <CustomerDataLeadCareToolsMeeting
                        customerDataLeadEnt={customerDataLeadEnt}
                        taskEnt={taskEnt}
                        noEdit={noEdit}
                        handleFormikSubmitDone={this.handleCareToolsFormikSubmitDone}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </CheckAccess>
              <CheckAccess permission="CRM_CUSDATALEADSDETAIL_SENDEMAIL">
                <TabPane tabId="email">
                  <Row>
                    <Col sm="12">
                      <CustomerDataLeadCareToolsEmail
                        customerDataLeadEnt={customerDataLeadEnt}
                        taskEnt={taskEnt}
                        noEdit={noEdit}
                        handleFormikSubmitDone={this.handleCareToolsFormikSubmitDone}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </CheckAccess>
            </TabContent>
            <CheckAccess permission="CRM_CUSDATALEADSDETAIL_HISTORY">
              <div className="history-box clearfix">
                <div className="history-box-label p-1">
                  <h4 className="underline">Lịch sử</h4>
                </div>
                <div className="history-box-body p-2">
                {(() => {
                  let { items } = (history || {});
                  if (null === items) {
                    return <Loading />;
                  }
                  return items.map((item, idx) => {
                    let { expanded_content: expContent } = item;
                    let { file_attactments = [] } = expContent || {};
                    let statusText = "";
                    let statusContent = "";
                    if (item.data_leads_sms_id) {
                      statusText = "Sms";
                      statusContent = (
                        <blockquote className="blockquote p-2 m-0">
                          <span className="d-block"><Label>Nội dung:</Label> {expContent.content_sms}</span>
                        </blockquote>
                      );
                    } else if (item.data_leads_call_id) {
                      statusText = "Call";
                      statusContent = (
                        <blockquote className="blockquote p-2 m-0">
                          <span className="d-block">
                            <Label>Loại:</Label> {(callTypeIds.find(item => ('' + item.id === '' + expContent.call_type_id)) || {}).name}
                          </span>
                          <span className="d-block"><Label>Bắt đầu:</Label> {expContent.event_start_date_time}</span>
                          <span className="d-block"><Label>Kết thúc:</Label> {expContent.event_end_date_time}</span>
                          <span className="d-block"><Label>Thời gian gọi:</Label> {expContent.duration}phút</span>
                          <span className="d-block"><Label>Chủ đề:</Label> {expContent.subject}</span>
                          <span className="d-block"><Label>Mô tả:</Label> {expContent.description}</span>
                        </blockquote>
                      );
                    } else if (item.data_leads_mail_id) {
                      statusText = "Email";
                      statusContent = (
                        <blockquote className="blockquote p-2 m-0">
                          <span className="d-block"><Label>Chiến dịch:</Label> {expContent.campaign_name}</span>
                          <span className="d-block"><Label>Phân khúc:</Label> {expContent.list_name}</span>
                          <span className="d-block"><Label>Gửi từ:</Label> {expContent.sender_email}</span>
                          <span className="d-block"><Label>Trạng thái chiến dịch:</Label> {expContent.status}</span>
                        </blockquote>
                      );
                    } else if (item.data_leads_meeting_id) {
                      statusText = "Lịch hẹn";
                      statusContent = (
                        <blockquote className="blockquote p-2 m-0">
                          <span className="d-block"><Label>Bắt đầu:</Label> {expContent.event_start_date_time}</span>
                          <span className="d-block"><Label>Kết thúc:</Label> {expContent.event_end_date_time}</span>
                          <span className="d-block"><Label>Nội dung:</Label> {expContent.content_meeting}</span>
                          <span className="d-block"><Label>Địa chỉ:</Label> {expContent.location}</span>
                        </blockquote>
                      );
                    } else {
                      statusText = "Status changed";
                      statusContent = (<span size="sm" className="p-1 alert-primary">{item.task_workflow_name}</span>);
                    }
                    return (
                      <div key={`history_${idx}`} className="history-item clearfix pb-2 mb-2">
                        <div className="history-item-left pull-left">
                          <h4>
                            <b>{statusText}</b> <small>{item.created_date} [{item.created_user_full_name}]</small>
                          </h4>
                          <div className="history-body">
                            {item.task_workflow_old_name ? (<span>
                              <span className="mr-2 p-1 alert-secondary">{item.task_workflow_old_name}</span>
                              <i className="fa fa-arrow-right mr-2" />
                            </span>) : null}
                            {statusContent}
                          </div>
                          <div className="clearfix">
                            {file_attactments ? (<div className="pt-2">{
                              file_attactments.map((attach, idx) => (
                                <a
                                  key={`attach_${idx}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={attach.attachment_path || "#"}
                                  className="d-inline-block"
                                >
                                  <i className="fa fa-file" /> {attach.attachment_name}
                                </a>
                              ))
                            }</div>) : null}
                          </div>
                        </div>
                        <div className="history-item-right ml-2 pull-right">
                          <Media object src={item.created_user_default_picture_url} alt="" className="user-imgage radius-50-percent" />
                        </div>
                      </div>
                    );
                  })
                })()}
                </div>
                <div className="history-box-footer text-right p-2">
                {(() => {
                  let {
                    // itemsPerPage,
                    // totalItems,
                    items,
                    page,
                    totalPages
                  } = (history || {});
                  let minPage = 1;
                  let maxPage = Math.max(minPage, totalPages);
                  return (
                    <div className="">
                      {page}/{maxPage}
                      <Button
                        color="primary"
                        size="sm"
                        className="ml-2"
                        disabled={1 * page <= minPage || (null === items)}
                        onClick={() => {
                          page = Math.max(minPage, (1 * page) - 1);
                          this.setState(
                            { history: { ...history, page, items: null } },
                            () => this._getBundleDataHistory()
                          );
                        }}
                      >
                        <i className="fa fa-arrow-left" />
                      </Button>
                      <Button
                        color="primary"
                        size="sm"
                        className="ml-2"
                        disabled={1 * page >= maxPage || (null === items)}
                        onClick={() => {
                          page = Math.min(maxPage, (1 * page) + 1);
                          this.setState(
                            { history: { ...history, page, items: null } },
                            () => this._getBundleDataHistory()
                          );
                        }}
                      >
                        <i className="fa fa-arrow-right" />
                      </Button>
                    </div>
                  );
                })()}
                </div>
              </div>
            </CheckAccess>
          </Col></Row>
        </CheckAccess>
      </div>
    );
  }
}

import React, { PureComponent } from 'react'
import {
  // CustomInput,
  Alert,
  Row,
  Card,
  Col,
  // CardHeader,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  // Input
} from 'reactstrap'
import Select from 'react-select';

// Component(s)
import Loading from '../Common/Loading';
import Table from './Table';

// Util(s)
import { mapDataOptions4Select } from '../../utils/html';

// Model(s)
import UserGroupModel from '../../models/UserGroupModel';
import FunctionGroupModel from "../../models/FunctionGroupModel";
import FunctionModel from "../../models/FunctionModel";
import PermissionModel from "../../models/PermissionModel";

// Assets
import './styles.scss';

/**
 * @class Permissions
 */
export default class Permissions extends PureComponent {

  /** @var {Object} */
  formikProps = null;
  
  constructor(props) {
    super(props);

    // Bind method(s)
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClickFunctionGroup = this.handleClickFunctionGroup.bind(this);
    this.handleClickCheckAll = this.handleClickCheckAll.bind(this);
    this.handleClickCheck = this.handleClickCheck.bind(this);

    // Init model(s)
    this._userGroupModel = new UserGroupModel();
    this._functionGroupModel = new FunctionGroupModel();
    this._functionModel = new FunctionModel();
    this._permissionModel = new PermissionModel();

    // Init state
    this.state = {
      /** @var {Boolean} */
      ready: false,
      /** @var {Boolean} */
      isSubmitting: false,
      /** @var {Array} */
      alerts: [],
      /** @var {Array} */
      userGroups: [],
      /** @var {Array} */
      functionGroups: [],
      /** @var {Array} */
      functions: []
    };
  }

  /** @var {Array} */
  _dataUserGroupOpts = [];

  /** @var {Object} */
  _dataIdStrObj = {
    'func_group': '',
    'user_group': '',
  };

  /** @var {Array} */
  _dataFuncGroupOpts = [];

  componentDidMount() {
    // Get bundle data --> ready data
    (async () => {
      let bundle = await this._getBundleData();
      this.setState({ ...bundle, ready: true });
    })();
    //.end
  }

  /** @var {Object} */
  formikValidationSchema = {};

  /**
   * 
   * @return {Object}
   */
  getInitialValues() {
    let values = {};

    // Format
    // Object.keys(values).forEach(key => {});

    // Return;
    return values;
  }

  /**
   * Goi API, lay toan bo data lien quan, vd: chuc vu, phong ban, dia chi,...
   */
  async _getBundleData() {
    let bundle = {};
    let all = [
      this._userGroupModel.getOptions({ is_active: 1 })
        .then(userGroups => {
          this._dataUserGroupOpts = mapDataOptions4Select(userGroups);
          Object.assign(bundle, { userGroups });
        }),
      this._permissionModel.getListFunctionGroups({
          itemsPerPage: PermissionModel._MAX_ITEMS_PER_PAGE
        })
        .then(({ items: functionGroups = [] }) => {
          let funcGroupOpts = functionGroups.map(
            ({ function_group_id: value, function_group_name: label }) => ({ value, label })
          );
          this._dataFuncGroupOpts = funcGroupOpts;
          Object.assign(bundle, { functionGroups });
        }),
      // this._functionGroupModel.getOptions().then(data => (bundle['functionGroups'] = data)),
    ];
    await Promise.all(all)
      .catch(err => window._$g.dialogs.alert(
        window._$g._(`Khởi tạo dữ liệu không thành công (${err.message}).`),
        () => window.location.reload()
      ))
    ;

    // Loop, format function_groups data and get details,...
    let { functionGroups = [] } = bundle;
    if (functionGroups.length) {
      let all2nd = [];
      functionGroups.forEach((functionGroup) => {
        let { function_group_id, user_groups = [] } = functionGroup;

        // Init
        Object.assign(functionGroup, {
          _functions: undefined,
          _isOpen: false
        });

        //
        for (let i = 0; i < user_groups.length; i++) {
          let userGroup = user_groups[i];
          if (userGroup && !!userGroup.has_permission) {
            all2nd.push(
              this._permissionModel.getListFunctionsByFunctionGroup(function_group_id)
              .then(({ items = [] }) => {
                Object.assign(functionGroup, {
                  _functions: (functionGroup._functions || []).concat(items),
                  _isOpen: true
                });
                return items;
              })
            );
            break;
          }
        }
      });
      await Promise.all(all2nd)
        .catch(err => window._$g.dialogs.alert(
          window._$g._(`Khởi tạo dữ liệu (2) không thành công (${err.message}).`),
          () => window.location.reload()
        ))
      ;
    }
    //.end
    //
    Object.keys(bundle).forEach((key) => {
      let data = bundle[key];
      let stateValue = this.state[key];
      if (data instanceof Array && stateValue instanceof Array) {
        data = data.concat([]);
      }
      bundle[key] = data;
    });
    // console.log('bundle: ', bundle);
    //
    return bundle;
  }

  handleFormSubmit(evt) {
    evt.preventDefault();
    //
    let { alerts } = this.state;
    let { userGroups, functionGroups } = this.state;

    // Set state, form is submitting,...
    this.setState({ isSubmitting: true });

    // Init, format form data,...
    let formData = {};
    // +++
    functionGroups.forEach(functionGroup => {
      let { function_group_id, user_groups = [], _functions } = functionGroup;
      // Case: unload functions
      if (!_functions) { return; }
      //
      userGroups.forEach(({ id: userGroupId }) => {
        //
        let foundUserGroup = user_groups.find(item => ('' + item.user_group_id) === ('' + userGroupId));
        //
        let formItem = formData[userGroupId];
        if (!formItem) {
          formData[userGroupId] = (formItem = {
            user_group_id: userGroupId,
            function_group_ids: []
          });
        }
        let { function_group_ids } = formItem;
        //
        function_group_ids.push({
          function_group_id,
          has_permission: !!(foundUserGroup && foundUserGroup.has_permission),
          function_ids: _functions
            .map(_function => {
              let functionUserGroups = _function.user_groups || [];
              let foundUserGroup = functionUserGroups.find(item => ('' + item.user_group_id) === ('' + userGroupId));
              if (foundUserGroup && foundUserGroup.has_permission) {
                return _function.function_id;
              }
              return null;
            })
            .filter(function_id => !!function_id)
        });
        Object.assign(formItem, { function_group_ids });
      });
    });
    formData = Object.values(formData);
    // console.log('handleFormSubmit#functionGroups: ', functionGroups);
    // console.log('handleFormSubmit#formData: ', formData);
    // Call API, set data
    this._permissionModel.postUserGroupFunction(formData)
      .then(data => { // OK
        window._$g.toastr.show('Lưu thành công!', 'success');
      })
      .catch(apiData => { // NG
        let { message } = apiData;
        let msg = [`<b>${message}</b>`];
        alerts.push({ color: "danger", msg });
      })
      .finally(() => {
        // Submit form is done!
        this.setState({ alerts, isSubmitting: false });
      });
  }

  handleClickFunctionGroup(functionGroup) {
    let { functionGroups } = this.state;
    let foundIdx = functionGroups.findIndex(item  => item === functionGroup);
    if (foundIdx >= 0) {
      let { function_group_id, _functions, _isOpen } = functionGroup;
      Object.assign(functionGroup, {
        _isOpen: _functions ? !_isOpen : null
      });
      this.setState({ functionGroups: [].concat(functionGroups) });
      // Load details
      if (!(_functions instanceof Array)) {
        this._permissionModel.getListFunctionsByFunctionGroup(function_group_id)
        .then(({ items = [] }) => {
          Object.assign(functionGroup, {
            _functions: (functionGroup._functions || []).concat(items),
            _isOpen: true
          });
          this.setState(({ functionGroups }) => ({
            functionGroups: [].concat(functionGroups)
          }));
          return items;
        })
      }
      //.end
    }
  }

  handleClickCheckAll(functionGroup, userGroup) {
    let { functionGroups } = this.state;
    let user_group_id = userGroup.id;
    let foundIdx = functionGroups.findIndex(item  => item === functionGroup);
    if (foundIdx < 0) {
      return;
    }
    let { function_group_id, user_groups = [], _functions } = functionGroup;
    let foundUserGroup = user_groups.find(item => ('' + user_group_id) === ('' + item.user_group_id));
    // Add/Edit `UserGroup`
    if (!foundUserGroup) {
      user_groups.push(foundUserGroup = { user_group_id, has_permission: false });
      Object.assign(functionGroup, { user_groups });
    }
    let { has_permission } = foundUserGroup;
    has_permission = !has_permission;
    Object.assign(foundUserGroup, { has_permission });
    //.end

    // Add/Edit `Function`
    // +++ Check/Uncheck all functions by functionGroup
    const checkUncheckAllFunctions = () => {
      let { _functions } = functionGroup;
      (_functions || []).forEach(_function => {
        let { function_id, user_groups = [] } = _function;
        let foundUserGroup = user_groups.find(item => ('' + user_group_id) === ('' + item.user_group_id));
        if (!foundUserGroup) {
          user_groups.push(foundUserGroup = { function_id, user_group_id, has_permission });
          Object.assign(_function, { user_groups });
        }
        Object.assign(foundUserGroup, { has_permission });
      });
      // 
      this.setState({ functionGroups: [].concat(functionGroups) });
    };
    // +++ load data?!
    if (!(_functions instanceof Array)) {
      Object.assign(functionGroup, { _isOpen: null });
      this._permissionModel.getListFunctionsByFunctionGroup(function_group_id)
        .then(({ items = [] }) => {
          Object.assign(functionGroup, {
            _functions: (functionGroup._functions || []).concat(items),
            _isOpen: true
          });
          return checkUncheckAllFunctions() || _functions;
        });
    }
    //
    checkUncheckAllFunctions();
  }

  handleClickCheck(functionGroup, _function, userGroup) {
    let { functionGroups } = this.state;
    let foundIdx = functionGroups.findIndex(item => item === functionGroup);
    if (foundIdx < 0) {
      return;
    }
    let { _functions = [] } = functionGroup;
    foundIdx = _functions.findIndex(item => ('' + _function.function_id) === ('' + item.function_id));
    if (foundIdx < 0) {
      return;
    }
    let { function_id, user_groups = [] } = _function;
    let foundUserGroup = user_groups.find(item => ('' + userGroup.id) === ('' + item.user_group_id));
    if (!foundUserGroup) {
      user_groups.push(foundUserGroup = {
        function_id,
        user_group_id: userGroup.id,
        has_permission: false,
      });
      Object.assign(_function, { user_groups });
    }
    let { has_permission } = foundUserGroup;
    has_permission = !has_permission;
    Object.assign(foundUserGroup, { has_permission });
    // Check/Uncheck all
    let checkCount = 0;
    _functions.forEach(({ user_groups = [] }) => {
      let foundUserGroup = user_groups.find(item => ('' + userGroup.id) === ('' + item.user_group_id));
      if (foundUserGroup && !!foundUserGroup.has_permission) {
        checkCount++;
      }
    });
    (functionGroup.user_groups || []).forEach((user_group) => {
      let { user_group_id } = user_group;
      if (('' + user_group_id) === ('' + userGroup.id)) {
        Object.assign(user_group, { has_permission: 1  * (checkCount === _functions.length) });
      }
    });
    //.end
    this.setState({ functionGroups: [].concat(functionGroups) });
  }

  handleFilterSelectMulti = (type, valuesItem) => {
    let items = (valuesItem instanceof Array) ? valuesItem : [valuesItem];
    let idStr = items.filter(_i => !!_i).map(_i => _i.value).join();
    this._dataIdStrObj[type] = idStr = idStr ? `,${idStr},` : '';
  }

  handleSubmitFilter = (evt) => {
    evt.preventDefault();
    // Re render
    this.forceUpdate();
  }

  handleResetFilter = (evt) => {
    evt.preventDefault();
    // Clear data
    this._filterSelectFuncGroup.select.clearValue();
    this._filterSelectUserGroup.select.clearValue();
    this._dataIdStrObj = {
      'func_group': '',
      'user_group': '',
    };
    // Re render
    this.forceUpdate();
  }

  _getFiltUserGroupsState = () => {
    let { userGroups = [] } = this.state;
    let result = userGroups, idStr = this._dataIdStrObj['user_group'];
    if (userGroups.length && idStr) {
      result = userGroups.filter(({ id }) => (idStr.indexOf(`,${id},`) >= 0));
    }
    return result;
  }

  _getFiltFuncGroupsState = () => {
    let { functionGroups = [] } = this.state;
    let result = functionGroups, idStr = this._dataIdStrObj['func_group'];
    if (functionGroups.length && idStr) {
      result = functionGroups.filter(({ function_group_id: id }) => (idStr.indexOf(`,${id},`) >= 0));
    }
    return result;
  }

  render() {
    let {
      ready,
      alerts,
      isSubmitting,
    } = this.state;
    let userGroups = this._getFiltUserGroupsState();
    let functionGroups = this._getFiltFuncGroupsState();

    // Ready?
    if (!ready) {
      return <Loading />;
    }

    return (
      <div id="permissions-div" className="animated fadeIn">
        <Card className="m-0">
          <CardBody className="px-0 py-0">
            <Row>
              <Col xs={12} className="">
              {/* general alerts */}
              {alerts.map(({ color, msg }, idx) => {
                return (
                  <Alert key={`alert-${idx}`} color={color} isOpen={true} toggle={() => this.setState({ alerts: [] })}>
                    <span dangerouslySetInnerHTML={{ __html: msg }} />
                  </Alert>
                );
              })}
              </Col>
            </Row>
            <Form id="form1st" onSubmit={this.handleFormSubmit}>
              <FormGroup row className="p-2">
                <Col xs={12} sm={4} className="custom-zIndex-Select">
                  <Label for="" className="font-weight-bold">Nhóm quyền:</Label>
                  {(() => {
                    return (
                      <Select
                        ref={ref => { this._filterSelectFuncGroup = ref; }}
                        isMulti
                        isSearchable
                        placeholder={"-- Chọn --"}
                        onChange={(valuesItem/*, actionItem*/) => this.handleFilterSelectMulti('func_group', valuesItem)}
                        value={this.state.functionGroup}
                        // defaultValue={}
                        options={this._dataFuncGroupOpts}
                      />
                    );
                  })()}
                </Col>
                <Col xs={12} sm={4} className="custom-zIndex-Select">
                  <Label for="" className="font-weight-bold">Nhóm người dùng:</Label>
                  {(() => {
                    return (
                      <Select
                        ref={ref => { this._filterSelectUserGroup = ref; }}
                        isMulti
                        isSearchable
                        placeholder={"-- Chọn --"}
                        onChange={(valuesItem/*, actionItem*/) => this.handleFilterSelectMulti('user_group', valuesItem)}
                        value={this.state.userGroup}
                        // defaultValue={}
                        options={this._dataUserGroupOpts}
                      />
                    );
                  })()}
                </Col>
                <Col xs={12} sm={4} className="text-right">
                  <Label for="" className="font-weight-bold">&nbsp;</Label>
                  <div>
                    <Button
                      color="info"
                      size="sm"
                      className="ml-2 mb-2"
                      disabled={isSubmitting}
                      onClick={this.handleSubmitFilter}
                    >
                      <i className="fa fa-search" /><span className="ml-1">Tìm kiếm</span>
                    </Button>
                    <Button
                      size="sm"
                      className="ml-2 mb-2"
                      disabled={isSubmitting}
                      onClick={this.handleResetFilter}
                    >
                      <i className="fa fa-refresh" /><span className="ml-1">Làm mới</span>
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      type="submit"
                      className="ml-2 mb-2"
                      disabled={isSubmitting}
                    >
                      <i className="fa fa-edit" /><span className="ml-1">Lưu thông tin</span>
                    </Button>
                  </div>
                </Col>
              </FormGroup>
              <div className="MuiPaper-root__role tableFixHead">
                <Table
                  userGroups={userGroups}
                  functionGroups={functionGroups}
                  handleClickFunctionGroup={this.handleClickFunctionGroup}
                  handleClickCheckAll={this.handleClickCheckAll}
                  handleClickCheck={this.handleClickCheck}
                />
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    );
  }
}
// Make alias
//const _static = Permissions;
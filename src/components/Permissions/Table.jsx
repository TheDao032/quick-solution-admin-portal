import React from 'react';
// import { Field } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
//import Table from '@material-ui/core/Table';
//import TableBody from '@material-ui/core/TableBody';
//import TableCell from '@material-ui/core/TableCell';
//import TableHead from '@material-ui/core/TableHead';
//import TablePagination from '@material-ui/core/TablePagination';
//import TableRow from '@material-ui/core/TableRow';
//import Checkbox from '@material-ui/core/Checkbox';
//import Input from '@material-ui/core/Input';

// Component(s)
import Loading from '../Common/Loading';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  tableWrapper: {},
});

/**
 * StickyHeadTable
 */
export default function StickyHeadTable(props) {
  const classes = useStyles();
  let {
    userGroups = [],
    functionGroups = [],
    handleClickFunctionGroup,
    handleClickCheckAll,
    handleClickCheck
  } = props;
  // let userGroupsL = userGroups.length;

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <table className="table table-hover table-striped table-mobile table-bordered">
          <thead>
            <tr className="bg-info text-white cur-pointer">
              <th>Tính năng</th>
              {userGroups.map(({ id, name }) => {
                return (<th key={`th-ug_${id}`} className="text-center">{name}</th>);
              })}
            </tr>
          </thead>
          <tbody>
            {functionGroups.map((functionGroup) => {
              let {
                function_group_id,
                function_group_name,
                user_groups = [],
                _functions,
                _isOpen
              } = functionGroup;
              let rows = ([
                <tr key={`tr-fg${function_group_id}`} className="table-warning">
                  <td className="MuiPaper-root__role--header">
                    <div className="d-flex cur-pointer" onClick={(event) => handleClickFunctionGroup(functionGroup)}>
                      <span className="icon mr-2">
                        <i className={`fa fa-${_isOpen ? 'minus' : 'plus'}-square`} aria-hidden="true"></i>
                      </span>
                      <b>{function_group_name}</b>
                    </div>
                  </td>
                  {userGroups.map((userGroup) => {
                    let { id/*, name*/ } = userGroup;
                    let foundUserGroup = user_groups.find(item => ('' + id) === ('' + item.user_group_id));
                    return (
                      <td key={`td-fg${function_group_id}-ug${id}`} className="text-center">
                        <input
                          type="checkbox"
                          name={`chkall_user_group_${id}`}
                          value={`chkall_user_group_${id}`}
                          checked={foundUserGroup && !!foundUserGroup.has_permission}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            evt.nativeEvent.stopPropagation();
                            evt.nativeEvent.stopImmediatePropagation();
                          }}
                          onChange={(evt) => handleClickCheckAll(functionGroup, userGroup)}
                        />
                      </td>
                    );
                  })}
                </tr>,
                (_isOpen === null) ? (
                  <tr key={`tr-func-loading`}>
                    <td className="text-center" colSpan={userGroups.length + 1}><Loading /></td>
                  </tr>
                ) : null,
                ((_functions instanceof Array) && (_functions.length === 0)) ? (
                  <tr key={`tr-func-loading`}>
                    <td className="name MuiPaper-root__role--sticky">&nbsp;</td>
                    <td className="text-left" colSpan={userGroups.length}>{"Chưa có dữ liệu"}</td>
                  </tr>
                ) : null
              ]);
              (_functions || []).forEach(_function => {
                let { function_id, function_name } = _function;
                let functionUserGroups = _function.user_groups || [];
                rows.push(
                  <tr key={`tr-func${function_id}`} hidden={!_isOpen} className={`${_isOpen ? '' : 'hidden'}`}>
                    <td className="name MuiPaper-root__role--sticky">
                      <div>{function_name}</div>
                    </td>
                    {userGroups.map((userGroup) => {
                      let { id/*, name*/ } = userGroup;
                      let foundUserGroup = functionUserGroups.find(item => ('' + id) === ('' + item.user_group_id));
                      let defaultChecked = foundUserGroup && !!foundUserGroup.has_permission;
                      return (
                        <td key={`td-func${function_id}-ug${id}`} className="text-center">
                          <input
                            key={new Date().getTime()}
                            type="checkbox"
                            name={`chk_user_group_${id}`}
                            value={`chk_user_group_${id}`}
                            defaultChecked={defaultChecked}
                            onChange={(event) => handleClickCheck(functionGroup, _function, userGroup)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              });

              // Return render
              return rows;
            })}
          </tbody>
        </table>
      </div>
    </Paper>
  );
}

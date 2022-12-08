import React, { PureComponent } from "react";
import {
  Redirect,
  matchPath
} from "react-router-dom";

// routes config
import routes from '../routes';

// Model(s)
import UserModel from "../models/UserModel";

// Components
// ...

// Containers
const DefaultLayout = React.lazy(() => import("../containers/DefaultLayout/DefaultLayout"));

/**
 * @class VerifyAccess
 */
export default class VerifyAccess extends PureComponent {
  /** @var {Array} */
  static _ignoredRoutes = [
    '/',
    '/change-password'
  ];

  /**
   * Helper: get user auth
   * @return void
   */
  static getUserAuth() {
    let userAuth = UserModel.getUserAuthStatic();
    // @TODO: define userAuth for global access?
    Object.assign(window._$g, { userAuth });
    // Return;
    return userAuth;
  }

  /**
   * @return Boolean
   */
  static verifyPermission(permission) {
    let userAuth = _static.getUserAuth();
    let functions = userAuth.getFunctions();
    let _function = functions.find((_func) => {
      let funcUC = (_func + '').toUpperCase().trim();
      return (funcUC === permission);
    });
    return !!_function;
  }

  static verify(route, location) {
    let userAuth = _static.getUserAuth();
    // Verify permissions?!
    let verify = null;
    let ignoredRoute = null;
    if (userAuth && !userAuth._isAdministrator()) {
      if (!route && location) {
        route = routes.find((_route) => {
          let result = matchPath(location.pathname, _route);
          return !!result;
        });
      }
      // Ignored?
      if (route) {
        ignoredRoute = _static._ignoredRoutes.find((_pathname) => {
          let result = matchPath(_pathname, route);
          return !!result;
        });
      }
      //.end
      if (route && !ignoredRoute) {
        let _function = _static.verifyPermission(route.function)
        if (!_function) {
          verify = "access_denined";
        }
        // console.log('verifyAccess#_function: ', _function, verify);
      }
    }
    
    // Return;
    return verify || (userAuth ? true : false);
  }

  render() {
    let props = this.props;
    let verify = _static.verify(null, props.location);
    return (true === verify)
      ? <DefaultLayout {...props} />
      : ((false === verify)
        ? <Redirect to="/login" />
        : <Redirect to={`/500/${verify}`} />
      )
    ;
  }
}
// Make alias
const _static = VerifyAccess;

/**
 * @class CheckAccess
 */
export class CheckAccess extends PureComponent {
  render() {
    let { permission, any = false, children }  = this.props;
    let permissions = (permission instanceof Array) ? permission : [permission];
    let result = !!permissions.length;
    for (let i = 0; i < permissions.length; i++) {
      let permission = permissions[i];
      let check = (true === VerifyAccess.verify({ function: permission }));
      if (check && any) {
        result = true;
        break;
      }
      result = result && check;
    }
    return (true === result) ? (typeof children === 'function' ? children(true === result) : children) : null;
  }
}

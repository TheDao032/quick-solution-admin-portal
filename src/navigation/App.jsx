import React, { PureComponent } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  // Redirect
} from "react-router-dom";

// Assets
import "./App.scss";

// Components
// Veriry access?
import VerifyAccess from './VerifyAccess';
import { loading } from '../components/Common/Loading';
import Dialog from '../components/Common/Dialog';
import Toastr from '../components/Common/Toastr';
import RedirectHelper from '../components/ReactRouter/RedirectHelper';

// Containers
// const DefaultLayout = React.lazy(() => import("../containers/DefaultLayout/DefaultLayout"));
const Login = React.lazy(() => import("../containers/Login"));
const Logout = React.lazy(() => import("../containers/Logout"));
const Register = React.lazy(() => import("../containers/Register"));
const Page404 = React.lazy(() => import("../containers/Page404"));
const Page500 = React.lazy(() => import("../containers/Page500"));

/**
 * @class App
 */
export default class App extends PureComponent {
  render() {
    return (
      <Router>
        <React.Suspense fallback={loading()}>
          {/* Helper for fast redirect */}
          <RedirectHelper ref={ref => (ref && (window._$g.rdr = (ref && ref.go)))} />
          {/* Helper for window dialogs */}
          <Dialog ref={ref => (ref && (window._$g.dialogs = ref))} />
          {/* Helper for window toastr */}
          <Toastr ref={ref => (ref && (window._$g.toastr = ref))} />
          <Switch>
            <Route
              exact
              path="/login"
              name={window._$g._("Login Page")}
              component={Login}
            />
            <Route
              exact
              path="/logout"
              name={window._$g._("Logout Page")}
              component={Logout}
            />
            <Route
              exact
              path="/register"
              name={window._$g._("Register Page")}
              component={Register}
            />
            <Route
              exact
              path="/404"
              name={window._$g._("Page 404")}
              component={Page404}
            />
            <Route
              exact
              path="/500/:error?"
              name={window._$g._("Page 500")}
              component={Page500}
            />
            <Route
              path="/"
              name={window._$g._("Dashboard")}
              component={VerifyAccess}
            />
          </Switch>
        </React.Suspense>
      </Router>
    );
  }
}
// Make alias
// const _static = App;

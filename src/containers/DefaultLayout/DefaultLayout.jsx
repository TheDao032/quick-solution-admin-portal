import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';

import {
  // AppAside,
  // AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// routes config
import routes from '../../routes';

// Model(s)
import UserModel from "../../models/UserModel";
import MenuModel from "../../models/MenuModel";

// Components
import { loading }  from '../../components/Common/Loading';
// const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

/**
 * @class DefaultLayout
 */
class DefaultLayout extends Component {
  /**
   * @var {UserModel}
   */
  _userModel;
  /**
   * @var {Object}|undefined
   */
  _userAuth;

  constructor(props) {
    super(props);

    // Init model(s)
    this._userModel = new UserModel();
    this._menuModel = new MenuModel();
    // +++
    this._userAuth = this._userModel.getUserAuth();

    // Init state
    this.state = {
      /** @var {Object|null}  */
      navigation: null, // sidebar nav config
    };
  }

  componentDidMount() {
    // Fetch navigation from API,...
    this._menuModel.getNavigation()
      .then(navigation => this.setState({ navigation }));
    //
    setTimeout(() => {
      let body = document.body;
      // Restore layout's body classList state
      let classList = UserModel.getPrefsStatic('layout.bodyClassList');
      if (classList) {
        body.setAttribute('class', classList);
      }
      // Save layout's body classList state
      document.addEventListener('click', function(evt) {
        setTimeout(() => {
          let nextClassList = body.classList.toString().trim();
          if (classList !== nextClassList) {
            UserModel.addPrefStatic('layout.bodyClassList', body.classList.toString());
          }
        }, 1e3);
      }, true);
    });
  }

  changePassword(e) {
    e.preventDefault()
    this.props.history.push('/change-password')
  }

  signOut(e) {
    e.preventDefault()
    this.props.history.push('/logout')
  }

  render() {
    let {
      navigation
    } = this.state;

    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={loading()}>
            <DefaultHeader
              onChangePassword={e=>this.changePassword(e)}
              onLogout={e=>this.signOut(e)}
            />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              {navigation ? <AppSidebarNav navConfig={navigation} {...this.props} router={router} /> : null}
            </Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes} router={router}/>
            <Container fluid>
              <Suspense fallback={loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={new Date().getTime()}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        component={route.component} />
                    ) : (null);
                  })}
                  <Redirect from="/" to="/404" />
                </Switch>
              </Suspense>
            </Container>
          </main>
        </div>
      </div>
    );
  }
}

export default DefaultLayout;

import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Dashboard from './content/Dashboard';
import AccountSettings from './content/AccountSettings';

function Router() {
  return (
    <HashRouter>
      {/* Login and side menu temp removed for refactor */}
      {/* <Login /> */}
      <div className="app-content">
        <Switch>
          <Route path="/settings">
            <AccountSettings />
          </Route>
          <Route path="/">
            <Dashboard />
          </Route>
        </Switch>
      </div>
    </HashRouter>
  );
}

export default Router;

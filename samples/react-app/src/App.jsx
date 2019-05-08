import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import Navigation from './Components/Navigation';
import { OAuthContext} from 'ibm-verify-sdk';
import { config } from '../config.js';

const PrivateRoute = ({component: Component, isAuthenticated, ...rest}) => (

  <Route 
      {...rest} 
      render={(props) => (
      isAuthenticated === true
      ? <Component {...props} />
      : <Redirect to='/' />
  )} />
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authURL: '',
      authenticators: [],
      isAuthenticated: false,
      authenticated: false
    };
    this.OAuthClient = new OAuthContext(config);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
  }

  handleLogin = e => {
    e.preventDefault();
    let url = this.OAuthClient.login();
    window.location.replace(url);
  };

  handleLogout = () => {
    this.OAuthClient.logout();
  };

  handleAuth = authenticated => {
    console.log('handleAuth', authenticated)
    this.setState({
      authenticated: authenticated
    });
  };

  render() {
    return (
      <React.Fragment>
        <Navigation
          login={ this.handleLogin }
          logout={ this.handleLogout }
          authenticated={ this.state.isAuthenticated }
        />
        <div className="container">
          <Route path="/" exact component={ Home } />
          <Route
            path={ config.REDIRECT_URI }
            component={ () => (
              <AuthenticationCallback
               OAuthClient={this.OAuthClient}
               handleAuth={ this.handleAuth }
                />
            ) }
          />
          <PrivateRoute 
            isAuthenticated={true} path="/dashboard" 
            component={()=> (
              <Dashboard
                OAuthClient={this.OAuthClient}
                />
            )} 
            />
        </div>
      </React.Fragment>
    );
  }
}

class AuthenticationCallback extends Component {
  constructor(props) {
    super(props);
    this.authenticated = false;
  }
  UNSAFE_componentWillMount() {
    this.props.OAuthClient.handleCallback()
    .then(() => {
      this.props.handleAuth(true);
    })
    .catch(err => {
     console.log(err);
    });
  }

  render() {
      return (
        <Redirect
          to="/dashboard"
          exact
          component={ Dashboard }
        />
      );
  }
}

class Home extends React.Component {
  render() {
    return (
      <div>
        <p>This is the home page</p>
      </div>
    );
  }
}
export default App;

import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import { Button } from 'reactstrap';
import { OAuthContext} from 'ibm-verify-sdk';
import TitleCard from './Components/TitleCard';
import './App.css'
import { config } from '../config.js'

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
		this.handleAuth = this.handleAuth.bind(this);
	}

	handleLogin = e => {
		e.preventDefault();
		const url = this.OAuthClient.login();
		window.location.replace(url);
	};

	handleLogout = () => {
		this.OAuthClient.logout();
	};

	handleAuth = authenticated => {
		this.setState({
			authenticated: authenticated
		});
	};

	render() {
		return (
			<Router>
				<React.Fragment>
					<TitleCard />
					<div className="container">
						<Route path="/" exact component={ (props) => ( <Home {...props} handleLogin={this.handleLogin} />) } />
						<Route
							path={ config.REDIRECT_URI_ROUTE }
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
									config={config}
									OAuthClient={this.OAuthClient}
									/>
							)}
							/>
					</div>
				</React.Fragment>
			</Router>
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
		.catch(err => {
			console.log("Error: ", err)
		});
		this.props.handleAuth(true);
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
				<p>Click the login button bellow to Authenticate your applicaiton</p>
					<Button color="primary" onClick={this.props.handleLogin} className="btn-primary">
				Login
			</Button>
			</div>
		);
	}
}
export default App;

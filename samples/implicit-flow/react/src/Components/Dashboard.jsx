import React, { Component } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'reactstrap';
import '../App.css'

const keysToDisplay = [
	'preferred_username',
	'uniqueSecurityName',
	'realmName',
	'userType',
	'tenantId',
]

export default class Dashboard extends Component {

	token = {};

	constructor(props) {
		super(props);
		this.state = {
			userInfo: undefined,
			hasError: false,
			isLoading: true,
			errorContext: {}
		};
	}

	componentDidMount() {
		this.getUserInfo();
	}

	getUserInfo = () => {
		this.token = this.props.OAuthClient.fetchToken();
		this.props.OAuthClient.userInfo(this.token)
			.then((result) => {
				this.setState({ userInfo: result })
			})
			.catch((error) => {
				const tokenError = JSON.parse(JSON.stringify(error));
				this.setState((prevState) => {
					return {
						...prevState,
						hasError: true,
						errorContext: { ...tokenError }
					}
				})
			})
			.finally(() => {
				this.setState({
					isLoading: false
				})
			})
	}

	handleLogout = (event) => {
		event.preventDefault();
		this.props.OAuthClient.logout('/');
	}

	handleAuthentication = (event) => {
		event.preventDefault();
		window.location.href = this.props.OAuthClient.login();

	}

	render() {

		const { userInfo } = this.state;
		let displayName = userInfo !== undefined && userInfo.displayName.length > 0 ? userInfo.displayName : '';

		return (
			<div>
				<Container>
					<Row>
						<Col className="mb-5">
							{this.state.hasError ? (
								<React.Fragment>
									<Alert
										color='danger'
									>
										<p><strong>{this.state.errorContext.name}</strong></p>
										{this.state.errorContext.message}
									</Alert>
									<Button
										color='primary'
										onClick={this.handleAuthentication}
									>
										{'Reauthenticate'}
									</Button>
								</React.Fragment>
							) : (
								<React.Fragment>
									{this.state.isLoading ? (
										<div className="spinner-wrapper">
											<Spinner color='light' style={{ width: '3rem', height: '3rem' }} children={''} />
										</div>
									) : (
										<>
											<h3>{` Welcome ${displayName}`}</h3>
											<p className="lead">You have successfully authenticated with IBM Security Verify.</p>
											<p>Below is the information retrieved from the <code>userInfo</code> endpoint for the authenticated user.</p>
											<table className="table table-bordered">
												<thead className="table-dark">
													<tr>
														<th>User claims</th>
														<th>Value</th>
													</tr>
												</thead>
												<tbody>
													{userInfo !== undefined && (
														<>
															{keysToDisplay.map((keyItem) => {
																if(keyItem === 'tenantId') {
																	return (
																		<tr key={`key-${keyItem}`}>
																			<td>{keyItem}</td>
																			<td>{userInfo.ext.tenantId}</td>
																		</tr>
																	)
																}

																if(keyItem in userInfo) {
																	return (
																		<tr key={`key-${keyItem}`}>
																			<td>{keyItem}</td>
																			<td>{userInfo[keyItem]}</td>
																		</tr>
																	)
																}
																return undefined;

															})}
														</>
													)}
												</tbody>
											</table>
											<Button
												color='primary'
												onClick={this.handleLogout}
											>
												{'Log out'}
											</Button>
										</>
									)}


								</React.Fragment>
							)}
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

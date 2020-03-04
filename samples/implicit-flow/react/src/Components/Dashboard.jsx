import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../toggle.css';
import NameCard from './NameCard';
import UserInfoCard from './UserInfoCard'
import '../App.css'
export default class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userInfo: undefined
		};
	}

	componentDidMount() {
		this.getUserInfo();
	}

	getUserInfo = () => {
		let token = this.props.OAuthClient.fetchToken()
		this.props.OAuthClient.userInfo(token)
		.then((result)=> {
			this.setState({userInfo: result})
		})
	}

	render() {
			return (
				<div>
					<Container>
						<Row>
							<Col className="mb-5">
								<h3>User name:</h3>
								<NameCard
									userInfo={this.state.userInfo}
								/>
								<br></br>
								<h3>User info:</h3>
								<UserInfoCard
									userInfo={this.state.userInfo}
								/>
								<br></br>
							<h4>Resources:</h4>
								<ul>
									<li>
										<p> <a href="http://developer.ice.ibmcloud.com/verify/javascript/react-js/getting-started" rel="noopener noreferrer" target="_blank"> IBM Security Identity and Access: Developer Portal </a> </p>
									</li>
									<li>
										<p> <a id="APIExplorer" href={this.props.config.tenantUrl + '/developer/explorer'} rel="noopener noreferrer" target="_blank" >API Explorer </a> </p>
									</li>
								</ul>
							</Col>
						</Row>
					</Container>
			</div>
			);
	}
}

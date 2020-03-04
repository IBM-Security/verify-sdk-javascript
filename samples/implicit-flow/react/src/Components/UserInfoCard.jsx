import React, { Component } from 'react';

class UserInfoCard extends Component {

	render() {
		return (
			<div>
				<pre className="d-block p-4 bg-dark text-white"> { this.props.userInfo && JSON.stringify(this.props.userInfo, null, 4)} </pre>
			</div>
		);
	}
}

export default UserInfoCard;
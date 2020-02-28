import React, { Component } from 'react';

class NameCard extends Component {
	render() {
		return (
			<div>
				<pre className="d-block p-4 bg-dark text-white"> {this.props.userInfo && this.props.userInfo.name} </pre>
			</div>
		);
	}
}

export default NameCard;
import React, { Component } from 'react';
import '../App.css'

class TitleCard extends Component {

	render() {
		return (
			<div className="col jumbotron">
			<div className="container">
				<h1> React sample application </h1>
				<p> This sample is created using <a href="https://www.npmjs.com/package/ibm-verify-sdk" rel="noopener noreferrer" title="IBM Verify javascript SDK" target="_blank"> IBM Verify javascript SDK </a> </p>
			</div>
		</div>
		);
	}
}

export default TitleCard;
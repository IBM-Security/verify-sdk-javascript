import React from 'react';
import { Button } from 'reactstrap';
function LoginController(props) {
	if (props.authenticated) {
		return (
			<Button color="link" onClick={props.logout} className="nav-link">
				Logout
			</Button>
		);
	} else {
		return (
			<Button color="link" onClick={props.login} className="nav-link">
				Login
			</Button>
		);
	}
}

export default LoginController;

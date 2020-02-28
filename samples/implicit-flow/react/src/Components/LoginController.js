import React from 'react';
import { Button } from 'reactstrap';
function LoginController(props) {
	if (props.authenticated) {
		return (
			<Button color="primary" onClick={props.logout} className="btn-primary">
				Logout
			</Button>
		);
	} else {
		return (
			<Button color="primary" onClick={props.login} className="btn-primary">
				Login
			</Button>
		);
	}
}

export default LoginController;

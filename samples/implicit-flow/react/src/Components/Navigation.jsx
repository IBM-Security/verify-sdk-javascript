import React from 'react';
import LoginController from './LoginController';
import {
	Collapse,
	Navbar,
	NavbarToggler,
  Nav,
	NavItem,
} from 'reactstrap';
import '../App.css'

export default class Navigation extends React.Component {
	constructor(props) {
		super(props);
		this.toggle = this.toggle.bind(this);
		this.state = {
			isOpen: false
		};
	}
	toggle() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	}
	render() {
		return (
			<div className="mb-5">
				<Navbar color="light" light expand="md">
					<NavbarToggler onClick={this.toggle} />
					<Collapse isOpen={this.state.isOpen} navbar>
						<Nav className="ml-auto" navbar>
							<NavItem>
								<LoginController {...this.props} toggle={this.toggle} />
							</NavItem>
						</Nav>
					</Collapse>
				</Navbar>
			</div>
		);
	}
}

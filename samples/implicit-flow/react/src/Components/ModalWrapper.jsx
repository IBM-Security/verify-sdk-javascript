import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ModalWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			nestedModal: false,
			closeAll: false,
			requestData: {},
			select: 'image/png'
		};
		this.handleClose = this.handleClose.bind(this);
	}


	handleClose() {
		this.props.loader();
	}

	render() {
		return (
			<div>
				<Modal
					isOpen={this.props.isOpen}
					onClosed={this.handleClose}
					toggle={this.props.toggle}
					className={this.props.className}>
					<ModalHeader toggle={this.props.toggle}>QR Code</ModalHeader>
					<ModalBody>
							{this.props.qrCode ? (
								<img
									alt=""
									src={`data:image/png;base64,${this.props.qrCode}`}
								/>
							) : null}
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={this.props.toggle}>
							Cancel
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default ModalWrapper;

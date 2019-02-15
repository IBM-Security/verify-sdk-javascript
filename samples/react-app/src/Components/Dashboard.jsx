import React, { Component } from 'react';
import { AuthenticatorContext } from 'ibm-verify-sdk';
import { Button, Container, Row, Col } from 'reactstrap';
import ModalWrapper from './ModalWrapper';
import Loader from 'react-loader';
import '../toggle.css';
import Authenticators from './Authenticators';

export default class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			authenticators: [],
			authnMethods: [],
			verifications: [],
			verification: {},
			isChecked: null,
			modal: false,
			imageSrc: '',
      loaded: false,
		};
		this.toggle = this.toggle.bind(this);
		this.initiateAuthenticator = this.initiateAuthenticator.bind(this);
		this.getAuthenticators = this.getAuthenticators.bind(this);
		this.toggleLoader = this.toggleLoader.bind(this);
		this.getAuthnMethods = this.getAuthnMethods.bind(this);
		this.updateAuthenMethod = this.updateAuthenMethod.bind(this);
		this.toggleCheck = this.toggleCheck.bind(this);
    this.deleteAuthenticator = this.deleteAuthenticator.bind(this);

    this.ATX = new AuthenticatorContext(this.props.OAuthClient);
    this.token = this.ATX.token;
	}
	async componentDidMount() {
    await this.getAuthenticators();
	}


	toggle() {
		this.setState({
			modal: !this.state.modal
		});
  }
  
	initiateAuthenticator = () => {
    let data = {
      accountName: 'Mac Attack'
    }
		this.toggle();
		this.ATX.initiateAuthenticator(data)
			.then(result => {
				this.setState({
					imageSrc: result.qrcode,
				});
			})
			.catch(err => {
        console.log(err);
			});
  };

  deleteAuthenticator = (authenticatorID) => {
    this.ATX.deleteAuthenticator(authenticatorID)
    .then((result) => {
      this.getAuthenticators();
    }).catch((err) => {
      console.log('deleteAuthenticator', err);
    });
  }
  
	getAuthenticators() {
		this.ATX.authenticators()
			.then(result => {
        let authenticators = result.authenticators;
				this.setState({
          authenticators: authenticators,
          loaded: true
				});
			})
      .catch(err => {
        console.log('ERROR ', err);
			});
  }
  
	getAuthnMethods = (owner) => {
    console.log('get authn mehtod')
    this.ATX.methods(owner)
    .then(result => {
      let methods = result.signatures;
			this.setState({
				authnMethods: methods
			});
    })
    .catch(err => {
      console.log('methods', err);
      this.setState({
        loaded: true
      });
    });
	}

	updateAuthenMethod(methodId, enabled, authId) {
    this.ATX.methodEnabled(methodId, enabled)
    .then((result) => {
      this.getAuthnMethods(authId)
      .then((result) => {
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });

	}

	toggleLoader() {
		this.setState({
			isLoaded: !this.state.isLoaded
		});
	}

	toggleCheck(authenticatorId, event) {
		this.setState(
			{
				isChecked: event.target.checked
			},
			() => {
				this.ATX.enabled(authenticatorId, this.state.isChecked);
			}
		);
  }
	render() {
			return (
        <div>
					<Container>
						<Row>
							<Col className="mb-5">
              <h3>Initiate an Authenticator</h3>
              <p>Initiate an authenticator registration for IBM Verify instances.</p>
								<Button
									color="primary"
									size="sm"
									onClick={this.initiateAuthenticator}>
									QR Code
								</Button>
								<ModalWrapper
									toggle={this.toggle}
									qrCode={this.state.imageSrc}
									isOpen={this.state.modal}
									loaded={this.state.loaded}
									loader={this.toggleLoader}
								/>
							</Col>
						</Row>
              <Loader loaded={this.state.loaded}>
              <Authenticators 
                authenticators={this.state.authenticators}
                deleteAuthenticator={this.deleteAuthenticator}
                methods={this.state.authnMethods}
                getAuthnMethods={this.getAuthnMethods}
                updateAuthenMethod={this.updateAuthenMethod}
                loaded={this.state.loaded}
              />
              </Loader>
					</Container>
        </div>
			);
	}
}

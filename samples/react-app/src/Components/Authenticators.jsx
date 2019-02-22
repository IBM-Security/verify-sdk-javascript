import React, { Component } from 'react';
import {Row, Col,Table, Button } from 'reactstrap';
// import Loader from 'react-loader';
import Methods from './Methods';
import '../App.css';


class Authenticators extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      authenticator: [] 
    }
    this.handleClick = this.handleClick.bind(this);
    this.rowClick = this.rowClick.bind(this);
  }

  handleClick = (authenticatorID) => {
    this.props.deleteAuthenticator(authenticatorID);
  }

  rowClick = (authenticatorID) => {
   this.props.authenticators.filter(authenticator => {
     if(authenticator.id === authenticatorID){
       this.setState({
         authenticator: [authenticator]
       },()=>{
        this.props.getAuthnMethods(authenticatorID);
       })
     }
   });
  }

  render() {
      return (
        <React.Fragment>
          <Row className="mb-5">
            <Col>
              <Table bordered hover>
                <thead className="thead-dark">
                  <tr>
                    <th scope="col"> Authenticator ID </th>
                    <th scope="col"> Account Name </th>
                    <th scope="col"> Device Type </th>
                    <th scope="col"> Remove </th>
                  </tr>
                </thead>
                <tbody id="auth-tbody">
                  {this.props.authenticators.map(authenticator => (
                    <tr key={authenticator.id} onClick={()=>{this.rowClick(authenticator.id)}}>
                      <td>{authenticator.id}</td>
                      <td>{authenticator.attributes.accountName}</td>
                      <td>{authenticator.attributes.deviceType}</td>
                      <td>
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={()=>{this.handleClick(authenticator.id)}}>Delete Authenticator</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row className="mb-5">
            <Col md="6">
              {this.state.authenticator && this.state.authenticator.length > 0 &&
                <div id="authenticators">
                <h3> Authenticator Information </h3>
                  <pre>{JSON.stringify(this.state.authenticator, null, 2)}</pre>
              </div>
              }
            </Col>
            <Col md="6">
             <Methods
                  authenticators={this.props.authenticators}
                  methods={this.props.methods}
                  getAuthnMethods={this.props.getAuthnMethods}
                  updateAuthenMethod={this.props.updateAuthenMethod}
                  loaded={this.props.loaded}
                  authenticator={this.state.authenticator}
                  />
            </Col>
              
          </Row>
        </React.Fragment>
      );
    } 
  }

export default Authenticators

import React, { Component } from 'react';

class Authenticator extends Component {
  render() {
    return (
      <div>
        <p>{this.props.authenticators}</p>
      </div>
    );
  }
}

export default Authenticator;
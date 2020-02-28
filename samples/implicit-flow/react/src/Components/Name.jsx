import React, { Component } from 'react';

class Name extends Component {
  render() {
    return (
      <div>
        <p>{this.props.userInfo.name}</p>
      </div>
    );
  }
}

export default Name;
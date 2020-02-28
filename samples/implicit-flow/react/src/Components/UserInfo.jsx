import React, { Component } from 'react';

class UserInfo extends Component {
  render() {
    return (
      <div>
        <p>{this.props.userInfo}</p>
      </div>
    );
  }
}

export default UserInfo;
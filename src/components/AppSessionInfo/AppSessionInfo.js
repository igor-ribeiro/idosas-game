import React, { Component } from 'react';

import AppUsersList from './../AppUsersList/AppUsersList';

import './AppSessionInfo.css';

export default class AppSessionInfo extends Component {
  render () {
    if (!this.props.sessionId) {
      return null;
    }

    return (
      <div className="AppSessionInfo">
        <div className="AppSessionInfo-block">
          <div className="AppSessionInfo-label">Session ID</div>
          <div>{this.props.sessionId}</div>
        </div>
        <div className="AppSessionInfo-block">
          <div className="AppSessionInfo-label">Players</div>
          <AppUsersList users={this.props.users} turn={this.props.turn}/>
        </div>
      </div>
    );
  }
}
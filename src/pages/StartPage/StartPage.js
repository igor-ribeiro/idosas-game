import React, { Component } from 'react';
import uuid from 'uuid/v4';

import './StartPage.css';

export default class StartPage extends Component {
  render () {
    return (
      <div className="StartPage">
        <button className="App-button" onClick={this.startSession} type="button">Start Session</button>
        <span className="StartPage-separator">or</span>
        <input className="App-input" placeholder="Session ID"/>
        <button className="App-button" type="button">Join Session</button>
      </div>
    );
  }

  startSession = () => {
    this.props.handleStartSession(uuid());
  }
}
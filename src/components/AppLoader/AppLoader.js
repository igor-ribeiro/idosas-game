import React, { Component } from 'react';

import AppModal from './../AppModal/AppModal';

import './AppLoader.css';

export default class AppLoader extends Component {
  render () {
    return (
      <AppModal visible={this.props.visible}>
        <div className="AppLoader-spinner"></div>
        <div className="AppLoader-text">{this.props.reason}</div>
      </AppModal>
    );
  }
}
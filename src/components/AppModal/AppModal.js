import React, { Component } from 'react';

import './AppModal.css';

export default class AppModal extends Component {
  render () {
    return (
      <div className={`AppModal ${this.props.visible && 'is-visible' || ''}`}>
        <div className="AppModal-box">
          {this.props.children}
        </div>
      </div>
    );
  }
}
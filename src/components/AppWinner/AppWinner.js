import React, { Component } from 'react';

import AppModal from './../AppModal/AppModal';

export default class AppWinner extends Component {
  render () {
    return (
      <AppModal visible={this.props.visible}>
        <div>Congratulations, {this.props.name}</div>
      </AppModal>
    );
  }
}
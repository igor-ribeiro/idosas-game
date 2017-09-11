import React, { Component } from 'react';
import cn from 'classnames';

import './AppError.css';

export default class AppError extends Component {
  state = {
    visible: false,
  }

  render () {
    return (
      <div className={cn('AppError', { 'is-visible': this.state.visible })}>
        {this.props.error}
      </div>
    );
  }

  componentDidMount() {
    this.timeout = null;
  }

  componentWillReceiveProps(props) {
    const visible = props.error !== null;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (visible) {
          clearTimeout(this.timeout);

          this.timeout = setTimeout(this.hide, 5000);
        }

        this.setState({ visible });
      });
    });
  }

  hide = () => {
    this.timeout = null;
    this.setState({ visible: false });
  }
}
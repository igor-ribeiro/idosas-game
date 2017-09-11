import React, { Component } from 'react';
import cn from 'classnames';

import './AppUsersList.css';

export default class AppUsersList extends Component {
  render () {
    return (
      <div className="AppUsersList">
        {
          this.props.users && this.props.users.map((user) => (
            <div className={cn('AppUsersList-user', { 'is-turn': this.props.turn === user.uid })} key={user.uid}>
              <div className="AppUsersList-user-image" style={{ backgroundImage: `url('${user.photoURL}')` }}></div>
              <div className="AppUsersList-user-name">{user.displayName}</div>
            </div>
          ))
        }
      </div>
    );
  }
}
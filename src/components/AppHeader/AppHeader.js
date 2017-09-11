import React from 'react';

import './AppHeader.css';

class AppHeader extends React.Component {
  render() {
    return (
      <div className="AppHeader">
        <div className="AppHeader-title">Idosa's Game</div>
        {
          this.props.user &&
          <span className="AppHeader-info">{this.props.user.displayName}</span>
        }
      </div>
    );
  }
}

export default AppHeader;
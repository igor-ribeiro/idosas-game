import React from 'react';

import './LoginPage.css';

class LoginPage extends React.Component {
  render() {
    return (
      <div className="LoginPage">
        <div className="LoginPage-form">
          <button onClick={this.props.handleSubmit} className="App-button" type="button">Login with Facebook</button>
        </div>
      </div>
    );
  }
}

export default LoginPage;
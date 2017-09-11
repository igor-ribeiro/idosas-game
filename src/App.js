import React, { Component } from 'react';
import cn from 'classnames';
import firebase from 'firebase';

import LoginPage from './pages/LoginPage/LoginPage';
import StartPage from './pages/StartPage/StartPage';
import GamePage from './pages/GamePage/GamePage';

import AppHeader from './components/AppHeader/AppHeader';
import AppLoader from './components/AppLoader/AppLoader';
import AppWinner from './components/AppWinner/AppWinner';
import AppError from './components/AppError/AppError';
import AppSessionInfo from './components/AppSessionInfo/AppSessionInfo';

import './firebase-config';
import './App.css';

const provider = new firebase.auth.FacebookAuthProvider();

class App extends Component {
  state = {
    user: null,
    loading: false,
    loadingReason: '',
    error: null,
    session: null,
    board: null,
    turn: null,
    turns: null,
    players: null,
    winner: false,
  }

  render() {
    return (
      <div className="App">
        <AppHeader user={this.state.user}/>
        <AppSessionInfo
          turn={this.getUIDTurn()}
          sessionId={this.state.session}
          users={this.state.players && Object.values(this.state.players)}
          />

        <div className="App-page">
          {this.renderPage()}
        </div>

        <AppLoader
          visible={this.state.loading}
          reason={this.state.loadingReason}
          />

        <AppWinner
          visible={this.state.winner !== false}
          winner={this.getWinnersName()}
          />

        <AppError error={this.state.error}/>
      </div>
    );
  }

  renderPage() {
    if (!this.state.user) {
      return <LoginPage handleSubmit={this.handleLogin} />
    }

    if (!this.state.session) {
      return <StartPage handleStartSession={this.startSession}/>;
    }

    if (this.state.session) {
      return <GamePage
        selectBlock={this.selectBlock}
        turn={this.state.turn}
        board={this.state.board}
        isUsersTurn={this.isUsersTurn()}
        />;
    }
  }

  async componentDidMount() {
    try {
      this.setState({
        user: null,
        error: null,
        loading: true,
        loadingReason: 'Login...',
      });

      await this.getLoginResult();
      await this.tryToLoginWithToken();

      this.setState({
        loading: false,
        loadingReason: '',
      });

      const session = await this.startSession(window.location.hash.substring(1));

      firebase.database().ref(`sessions/${session}`).on('value', this.getSession);
      firebase.database().ref(`boards/${session}`).on('value', this.getBoard);
      firebase.database().ref(`players/${session}`).on('value', this.getPlayers);
      firebase.database().ref(`turns/${session}`).on('value', this.getTurns);
    } catch (e) {
      this.setState({ error: e.message });
    } finally {
      this.setState({
        loading: false,
        loadingReason: '',
      });
    }
  }

  handleLogin = () => {
    this.setState({
      loading: true,
      loadingReason: 'Login...',
    });

    firebase.auth().signInWithRedirect(provider);
  }

  async getLoginResult() {
    try {
      const result = await firebase.auth().getRedirectResult();

      if (result.credential) {
        localStorage.setItem('fbt', result.credential.accessToken);
      }

      this.setState({
        user: result.user,
        error: null,
      });
    } catch (e) {
      throw e;
    }
  }

  async tryToLoginWithToken() {
    const acessToken = localStorage.getItem('fbt');

    if (!acessToken) {
      return;
    }

    try {
      const credential = firebase.auth.FacebookAuthProvider.credential(acessToken);
      const result = await firebase.auth().signInWithCredential(credential);

      this.setState({
        user: result.toJSON(),
      });
    } catch (e) {
      throw e;
    }
  }

  startSession = async (session) => {
    session = window.location.hash.substring(1) || session || null;

    if (!session) {
      return;
    }

    this.setState({
      session: null,
      loading: true,
      loadingReason: 'Starting session...',
    });

    try {
      const ref = `sessions/${session}`;
      const sessionSnapshot = await firebase.database().ref(ref).once('value');

      if (!sessionSnapshot.val()) {
        await firebase.database().ref(ref).set('');
      }

      this.setState({ session });

      window.location.hash = session;

      return session;
    } catch (e) {
      throw e;
    } finally {
      this.setState({
        loading: false,
        loadingReason: '',
      });
    }
  }

  getSession = (snapshot) => {
    try {
      const { turn, winner } = snapshot.val();

      this.setState({ turn, winner });
    } catch (_) {
      // ignore
    }
  }

  getBoard = (snapshot) => {
    const board = snapshot.val();

    this.setState({ board });
  }

  getPlayers = async (snapshot) => {
    let loading = true;
    let loadingReason = 'Waiting other player...';

    const players = snapshot.val();
    let playersCount = 0;
    
    if (!players) {
      return;
    }

    playersCount = Object.keys(players).length;

    if (!players[this.state.user.uid]) {
      console.log(this.state.user);
      const updates = {
        [`players/${this.state.session}/${this.state.user.uid}`]: this.state.user,
        [`turns/${this.state.session}/2`]: this.state.user.uid,
      };

      await firebase.database().ref().update(updates);
    }

    if (playersCount === 2) {
      loadingReason = null;
      loading = false;
    }

    this.setState({
      players,
      loading,
      loadingReason,
    });
  }

  getTurns = (snapshot) => {
    const turns = snapshot.val();

    this.setState({ turns });
  }

  selectBlock = (row, col) => {
    firebase.database().ref(`boards/${this.state.session}/${row}/${col}`).set(Number(this.state.turn));
  }

  isUsersTurn() {
    try {
      return this.state.turns[this.state.turn] === this.state.user.uid;
    } catch(_) {
      return false;
    }
  }

  async getWinnersName() {
    try {
      return this.state.players[this.state.turns[this.state.winner]].displayName;
    } catch (_) {
      return null;
    }
  }

  getUIDTurn() {
    try {
      return this.state.turns[this.state.turn];
    } catch (_) {
      return null;
    }
  }
}

export default App;

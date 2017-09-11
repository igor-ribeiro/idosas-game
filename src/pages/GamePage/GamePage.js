import React, { Component } from 'react';
import cn from 'classnames';

import './GamePage.css';

const ROWS = 3;
const COLS = 3;
const PLAYERS = {
  1: 'x',
  2: 'o',
};

export default class GamePage extends Component {
  state = {
    hasWinner: false,
  }

  render () {
    return (
      <div className={cn('GamePage', { 'is-turn': this.props.isUsersTurn })}>
        {this.renderCanvas()}
      </div>
    );
  }

  renderCanvas() {
    if (!this.props.board) {
      return null;
    }

    return this.props.board.map((cols, row) => {
      return (
        <div className="Game-row" key={row}>
          {
            cols.map((value, col) => {
              return (
                <div
                  className={`Game-block ${!value && 'is-empty' || ''}`}
                  data-turn={PLAYERS[this.props.turn]}
                  onClick={() => this.handleSelectBlock(row, col)}
                  key={`${row}-${col}`}
                  >
                  {PLAYERS[value]}
                </div>
              )
            })
          }
        </div>
      );
    });
  }

  handleSelectBlock(row, col) {
    this.props.selectBlock(row, col);

    // this.checkWinner();
    // this.checkVelha();
  }

  checkWinner() {
    const board = this.state.board;
    const sequences = [];
    const colSequence = {};
    const diagonalRule = {
      0: [0, 2],
      1: [1, 1],
      2: [2, 0],
    };

    board.forEach((row, rowIndex) => {
      sequences.push(row);

      row.forEach((col, colIndex) => {
        if (!colSequence[colIndex]) {
          colSequence[colIndex] = [];
        }

        colSequence[colIndex].push(col);

        if (colSequence[colIndex].length === COLS) {
          sequences.push(colSequence[colIndex]);
        }
      });
    });


    for (let colIndex = 0; colIndex < 2; colIndex++) {
      const diagonalSequence = [];

      Object.keys(diagonalRule).forEach((rowIndex) => {
        diagonalSequence.push(board[rowIndex][diagonalRule[rowIndex][colIndex]]);
      });

      sequences.push(diagonalSequence);
    }

    const result = sequences.map(this.checkSequence);

    this.setState({
      hasWinner: result.indexOf(true) > -1,
    });
  }

  checkSequence(row) {
    let hasWinner = true;
    let player;

    for (let i = 0; i < row.length; i++) {
      if (!player && row[i] !== 0) {
        player = row[i];
        continue;
      }

      if (player !== row[i]) {
        hasWinner = false;
      }
    }

    return hasWinner;
  }

  checkVelha() {
    const flatBoard = (Array.prototype.concat.apply([], this.state.board));

    if (flatBoard.indexOf(0) < 0 && !this.state.hasWinner) {
      alert('Veeeeeeeeeelha');
    }
  }
}
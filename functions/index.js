const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const ROWS = 3;
const COLS = 3;

function createBoard(event) {
  const board = {};

  Array(ROWS).fill(1).forEach((_, row) => {
    board[row] = {};

    Array(COLS).fill(1).forEach((_, col) => {
      board[row][col] = 0;
    });
  });

  return [`boards/${event.params.sessionId}`, board];
}

function attachUserToSession(event) {
  const { uid } = event.auth.variable;

  return admin.auth().getUser(uid)
    .then(userRecord => {
      const userJSON = userRecord.toJSON();
      const remove = ['metaData', 'providerData'];
      const user = {};

      Object.keys(userJSON)
        .filter(key => remove.indexOf(key) < 0)
        .forEach((key) => {
          const value = userJSON[key];

          user[key] = value === undefined ? '' : value;
        });

      return [`players/${event.params.sessionId}/${uid}`, user];
    });
}

function attachUserToFirstTurn(event) {
  return [`turns/${event.params.sessionId}/1`, event.auth.variable.uid];
}

function setTurnOnSession(event) {
  return [`sessions/${event.params.sessionId}/turn`, 1];
}

function setSessionInitialWinner(event) {
  return [`sessions/${event.params.sessionId}/winner`, false];
}

function checkSequence(sequence) {
  let hasWinner = true;
  let player;

  for (let i = 0; i < sequence.length; i++) {
    if (!player && sequence[i] !== 0) {
      player = sequence[i];
      continue;
    }

    if (player !== sequence[i]) {
      hasWinner = false;
    }
  }

  return hasWinner;
}

exports.createSession = functions.database.ref('sessions/{sessionId}')
  .onCreate(event => {
    return Promise.all([
      createBoard(event),
      attachUserToSession(event),
      attachUserToFirstTurn(event),
      setTurnOnSession(event),
      setSessionInitialWinner(event),
    ])
      .then(operations => {
        const updates = {};
        
        operations.forEach(operation => {
          updates[operation[0]] = operation[1];
        });

        console.log(operations);

        return admin.database().ref().update(updates);
      });
  })

exports.deleteSession = functions.database.ref('sessions/{sessionId}')
  .onDelete(event => {
    const { sessionId } = event.params;

    const updates = {
      [`boards/${sessionId}`]: null,
      [`players/${sessionId}`]: null,
      [`turns/${sessionId}`]: null,
    };

    return admin.database().ref().update(updates);
  });

exports.checkWinner = functions.database.ref('boards/{sessionId}')
  .onWrite(event => {
    return Promise.all([
      admin.database().ref(`sessions/${event.params.sessionId}/turn`).once('value'),
      admin.database().ref(`turns/${event.params.sessionId}`).once('value'),
    ])
    .then(values => {
      currentTurn = values[0].val();
      turns = values[1].val();

      const nextTurn = Object.keys(turns).filter((key) => Number(key) !== Number(currentTurn))[0];

      const board = event.data.val();
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

      const hasWinner = sequences.map(checkSequence).indexOf(true) > -1;

      const updates = {
        [`sessions/${event.params.sessionId}/winner`]: hasWinner ? Number(currentTurn) : false,
        [`sessions/${event.params.sessionId}/turn`]: hasWinner ? false : Number(nextTurn),
      };

      return admin.database().ref().update(updates);
    });
  });
const shots = ["rock", "paper", "scissors"];

exports.name = "custom";
const counterMoves = {
  scissors: "rock",
  rock: "paper",
  paper: "scissors",
};
const histories = {};
let randomChoicePlayerId = "";
let constantPlayerChoiceOfShot = "";

/**
 * @param {string} playerId - The ID of the player to check
 */
const findRandomChoicePlayer = (playerId) => {
  if (histories[playerId].size > 1) {
    randomChoicePlayerId = playerId;
  }
};

exports.recordShot = (playerId, shot) => {
  if (!histories[playerId]) {
    histories[playerId] = new Set();
  }
  histories[playerId].add(shot);

  if (!randomChoicePlayerId) {
    findRandomChoicePlayer(playerId);
  }

  if (randomChoicePlayerId !== playerId && !constantPlayerChoiceOfShot) {
    constantPlayerChoiceOfShot = shot;
  }
};

exports.makeShot = (playerId) => {
  if (randomChoicePlayerId !== playerId && constantPlayerChoiceOfShot) {
    return counterMoves[constantPlayerChoiceOfShot];
  }
  return shots[Math.floor(Math.random() * shots.length)];
};

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
const isThisNotRandomPlayer = (playerId) => {
  return (
    randomChoicePlayerId &&
    randomChoicePlayerId !== playerId &&
    !constantPlayerChoiceOfShot
  );
};
exports.recordShot = (playerId, shot) => {
  if (!histories[playerId]) {
    histories[playerId] = new Set();
  }
  histories[playerId].add(shot);

  if (!randomChoicePlayerId) {
    findRandomChoicePlayer(playerId);
  }

  if (isThisNotRandomPlayer(playerId)) {
    constantPlayerChoiceOfShot = [...histories[playerId]][0];
  }
};

exports.makeShot = (playerId) => {
  if (randomChoicePlayerId !== playerId && constantPlayerChoiceOfShot) {
    return counterMoves[constantPlayerChoiceOfShot];
  }
  return shots[Math.floor(Math.random() * shots.length)];
};

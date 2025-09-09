const shots = ["rock", "paper", "scissors"];

exports.name = "custom";
const counterMoves = {
  scissors: "rock",
  rock: "paper",
  paper: "scissors",
};
const histories = {};
let randomPlayerId = "";
let constantPlayerChoice = "";
const findRandomPlayer = (playerId) => {
  if (histories[playerId].size > 1) {
    randomPlayerId = playerId;
  }
};

exports.recordShot = (playerId, shot) => {
  if (!histories[playerId]) {
    histories[playerId] = new Set();
    histories[playerId].add(shot);
  }
  histories[playerId].add(shot);
  findRandomPlayer(playerId, shot);
  if (randomPlayerId !== playerId) {
    constantPlayerChoice = shot;
  }
};

exports.makeShot = (playerId) => {
  if (randomPlayerId !== playerId && constantPlayerChoice) {
    return counterMoves[constantPlayerChoice];
  }
  return shots[Math.floor(Math.random() * shots.length)];
};

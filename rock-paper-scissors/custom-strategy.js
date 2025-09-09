exports.name = "custom";
const counterMoves = {
  scissors: "rock",
  rock: "paper",
  paper: "scissors",
};
const histories = {};
let constantPlayer = {};

exports.recordShot = (playerId, shot) => {
  if (!histories[playerId]) {
    histories[playerId] = new Set();
    histories[playerId].add(shot);
  }
  histories[playerId].add(shot);
  if (histories[playerId].size > 1) {
    constantPlayer[playerId] = shot;
  }
};

exports.makeShot = (playerId) => {
  if (constantPlayer[playerId]) {
    return counterMoves[constantPlayer[playerId]];
  }
  return "foo";
};

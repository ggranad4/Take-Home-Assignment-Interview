// data to beat
// {
//     "min": 1376,
//     "max": 21489,
//     "average": 11201
// }

const http = require("http");

const DB_PORT = 8901;
const PORT = 8902;

// When we discover the length of the ordered list from the DB, we stash it here.
let knownListLength;

function sendJSONResponse(res, status, response) {
  const message = JSON.stringify(response);

  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(message),
  });

  res.end(message);
}

function makeDatabaseRequest(pathname, callback) {
  http.get(`http://localhost:${DB_PORT}${pathname}`, (dbResponse) => {
    dbResponse.setEncoding("utf8");

    let rawUTF8 = "";

    dbResponse.on("data", (chunk) => {
      rawUTF8 += chunk;
    });

    dbResponse.on("end", () => {
      callback(JSON.parse(rawUTF8));
    });
  });
}
// I can split this list by a lot simply by dividing the list
// easier thing i can do is split the array in half check the middles time or whatever.
// if position is above this go to the second half og the array.
// attempt anohter split??? idk
// we have the index, the parameter for some reason is passing known length so we know the size of the array
// lets split the known Length in half. Check the start of that and check if we are at least above it
async function doesTimestampExisitInList(knownLength, position) {
  const lastItemIndex = knownLength - 1;
  makeDatabaseRequest(`/query?index=${lastItemIndex}`),
    (data) => {
      const { result } = data;
      if (position <= result.end) {
        return true;
      }
      return false;
    };
  return isItHere;
}
async function findSegment(res, knownLength, position) {
  function tryNext(index) {
    makeDatabaseRequest(`/query?index=${index}`, (data) => {
      const { result } = data;
      if (result.start <= position && position <= result.end) {
        return sendJSONResponse(res, 200, data);
      }
      tryNext(index + 1);
    });
  }
  // starting at zero every time is wild
  // having the knownlength you can check the half mark...
  // but how can i check and not actuall run the try next?
  // we should check if its even in the list before goign through this search
  const isTimestampInList = await doesTimestampExisitInList(
    knownLength,
    position
  );
  if (isTimestampInList) {
    tryNext(0);
  }
}

function getRange(res) {
  console.log("get range from database ordered list");

  makeDatabaseRequest("/range", (data) => {
    const { length } = data.result;

    knownListLength = length;

    sendJSONResponse(res, 200, data);
  });
}

const server = http.createServer((req, res) => {
  const base = `http://localhost:${server.address().port}`;
  const url = new URL(req.url, base);

  const response = { result: null };
  let status = 404;

  if (url.pathname === "/range") {
    return getRange(res);
  }

  if (url.pathname === "/media-segment") {
    const position = parseInt(url.searchParams.get("position"), 10);
    console.log("get media segment for position", position);

    if (!Number.isNaN(position)) {
      return findSegment(res, knownListLength, position);
    }
  }

  sendJSONResponse(res, status, response);
});

server.on("listening", () => {
  const { port } = server.address();
  console.log("Application server listening on port", port);
});

server.listen(PORT);

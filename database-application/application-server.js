const http = require("http");

const DB_PORT = 8901;
const PORT = 8902;
//// data to beat // { // "min": 1376, // "max": 21489, // "average": 11201 // }
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
async function handleDatabaseRequest(index) {
  return new Promise((resolve) =>
    makeDatabaseRequest(`/query?index=${index}`, (data) => {
      resolve(data);
    })
  );
}
async function findIndexRangeForPosition(knownLength, position) {
  let startIndex = 0;
  let foundStartIndex = false;
  while (foundStartIndex) {
    startIndex += 250;
    const data = await handleDatabaseRequest(startIndex);
    const { result } = data;
    if (result.end < position) {
      foundStartIndex = true;
    }
  }
  return startIndex;
}
async function findSegment(res, knownLength, position) {
  async function tryNext(index) {
    const data = await handleDatabaseRequest(index);
    const { result } = data;

    if (result.start <= position && position <= result.end) {
      return sendJSONResponse(res, 200, data);
    }
    tryNext(index + 1);
  }
  const indexToStart = await findIndexRangeForPosition(knownLength, position);
  tryNext(indexToStart);
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

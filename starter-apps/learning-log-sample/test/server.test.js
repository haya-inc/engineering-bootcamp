const assert = require("node:assert/strict");
const test = require("node:test");
const { createServer } = require("../src/server");

test("GET /api/mentor/learners returns learners", async (t) => {
  const server = createServer();
  await listen(server);
  t.after(() => server.close());

  const response = await fetch(baseUrl(server) + "/api/mentor/learners");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.learners));
  assert.ok(body.learners.length > 0);
});

test("PATCH /api/mentor/learners/:id/support-status updates a learner", async (t) => {
  const server = createServer();
  await listen(server);
  t.after(() => server.close());

  const response = await fetch(baseUrl(server) + "/api/mentor/learners/l-102/support-status", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-mentor-id": "m-001"
    },
    body: JSON.stringify({
      status: "resolved",
      note: "Confirmed with learner."
    })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.learner.supportStatus, "resolved");
});

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
}

function baseUrl(server) {
  const address = server.address();
  return `http://${address.address}:${address.port}`;
}

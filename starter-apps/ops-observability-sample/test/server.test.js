const assert = require("node:assert/strict");
const test = require("node:test");
const { createServer } = require("../src/server");

test("health endpoint returns ok", async (t) => {
  const server = createServer();
  await listen(server);
  t.after(() => server.close());

  const response = await fetch(baseUrl(server) + "/healthz");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
});

test("work endpoint supports latency parameter", async (t) => {
  const server = createServer();
  await listen(server);
  t.after(() => server.close());

  const response = await fetch(baseUrl(server) + "/api/work?delayMs=1");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.result, "ok");
  assert.equal(body.delayMs, 1);
});

test("flaky endpoint can simulate a 500", async (t) => {
  const server = createServer();
  await listen(server);
  t.after(() => server.close());

  const response = await fetch(baseUrl(server) + "/api/flaky?fail=true");
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.equal(body.error, "simulated_failure");
});

test("metrics endpoint returns counters", async (t) => {
  const server = createServer();
  await listen(server);
  t.after(() => server.close());

  await fetch(baseUrl(server) + "/healthz");
  const response = await fetch(baseUrl(server) + "/metrics");
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /sample_requests_total/);
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

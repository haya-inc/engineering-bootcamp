const crypto = require("node:crypto");
const http = require("node:http");

const serviceName = process.env.SERVICE_NAME || "ops-observability-sample";
const appVersion = process.env.APP_VERSION || "local";

const metrics = {
  requestsTotal: 0,
  errorsTotal: 0,
  latencyMsTotal: 0
};

function createServer() {
  return http.createServer(async (request, response) => {
    const startedAt = Date.now();
    const requestId = request.headers["x-request-id"] || crypto.randomUUID();
    const url = new URL(request.url, "http://localhost");
    let statusCode = 200;

    try {
      if (request.method === "GET" && url.pathname === "/healthz") {
        return sendJson(response, statusCode, {
          status: "ok",
          service: serviceName,
          version: appVersion
        });
      }

      if (request.method === "GET" && url.pathname === "/readyz") {
        return sendJson(response, statusCode, {
          status: "ready",
          checks: {
            process: "ok",
            config: "ok"
          }
        });
      }

      if (request.method === "GET" && url.pathname === "/api/work") {
        const delayMs = clamp(Number(url.searchParams.get("delayMs") || 20), 0, 2000);
        await sleep(delayMs);
        return sendJson(response, statusCode, {
          result: "ok",
          delayMs
        });
      }

      if (request.method === "GET" && url.pathname === "/api/flaky") {
        if (url.searchParams.get("fail") === "true") {
          statusCode = 500;
          return sendJson(response, statusCode, {
            error: "simulated_failure",
            message: "This endpoint failed because fail=true was provided."
          });
        }

        return sendJson(response, statusCode, {
          result: "ok"
        });
      }

      if (request.method === "GET" && url.pathname === "/metrics") {
        response.writeHead(200, {
          "content-type": "text/plain; version=0.0.4; charset=utf-8",
          "cache-control": "no-store"
        });
        return response.end(renderMetrics());
      }

      statusCode = 404;
      return sendJson(response, statusCode, {
        error: "not_found",
        message: "Route was not found."
      });
    } finally {
      const durationMs = Date.now() - startedAt;
      recordMetrics(statusCode, durationMs);
      logRequest(request, url, statusCode, durationMs, requestId);
    }
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body, null, 2));
}

function recordMetrics(statusCode, durationMs) {
  metrics.requestsTotal += 1;
  metrics.latencyMsTotal += durationMs;
  if (statusCode >= 500) {
    metrics.errorsTotal += 1;
  }
}

function renderMetrics() {
  const averageLatency = metrics.requestsTotal === 0
    ? 0
    : metrics.latencyMsTotal / metrics.requestsTotal;

  return [
    "# TYPE sample_requests_total counter",
    `sample_requests_total ${metrics.requestsTotal}`,
    "# TYPE sample_errors_total counter",
    `sample_errors_total ${metrics.errorsTotal}`,
    "# TYPE sample_request_latency_ms_average gauge",
    `sample_request_latency_ms_average ${averageLatency.toFixed(2)}`,
    ""
  ].join("\n");
}

function logRequest(request, url, statusCode, durationMs, requestId) {
  console.log(JSON.stringify({
    level: statusCode >= 500 ? "error" : "info",
    service: serviceName,
    version: appVersion,
    method: request.method,
    path: url.pathname,
    status: statusCode,
    durationMs,
    requestId
  }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4000);
  createServer().listen(port, () => {
    console.log(`${serviceName} listening on http://localhost:${port}`);
  });
}

module.exports = {
  createServer,
  renderMetrics
};

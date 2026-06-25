const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { listLearners, updateSupportStatus } = require("./store");

const publicDir = path.join(__dirname, "public");

function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/mentors/progress")) {
        return serveFile(response, path.join(publicDir, "index.html"), "text/html; charset=utf-8");
      }

      if (request.method === "GET" && ["/app.js", "/styles.css"].includes(url.pathname)) {
        const filePath = path.join(publicDir, url.pathname.slice(1));
        const type = url.pathname.endsWith(".css")
          ? "text/css; charset=utf-8"
          : "text/javascript; charset=utf-8";
        return serveFile(response, filePath, type);
      }

      if (request.method === "GET" && url.pathname === "/api/mentor/learners") {
        const learners = listLearners({
          filter: url.searchParams.get("filter") || "all",
          supportStatus: url.searchParams.get("supportStatus") || ""
        });
        return sendJson(response, 200, { learners });
      }

      const supportStatusMatch = url.pathname.match(/^\/api\/mentor\/learners\/([^/]+)\/support-status$/);
      if (request.method === "PATCH" && supportStatusMatch) {
        const input = await readJson(request);
        const mentorId = request.headers["x-mentor-id"] || process.env.MENTOR_ID || "m-001";
        const result = updateSupportStatus(supportStatusMatch[1], input, mentorId);

        if (!result.ok) {
          return sendJson(response, result.statusCode, {
            error: result.error,
            message: result.message
          });
        }

        return sendJson(response, 200, { learner: result.learner });
      }

      return sendJson(response, 404, {
        error: "not_found",
        message: "Route was not found."
      });
    } catch (error) {
      return sendJson(response, 500, {
        error: "internal_server_error",
        message: error.message
      });
    }
  });
}

function serveFile(response, filePath, contentType) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      return sendJson(response, 404, {
        error: "not_found",
        message: "Static file was not found."
      });
    }

    response.writeHead(200, {
      "content-type": contentType,
      "cache-control": "no-store"
    });
    response.end(content);
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body, null, 2));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      if (!body) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, () => {
    console.log(`learning-log-sample listening on http://localhost:${port}`);
  });
}

module.exports = {
  createServer
};

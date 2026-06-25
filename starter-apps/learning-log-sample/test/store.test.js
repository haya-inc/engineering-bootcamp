const assert = require("node:assert/strict");
const test = require("node:test");
const {
  listLearners,
  resetData,
  updateSupportStatus
} = require("../src/store");

test("lists all learners", () => {
  resetData();
  const learners = listLearners();

  assert.equal(learners.length, 4);
  assert.ok(learners.some((learner) => learner.id === "l-102"));
});

test("filters learners by support status", () => {
  resetData();
  const learners = listLearners({ supportStatus: "needs_support" });

  assert.deepEqual(learners.map((learner) => learner.id), ["l-102"]);
});

test("updates support status for an assigned learner", () => {
  resetData();
  const result = updateSupportStatus("l-102", {
    status: "in_progress",
    note: "Pair on the API contract."
  }, "m-001");

  assert.equal(result.ok, true);
  assert.equal(result.learner.supportStatus, "in_progress");
  assert.equal(result.learner.supportNote, "Pair on the API contract.");
});

test("rejects support status updates for another mentor's learner", () => {
  resetData();
  const result = updateSupportStatus("l-201", {
    status: "needs_support",
    note: "This should not be allowed."
  }, "m-001");

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 403);
});

test("rejects unsupported status values", () => {
  resetData();
  const result = updateSupportStatus("l-102", {
    status: "watching",
    note: ""
  }, "m-001");

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 400);
});

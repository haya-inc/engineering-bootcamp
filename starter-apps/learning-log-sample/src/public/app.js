const filterSelect = document.querySelector("#filterSelect");
const supportStatusSelect = document.querySelector("#supportStatusSelect");
const refreshButton = document.querySelector("#refreshButton");
const learnerRows = document.querySelector("#learnerRows");
const message = document.querySelector("#message");

const statusOptions = ["none", "needs_support", "in_progress", "resolved"];

filterSelect.addEventListener("change", loadLearners);
supportStatusSelect.addEventListener("change", loadLearners);
refreshButton.addEventListener("click", loadLearners);

loadLearners();

async function loadLearners() {
  const params = new URLSearchParams();

  if (filterSelect.value !== "all") {
    params.set("filter", filterSelect.value);
  }
  if (supportStatusSelect.value) {
    params.set("supportStatus", supportStatusSelect.value);
  }

  const response = await fetch(`/api/mentor/learners?${params.toString()}`);
  const body = await response.json();

  learnerRows.replaceChildren(...body.learners.map(renderLearnerRow));
  message.textContent = `${body.learners.length} learner(s) shown`;
}

function renderLearnerRow(learner) {
  const row = document.createElement("tr");

  row.append(
    cell(learner.name),
    cell(learner.submittedAt || "Not submitted"),
    cell(learner.trouble),
    cell(learner.supportStatus),
    actionCell(learner)
  );

  return row;
}

function cell(text) {
  const element = document.createElement("td");
  element.textContent = text;
  return element;
}

function actionCell(learner) {
  const element = document.createElement("td");
  const select = document.createElement("select");
  const button = document.createElement("button");

  for (const status of statusOptions) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = learner.supportStatus === status;
    select.append(option);
  }

  button.type = "button";
  button.textContent = "Update";
  button.addEventListener("click", async () => {
    await updateSupportStatus(learner.id, select.value);
    await loadLearners();
  });

  element.append(select, button);
  return element;
}

async function updateSupportStatus(learnerId, status) {
  const response = await fetch(`/api/mentor/learners/${learnerId}/support-status`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-mentor-id": "m-001"
    },
    body: JSON.stringify({
      status,
      note: "Updated from the sample app."
    })
  });

  if (!response.ok) {
    const body = await response.json();
    message.textContent = body.message || "Update failed";
  }
}

const SUPPORT_STATUSES = ["none", "needs_support", "in_progress", "resolved"];

const initialLearners = [
  {
    id: "l-101",
    name: "Aoi Tanaka",
    mentorId: "m-001",
    lastLogAt: "2026-05-17T09:00:00+09:00",
    submittedAt: "2026-05-17T09:10:00+09:00",
    trouble: "Docker Compose exits before the app is ready.",
    supportStatus: "in_progress",
    supportNote: "Pair on service readiness check.",
    supportUpdatedAt: "2026-05-17T10:00:00+09:00"
  },
  {
    id: "l-102",
    name: "Ren Suzuki",
    mentorId: "m-001",
    lastLogAt: "2026-05-16T18:30:00+09:00",
    submittedAt: null,
    trouble: "Not sure how to split API and UI responsibilities.",
    supportStatus: "needs_support",
    supportNote: "Review API contract together.",
    supportUpdatedAt: "2026-05-17T09:30:00+09:00"
  },
  {
    id: "l-103",
    name: "Mio Sato",
    mentorId: "m-001",
    lastLogAt: "2026-05-17T08:45:00+09:00",
    submittedAt: null,
    trouble: "No blocker reported.",
    supportStatus: "none",
    supportNote: "",
    supportUpdatedAt: "2026-05-17T08:45:00+09:00"
  },
  {
    id: "l-201",
    name: "Kai Ito",
    mentorId: "m-002",
    lastLogAt: "2026-05-17T08:20:00+09:00",
    submittedAt: "2026-05-17T08:25:00+09:00",
    trouble: "Needs feedback on test cases.",
    supportStatus: "resolved",
    supportNote: "Reviewed with mentor m-002.",
    supportUpdatedAt: "2026-05-17T08:40:00+09:00"
  }
];

let learners = initialLearners.map(cloneLearner);

function cloneLearner(learner) {
  return { ...learner };
}

function resetData() {
  learners = initialLearners.map(cloneLearner);
}

function listLearners(options = {}) {
  const filter = options.filter || "all";
  const supportStatus = options.supportStatus || "";
  let result = learners;

  if (filter === "unsubmitted") {
    result = result.filter((learner) => learner.submittedAt !== null);
  } else if (filter === "submitted") {
    result = result.filter((learner) => learner.submittedAt !== null);
  }

  if (supportStatus) {
    result = result.filter((learner) => learner.supportStatus === supportStatus);
  }

  return result.map(cloneLearner);
}

function updateSupportStatus(learnerId, input, actorMentorId = "m-001") {
  const learner = learners.find((item) => item.id === learnerId);

  if (!learner) {
    return {
      ok: false,
      statusCode: 404,
      error: "not_found",
      message: "Learner was not found."
    };
  }

  if (learner.mentorId !== actorMentorId) {
    return {
      ok: false,
      statusCode: 403,
      error: "forbidden",
      message: "Mentors can update only their assigned learners."
    };
  }

  const status = input && input.status;
  const note = input && typeof input.note === "string" ? input.note.trim() : "";

  if (!SUPPORT_STATUSES.includes(status)) {
    return {
      ok: false,
      statusCode: 400,
      error: "invalid_status",
      message: `status must be one of: ${SUPPORT_STATUSES.join(", ")}`
    };
  }

  if (note.length > 160) {
    return {
      ok: false,
      statusCode: 400,
      error: "note_too_long",
      message: "note must be 160 characters or fewer."
    };
  }

  learner.supportStatus = status;
  learner.supportNote = note;
  learner.supportUpdatedAt = new Date().toISOString();

  return {
    ok: true,
    statusCode: 200,
    learner: cloneLearner(learner)
  };
}

module.exports = {
  SUPPORT_STATUSES,
  listLearners,
  resetData,
  updateSupportStatus
};

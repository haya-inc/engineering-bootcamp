-- schema-draft.sql

CREATE TABLE learners (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE mentors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE mentor_assignments (
  mentor_id INTEGER NOT NULL,
  learner_id INTEGER NOT NULL,
  PRIMARY KEY (mentor_id, learner_id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(id),
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE TABLE learner_support_statuses (
  learner_id INTEGER PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('none', 'needs_support', 'in_progress', 'resolved')),
  note TEXT,
  updated_by INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id),
  FOREIGN KEY (updated_by) REFERENCES mentors(id)
);

INSERT INTO learners (id, name) VALUES
  (1, 'Learner A'),
  (2, 'Learner B');

INSERT INTO mentors (id, name) VALUES
  (1, 'Mentor A');

INSERT INTO mentor_assignments (mentor_id, learner_id) VALUES
  (1, 1),
  (1, 2);

INSERT INTO learner_support_statuses (
  learner_id,
  status,
  note,
  updated_by,
  updated_at
) VALUES
  (1, 'none', NULL, 1, '2026-05-17T09:00:00+09:00'),
  (2, 'needs_support', '学習ログの提出が遅れている', 1, '2026-05-17T09:00:00+09:00');

CREATE TABLE IF NOT EXISTS mentors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  mentor_id TEXT NOT NULL REFERENCES mentors(id),
  name TEXT NOT NULL,
  last_log_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  trouble TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS learner_support_statuses (
  learner_id TEXT PRIMARY KEY REFERENCES learners(id),
  status TEXT NOT NULL CHECK (status IN ('none', 'needs_support', 'in_progress', 'resolved')),
  note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mentors (id, name) VALUES
  ('m-001', 'Mentor One'),
  ('m-002', 'Mentor Two')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learners (id, mentor_id, name, last_log_at, submitted_at, trouble) VALUES
  ('l-101', 'm-001', 'Aoi Tanaka', '2026-05-17T09:00:00+09:00', '2026-05-17T09:10:00+09:00', 'Docker Compose exits before the app is ready.'),
  ('l-102', 'm-001', 'Ren Suzuki', '2026-05-16T18:30:00+09:00', NULL, 'Not sure how to split API and UI responsibilities.'),
  ('l-103', 'm-001', 'Mio Sato', '2026-05-17T08:45:00+09:00', NULL, 'No blocker reported.'),
  ('l-201', 'm-002', 'Kai Ito', '2026-05-17T08:20:00+09:00', '2026-05-17T08:25:00+09:00', 'Needs feedback on test cases.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO learner_support_statuses (learner_id, status, note, updated_at) VALUES
  ('l-101', 'in_progress', 'Pair on service readiness check.', '2026-05-17T10:00:00+09:00'),
  ('l-102', 'needs_support', 'Review API contract together.', '2026-05-17T09:30:00+09:00'),
  ('l-103', 'none', '', '2026-05-17T08:45:00+09:00'),
  ('l-201', 'resolved', 'Reviewed with mentor m-002.', '2026-05-17T08:40:00+09:00')
ON CONFLICT (learner_id) DO NOTHING;

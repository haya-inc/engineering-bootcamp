# SQL確認ログ

## 確認1: メンターの担当受講者一覧

目的:

- 

SQL:

```sql
SELECT
  learners.id,
  learners.name,
  learner_support_statuses.status
FROM learners
JOIN mentor_assignments
  ON mentor_assignments.learner_id = learners.id
LEFT JOIN learner_support_statuses
  ON learner_support_statuses.learner_id = learners.id
WHERE mentor_assignments.mentor_id = 1
ORDER BY learners.id;
```

結果:

- 

気づいたこと:

- 

## 確認2: 支援ステータスの更新

SQL:

```sql
INSERT INTO learner_support_statuses (
  learner_id,
  status,
  note,
  updated_by,
  updated_at
) VALUES (
  1,
  'needs_support',
  '学習ログの提出が遅れている',
  1,
  '2026-05-17T10:00:00+09:00'
)
ON CONFLICT (learner_id) DO UPDATE SET
  status = excluded.status,
  note = excluded.note,
  updated_by = excluded.updated_by,
  updated_at = excluded.updated_at;
```

結果:

- 

## 確認3: 制約違反

試したこと:

- 

結果:

- 

## 設計を見直したい点

-

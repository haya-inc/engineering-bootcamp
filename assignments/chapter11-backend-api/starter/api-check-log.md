# API確認ログ

## 確認1: 担当受講者一覧

目的:

- 

コマンド:

```txt
curl -i \
  -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/mentor/learners?supportStatus=needs_support"
```

期待:

- status:
- レスポンス:

結果:

- 

## 確認2: 支援ステータス更新

コマンド:

```txt
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"needs_support","note":"学習ログの提出が遅れている"}' \
  "http://localhost:3000/api/mentor/learners/1/support-status"
```

期待:

- status:
- レスポンス:
- DB:

結果:

- 

## 確認3: 入力不正

コマンド:

```txt
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"unknown"}' \
  "http://localhost:3000/api/mentor/learners/1/support-status"
```

期待:

- status:
- レスポンス:

結果:

- 

## 確認4: 権限なし

確認したこと:

- 

結果:

- 

## 気づいたこと

-

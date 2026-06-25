# API契約

## API 1: 担当受講者一覧を取得する

エンドポイント:

```txt
GET /api/mentor/learners
```

目的:

- ログイン中のメンターが、自分の担当受講者と支援ステータスを確認する。

クエリパラメータ:

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| supportStatus | いいえ | 支援ステータスで絞り込む |

権限:

- ログインしているメンターだけが呼べる。
- 自分の担当受講者だけが返る。

成功レスポンス:

```json
{
  "learners": [
    {
      "learnerId": 1,
      "name": "Learner A",
      "supportStatus": "needs_support",
      "supportNote": "学習ログの提出が遅れている",
      "updatedAt": "2026-05-17T10:00:00+09:00"
    }
  ]
}
```

## API 2: 支援ステータスを更新する

エンドポイント:

```txt
PATCH /api/mentor/learners/{learnerId}/support-status
```

目的:

- ログイン中のメンターが、担当受講者の支援ステータスを変更する。

パスパラメータ:

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| learnerId | はい | 支援ステータスを変更する受講者ID |

リクエスト本文:

```json
{
  "status": "needs_support",
  "note": "学習ログの提出が遅れている"
}
```

成功レスポンス:

```json
{
  "learnerId": 1,
  "supportStatus": "needs_support",
  "supportNote": "学習ログの提出が遅れている",
  "updatedAt": "2026-05-17T10:00:00+09:00"
}
```

エラーレスポンス:

| ステータス | コード | 条件 |
| --- | --- | --- |
| 400 | INVALID_REQUEST | requestの形が不正 |
| 401 | UNAUTHENTICATED | ログインしていない |
| 403 | FORBIDDEN | 担当外の受講者を変更しようとした |
| 404 | LEARNER_NOT_FOUND | 受講者が存在しない |
| 422 | INVALID_SUPPORT_STATUS | 支援ステータスの値が不正 |

# API処理フロー

## PATCH /api/mentor/learners/{learnerId}/support-status

```txt
route
  -> handler
    -> validate path params
    -> validate リクエスト本文
    -> get current user
    -> use case
      -> check mentor role
      -> check mentor assignment
      -> update support status
    -> リポジトリ
      -> read assignment
      -> update learner_support_statuses
    -> レスポンス
```

## 正常系

1. 
2. 
3. 

## エラーが起きる場所

| 場所 | エラー | ステータス | レスポンスコード |
| --- | --- | --- | --- |
| 入力検証 |    |    |    |
| 認証 |    |    |    |
| 認可 |    |    |    |
| DB |    |    |    |

## トランザクションが必要になる場合

-

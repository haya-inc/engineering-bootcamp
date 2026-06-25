# テレメトリ計画

## ログ

| フィールド | 必須 | 例 | メモ |
| --- | --- | --- | --- |
| timestamp | はい | 2026-05-17T12:00:00Z |    |
| level | はい | info |    |
| message | はい | support status list fetched |    |
| request_id | はい | req_xxx |    |
| endpoint | はい | GET /api/mentor/learners |    |
| status | はい | 200 |    |
| duration_ms | はい | 120 |    |
| user_id | optional | masked or internal id | 個人情報に注意 |

## ログに出さないもの

- password
- access token
- セッショントークン
- 秘密情報 key
- 個人情報
- AWSアカウントID
- 内部URL

## メトリクス

| メトリクス | 理由 | 出典 | メモ |
| --- | --- | --- | --- |
| リクエスト数 | トラフィック | App Runner / app |    |
| error rate | failure | App Runner / app |    |
| latency p95 | user experience | app / CloudWatch |    |
| CPU / memory | saturation | App Runner |    |

## トレース

| span | 理由 | メモ |
| --- | --- | --- |
| HTTPリクエスト | リクエスト全体を見る |    |
| DB query | DBが遅いか見る |    |
| external API | 外部依存を見る |    |

## CloudWatchで見る場所

- App Runner デプロイ logs:
- App Runnerアプリケーションログ:
- App Runnerメトリクス:
- CloudWatchアラーム:

## 判断が必要なこと

-

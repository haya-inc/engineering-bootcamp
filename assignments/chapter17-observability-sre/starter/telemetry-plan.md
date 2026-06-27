# テレメトリ計画

## ログ

| フィールド | 必須 | 例 | メモ |
| --- | --- | --- | --- |
| timestamp | はい | 2026-05-17T12:00:00Z |    |
| level | はい | info |    |
| message | はい | support status list fetched |    |
| request_id | はい | req_xxx |    |
| trace_id | はい | trace_xxx | traceと結びつける |
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
| リクエスト数 | トラフィック | ECS（Fargate）/ app |    |
| success rate | 主要操作が成功しているか | app / CloudWatch | 主要操作の成功率を見る |
| error rate | failure | ECS（Fargate）/ app |    |
| latency p95 | user experience | app / CloudWatch |    |
| CPU / memory | saturation | ECS（Fargate）/ Container Insights |    |

## トレース

新規に集めるなら、まずOpenTelemetry/ADOT（AWS Distro for OpenTelemetry）を標準の集め方として考える。X-Rayは、集めたtraceを受け取って見る場所と整理する。

| span | 理由 | 収集方法（OTel/ADOT/X-Ray） | current status | メモ |
| --- | --- | --- | --- | --- |
| HTTPリクエスト | リクエスト全体を見る | | | |
| DB query | DBが遅いか見る | | | |
| external API | 外部依存を見る | | | |

## ローカルサンプル観察

`starter-apps/ops-observability-sample` で観察した結果を書く。まだ測れていないものも分けて書く。

| endpoint | 期待する動き | 観察したlog / metric |
| --- | --- | --- |
| `/healthz` | プロセスが生きている | |
| `/readyz` | リクエストを受けられる | |
| `/api/work?delayMs=300` | 遅延した200 | |
| `/api/flaky?fail=true` | 500とerror metric | |
| `/metrics` | counterと平均latency | |

## CloudWatchで見る場所

- ECS デプロイ（service イベント / task 状態）:
- ECS タスクのアプリケーションログ（CloudWatch Logs）:
- ECS / Fargate メトリクス（Container Insights）:
- CloudWatchアラーム:
- trace（ADOTで集めX-Rayで見る場合）:

## 判断が必要なこと

-

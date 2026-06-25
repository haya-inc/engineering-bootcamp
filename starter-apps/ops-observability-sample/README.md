# 運用オブザーバビリティサンプル

クラウド、CI/CD、オブザーバビリティ、SRE、リリース手順書の演習で使う小さなHTTPサービスです。外部npmパッケージなしで起動します。

## クイックスタート

```bash
cd starter-apps/ops-observability-sample
npm run dev
```

確認します。

```bash
curl http://localhost:4000/healthz
curl http://localhost:4000/readyz
curl http://localhost:4000/api/work
curl http://localhost:4000/metrics
npm test
```

## エンドポイント

| エンドポイント | 目的 |
| --- | --- |
| `GET /healthz` | プロセスが生きているか |
| `GET /readyz` | サービスがリクエストを受けられるか |
| `GET /api/work?delayMs=100` | レイテンシ観察用の正常系 |
| `GET /api/flaky?fail=true` | エラー率観察用の失敗系 |
| `GET /metrics` | Prometheus風の最小メトリクス |

## ログ

各リクエストでJSONログを標準出力に出します。

```json
{"level":"info","service":"ops-observability-sample","version":"local","method":"GET","path":"/healthz","status":200,"durationMs":2,"requestId":"..."}
```

## Docker

```bash
docker compose up --build
```

サービス:

```txt
http://localhost:4000
```

## 章ごとの使い方

| 章 | 使い方 |
| --- | --- |
| 16 | CI/CDワークフロー、デプロイ、ロールバック方針 |
| 17 | ヘルスチェック、ログ、メトリクス、レイテンシ、エラー率、インシデントレビュー |
| 23 | 本番準備チェックリスト、スモークテスト、リリース判断 |

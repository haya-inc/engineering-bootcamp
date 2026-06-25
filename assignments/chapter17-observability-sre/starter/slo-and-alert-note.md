# SLOとアラートメモ

## ダッシュボード

| panel | metric/log | 理由 | 対応 |
| --- | --- | --- | --- |
| availability | success rate | 利用者影響を見る | error logを見る |
| latency | p95 latency | 遅さを見る | slow endpointを調べる |
| error rate | 5xx rate | 失敗を見る | recent deployとlogsを見る |
| トラフィック | リクエスト数 | 利用状況を見る | 急増/急減を見る |
| saturation | CPU / memory | 余裕を見る | scaleや処理を確認する |

## アラーム案

| alarm | condition | window | 対応 | 担当者 |
| --- | --- | --- | --- | --- |
| high error rate | 5xx rate > 5% | 5 min | logsとrecent deployを見る |    |
| high latency | p95 > 1s | 10 min | slow API investigationへ |    |

## SLO違反時に考えること

- 新機能開発を続けてよいか:
- hotfixを優先するか:
- 追加で見るデータ:

## 判断が必要なこと

-

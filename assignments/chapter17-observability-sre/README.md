# 第17章 オブザーバビリティとSRE ワークブック

このワークブックは、第17章の演習「観察したいユーザー行動を決める」「テレメトリ計画を書く」「ダッシュボードとアラームの入口を設計する」「遅いAPIを調査し、改善PRの説明を書く」「小さなインシデントレビューを書く」で使う。

## 使い方

この資料と、第16章で作成した `aws-architecture-note.md`、`cloud-config-and-secrets.md`、`release-runbook.md` を読み、`observability-goals.md`、`telemetry-plan.md`、`slo-and-alert-note.md`、`slow-api-investigation.md`、`incident-review-note.md` を書く。

目的は、SRE用語を暗記することではない。リリース後のアプリを観察し、遅い、失敗する、使いにくいといった問題を、実測値とログで調査し、改善PRにつなげることである。

## 前提

研修用学習ログアプリに、次の機能が入っている。

```txt
メンターが、担当受講者の支援ステータスを一覧で確認し、必要に応じて変更できる。
```

第16章までに、アプリをAWSへデプロイする流れを整理している。

この章では、次の観察環境を前提にする。

- Amazon ECS（Fargate 起動タイプ）
- CloudWatch Logs
- CloudWatch metrics（Container Insights を含む）
- traceは、新規ならまずOpenTelemetry/ADOTを標準の集め方とし、X-Rayは集めたtraceを見る場所と考える

ローカルでログ、metrics、health check、error rateを観察する練習には、このリポジトリの `starter-apps/ops-observability-sample` を使ってよい。

扱わないこと:

- SRE組織設計
- 本格的なオンコール運用
- 高度なerror budget policy
- OpenTelemetry Collectorの本格運用
- APM製品比較
- カオスエンジニアリング

## 演習1: 観察したいユーザー行動を決める

### 考えること

技術指標から始めるのではなく、利用者にとって重要な行動から観察対象を決める。

問い:

- 利用者にとって重要な行動は何か。
- その行動が成功したと言える条件は何か。
- 失敗、遅い、使えないはどう判断するか。
- どのAPI、画面、DB処理に対応するか。
- SLIとして何を測るか。
- SLOのたたき台は何か。

### 記録すること

`observability-goals.md` は次の形で書く。

```md
# オブザーバビリティ目標

## 重要なユーザー行動

| user journey | 重要な理由 | related endpoint/view | impact if broken |
| --- | --- | --- | --- |
| 支援ステータス一覧を見る |    |    |    |
| 支援ステータスを更新する |    |    |    |

## SLI/SLO案

| ユーザージャーニー | SLI | SLO案 | 計測期間 | メモ |
| --- | --- | --- | --- | --- |
| 支援ステータス一覧を見る | 1秒未満の成功レスポンス | 7日間で99% | 7日間 | 下書き |
| 支援ステータスを更新する | successful update under 1s | 99% over 7 days | 7 days | draft |

## まだ測れないこと

- 

## 判断が必要なこと

- 
```

## 演習2: テレメトリ計画を書く

### 考えること

logs、metrics、tracesを何のために使うかを分ける。

問い:

- ログには何を出すか。
- リクエストIDやトレースIDをどう扱うか。
- ログに出してはいけない値は何か。
- metricsで見る指標は何か。
- tracesで見たい処理区間はどこか。
- ECS（Fargate）とCloudWatchで見られるものは何か。

### 記録すること

`telemetry-plan.md` は次の形で書く。

```md
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
| リクエスト数 | トラフィック | ECS（Fargate）/ app |    |
| error rate | failure | ECS（Fargate）/ app |    |
| latency p95 | user experience | app / CloudWatch |    |
| CPU / memory | saturation | ECS（Fargate）/ Container Insights |    |

## トレース

| span | 理由 | メモ |
| --- | --- | --- |
| HTTPリクエスト | リクエスト全体を見る |    |
| DB query | DBが遅いか見る |    |
| external API | 外部依存を見る |    |

## CloudWatchで見る場所

- ECS デプロイ（service イベント / task 状態）:
- ECS タスクのアプリケーションログ（CloudWatch Logs）:
- ECS / Fargate メトリクス（Container Insights）:
- CloudWatchアラーム:

## 判断が必要なこと

- 
```

## 演習3: ダッシュボードとアラームの入口を設計する

### 考えること

dashboardとalarmは、行動につながる最小限から始める。

問い:

- 誰が見るdashboardか。
- いつ見るdashboardか。
- 異常に気づいたら何をするか。
- alarmが鳴ったら誰が何を見るか。
- noisyなalarmになっていないか。

### 記録すること

`slo-and-alert-note.md` は次の形で書く。

```md
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
```

## 演習4: 遅いAPIを調査し、改善PRの説明を書く

### 考えること

「遅い」という感想を、再現条件、計測値、原因候補、調査結果、改善内容に分解する。

問い:

- どのAPIが遅いか。
- どの条件で遅いか。
- beforeのp50、p95、p99はどうか。
- エラーは増えているか。
- デプロイ前後で変化したか。
- DB query、N+1、外部API、データ量、serial処理のどれを疑うか。
- afterで本当に改善したか。

### 記録すること

`slow-api-investigation.md` は次の形で書く。

```md
# 遅いAPIの調査

## 対象

| 項目 | value |
| --- | --- |
| endpoint |    |
| environment |    |
| data size |    |
| time range |    |
| release/イメージタグ |    |

## 症状

- 

## 変更前

| メトリクス | 値 | メモ |
| --- | --- | --- |
| p50 latency |    |    |
| p95 latency |    |    |
| p99 latency |    |    |
| error rate |    |    |
| リクエスト数 |    |    |

## 観察したデータ

| source | finding | link or note |
| --- | --- | --- |
| logs |    |    |
| metrics |    |    |
| traces |    |    |
| code diff |    |    |
| DB query |    |    |

## 原因候補

| hypothesis | エビデンス | result |
| --- | --- | --- |
|    |    |    |

## 修正案

- 

## 変更後

| メトリクス | 変更前 | 変更後 | メモ |
| --- | --- | --- | --- |
| p50 latency |    |    |    |
| p95 latency |    |    |    |
| p99 latency |    |    |    |
| error rate |    |    |    |

## PR本文に書くこと

- 症状:
- 原因:
- 修正:
- 検証:
- 残した課題:
```

## 演習5: 小さなインシデントレビューを書く

### 考えること

問題が起きたとき、責任追及ではなく再発を減らすために振り返る。

問い:

- 何が起きたか。
- いつ検知したか。
- 利用者影響は何か。
- 暫定対応は何か。
- 恒久対応は何か。
- どの観測点が足りなかったか。
- 次に何を変えるか。

### 記録すること

`incident-review-note.md` は次の形で書く。

```md
# インシデントレビューメモ

## 概要

- date:
- environment:
- severity draft:
- owner:

## 何が起きたか

- 

## 影響範囲

| 項目 | 影響 |
| --- | --- |
| users |    |
| feature |    |
| data |    |
| duration |    |

## タイムライン

| 時刻 | イベント | メモ |
| --- | --- | --- |
|    |    |    |

## 暫定対応

- 

## 恒久対応

- 

## 検知・調査で足りなかったもの

- logs:
- metrics:
- traces:
- 手順書:

## アクション項目

| 対応 | 担当者 | 期限 | メモ |
| --- | --- | --- | --- |
|    |    |    |    |

## 学び

- 
```

## AIを使う場合

AIに頼んでよいこと:

- ログの要約
- metricsの見方の整理
- 原因候補の洗い出し
- 調査手順の作成
- slow API改善案
- PR本文の下書き
- incident reviewの下書き
- action itemの粒度調整

AIに任せたままにしてはいけないこと:

- 秘密情報、個人情報、AWSアカウントID、内部URLを貼ること
- 実測値を確認せずに原因を確定すること
- ログにない事実を作ること
- before/afterなしで改善したことにすること
- postmortemで責任追及の文章を書くこと
- SLOを現実の利用者行動と切り離して決めること

AIへの依頼例:

```txt
次のAPIが遅くなっています。原因候補と調査手順を出してください。

前提:
- Amazon ECS（Fargate 起動タイプ）で動いているWebアプリ
- logsとmetricsはCloudWatch（Container Insights を含む）で見られる
- 対象APIはGET /api/mentor/learners
- p95 latencyが300msから1800msに悪化
- error rateは大きく変わっていない
- deploy直後から悪化した可能性がある
- 秘密情報、個人情報、AWSアカウントIDは貼りません

出してほしいこと:
- まず確認するmetrics
- CloudWatch Logsで見る検索観点
- DB queryで疑う点
- code diffで見る点
- before/afterの測り方
- PR本文に書くべきこと
```

## チェックリスト

提出前に確認する。

- [ ] `observability-goals.md` に重要なユーザー行動、SLI/SLOのたたき台がある
- [ ] `telemetry-plan.md` にlogs、metrics、tracesの使い分けがある
- [ ] リクエストIDまたはトレースIDの方針がある
- [ ] ログにsecretや個人情報を出さない方針がある
- [ ] `slo-and-alert-note.md` にdashboard項目、alarm条件、鳴ったときの行動がある
- [ ] `slow-api-investigation.md` に再現条件、before/after、原因候補、調査結果、PR説明がある
- [ ] `incident-review-note.md` にtimeline、影響範囲、暫定対応、恒久対応、action itemがある
- [ ] SRE組織設計や高度なオンコール運用に入りすぎていない
- [ ] AIを使った場合、ログをmaskし、実測値とコードで検証している

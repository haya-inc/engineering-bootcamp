---
title: "第17章 オブザーバビリティとSRE"
part: 4
partLabel: "Part 4 実行環境と運用"
order: 17
---

第16章では、Docker imageをECRへ置き、Amazon ECS（Fargate 起動タイプ）で動かし、CI/CDで変更を届ける流れを扱った。
しかし、リリースは仕事の終点ではない。
利用者が使い始めると、遅い、失敗する、たまに表示されない、更新したはずの情報が反映されない、といった問題が起きる。
そのときに必要なのは、慌ててコードを読むことだけではない。
外から得られる情報をもとに、何が起きているかを順に追える状態である。

この章のテーマは、オブザーバビリティとSREである。
オブザーバビリティは、システム内部の状態を、外へ出てくる情報から調べられる性質である。
SREは Site Reliability Engineering の略で、利用者にとって大事な体験を、感覚ではなく指標、目標、手順、改善で守る考え方である。
どちらも大規模サービスだけの話ではない。
新人が作る小さなWebアプリでも、ログに何を出すか、どの遅さを問題とみなすか、障害後に何を直すかを説明できることは、実務の信頼性に直結する。

この章では、第16章で扱ったAmazon ECS（Fargate 起動タイプ）と、CloudWatch相当のlog、metrics確認を前提にする。
ただし、AWSの画面操作を暗記する章にはしない。
重要なユーザー行動を選び、ログ、メトリクス、トレースを設計し、SLIとSLOを置き、ダッシュボードとアラートを作り、遅いAPIを調査し、インシデントレビューで次の改善へつなげる。
この一連の流れを、支援ステータス一覧機能を題材に説明する。

この章は、実AWS環境がなくても学べる。
CloudWatchの実画面を開けない場合は、`starter-apps/ops-observability-sample` を使って、health check、JSON log、簡易metrics、遅延、5xx errorをローカルで観察する。
実行していないCloudWatch queryやアラーム確認を、実行済みのようには書かない。
実環境がない場合は、観測したローカル結果と、クラウドで確認すべき想定手順を分けて書く。

### この章でできるようになること

この章を終えると、次のことを自分の言葉で説明し、課題の成果物へ落とせるようになる。

- 監視とオブザーバビリティを分け、どちらもリリース後の品質確認に必要だと説明できる。
- 重要なユーザー行動を一つ選び、対象画面、endpoint、失敗時の利用者影響を書ける。
- logs、metrics、tracesの役割を分け、どの問いにどのsignalを使うか説明できる。
- structured logのfield、log level、request_id、trace_id、ログに出してはいけない値を設計できる。
- `ops-observability-sample` の `/healthz`、`/readyz`、`/api/work`、`/api/flaky`、`/metrics` を使って、遅延、error、metrics、JSON logを観察できる。
- latency、traffic、errors、saturationを、支援ステータス一覧のようなユーザー行動へ結びつけられる。
- SLI、SLO、error budgetの関係を説明し、100%を安易に目標にしない理由を書ける。
- dashboard、alarm、runbook、ownerをセットで設計し、鳴っても行動できないアラートを避けられる。
- 遅いAPIを、再現条件、before/after、仮説、証拠、改善PR説明へ分解できる。
- incident reviewを責任追及ではなく、timeline、影響、暫定対応、恒久対応、action itemの記録として書ける。

### リリース後のシステムは、観察できなければ直せない

ローカル環境では、開発者が画面を開き、ターミナルを見て、すぐにコードを変えられる。
本番環境ではそうはいかない。
利用者はどの時間帯に使ったのか。
どのendpointが遅かったのか。
失敗は全員に起きたのか、一部の操作だけなのか。
直前のdeployと関係があるのか。
DB、外部API、認可、入力値、ネットワーク、CPUやmemoryのどれが怪しいのか。
これらは、観測データがなければ推測でしかない。

最初に分けたい言葉が、監視とオブザーバビリティである。
監視、monitoringは、あらかじめ決めた指標や条件を継続的に見る活動である。
たとえば、5xx error rateが一定以上になったら通知する、p95 latencyが2秒を超えたら調べる、CPU使用率が高い状態が続いたら確認する、といった形である。

オブザーバビリティは、もう少し広い。
あらかじめ想定した異常だけでなく、まだ名前のついていない問題を調べられる状態を作る。
ログ、メトリクス、トレースに十分な手がかりがあり、request、利用者行動、deploy、DB query、外部API呼び出しを結びつけられれば、初めて起きた問題でも調査を始められる。

監視は、問題に気づくための仕組みである。
オブザーバビリティは、気づいた問題を調べるための性質である。
この二つを混ぜると、アラートはあるのに原因が分からない、ログは多いのに利用者影響が分からない、という状態になる。

支援ステータス一覧を例にすると、利用者に必要なのは、一覧画面そのものが存在することではない。
メンターが担当受講者の状態を見て、支援が必要な人を見逃さずに判断できることである。
したがって観測するべき対象も、「サーバーが起動しているか」だけでは足りない。
一覧取得が成功しているか。
十分な速さで返っているか。
権限外のデータを返していないか。
失敗したときに利用者へ意味のあるエラーを返しているか。
この体験に沿って見る。

### ログ、メトリクス、トレースは役割が違う

オブザーバビリティの基本は、ログ、メトリクス、トレースである。
OpenTelemetryの文脈では、これらはテレメトリ信号として扱われる。
テレメトリとは、システムが外へ出す観測用データである。
ログ、メトリクス、トレースは似ているようで、答えられる問いが違う。

ログは、出来事の記録である。
「このrequestは、どのendpointに来て、どのstatusで終わり、どのくらい時間がかかったか」「DB接続に失敗した」「認可で拒否した」といった具体的な出来事を時系列で残す。
ログは、あとで人間が読むことも、検索して集計することもある。
そのため、messageだけの文章ではなく、fieldを持つ構造化ログにすると調査しやすい。

メトリクスは、数値の推移である。
request数、error rate、latency、CPU使用率、memory使用率、DB connection数のように、時間とともに変化する値を見る。
メトリクスは、全体傾向をつかむのに向いている。
利用者から「遅い」と言われたとき、今だけ遅いのか、数日前から徐々に悪化しているのか、特定のdeploy後から変わったのかを見られる。

トレースは、一つの処理が通った道筋である。
Web requestがAPI handlerに入り、認可を確認し、DBを読み、外部APIを呼び、responseを返すまでを、spanという区間に分けて見る。
複数のserviceにまたがる場合、trace_idで一つの流れとして追える。
「全体は2秒かかったが、そのうち1.6秒はDB queryだった」のように、遅さの場所を分けるのに役立つ。

三つを使い分けると、調査の流れが変わる。
メトリクスで、いつ、どの程度、全体に影響が出ているかを見る。
ログで、失敗したrequestや特定のendpointの詳細を見る。
トレースで、request内のどの処理区間が遅いかを見る。
どれか一つだけでは足りない。

OpenTelemetryの公式資料では、これらはsignalとして扱われる。
signalは、システムやアプリの動きを外へ出す観測用の出力である。
ただし、ツールを入れただけで十分なsignalが出るわけではない。
アプリが何をlog fieldとして出すか、どの値をmetricにするか、どの処理区間をspanとして記録するかを決める必要がある。
観測は、あとから貼り付ける飾りではなく、実装と運用の設計対象である。

### 構造化ログは、あとで調べるための設計である

ログは、単に多く出せばよいわけではない。
役に立つログには、調査で使うfieldが入っている。
支援ステータス一覧APIなら、少なくとも次のようなfieldを考える。

```json
{
  "timestamp": "2026-06-25T10:15:30Z",
  "level": "info",
  "message": "request completed",
  "request_id": "req_7f3a",
  "trace_id": "trace_91b2",
  "method": "GET",
  "endpoint": "/api/mentor/learners",
  "status": 200,
  "duration_ms": 184,
  "mentor_id_hash": "mentor_anon_42",
  "result_count": 25,
  "image_tag": "app-3f6c9a1",
  "environment": "staging"
}
```

調査に使える情報と、出してはいけない情報を分ける。
request_idやtrace_idは、ログを追うために有効である。
endpoint、status、duration_ms、result_count、image_tag、environmentは、遅さや失敗を切り分ける材料になる。
一方で、password、token、session secret、API key、個人情報、AWS account id、内部URL、DB passwordはログに出さない。

「あとで消せばよい」は危険である。
ログはCloudWatch Logs、アラート通知、エクスポート先、スクリーンショット、AIへの貼り付けなど、思ったより広い場所へ流れる。
最初から出さない設計にする。
第14章のsecurity reviewと、第16章のcloud-config-and-secretsで整理した禁止情報をここでも再利用する。

構造化ログには、もう一つ利点がある。
あとで検索、集計、可視化しやすい。
messageの日本語文を人が目で探すより、`endpoint="/api/mentor/learners"`、`status>=500`、`duration_ms>1000` のようにfieldで絞れる方が、調査は速くなる。
CloudWatch Logs Insightsのようなツールを使うと、ログを時間帯、field、集計で調べられる。

たとえば、遅いrequestを探すときの考え方は次のようになる。
これは実プロジェクトに合わせて調整するたたき台である。

```txt
fields @timestamp, request_id, endpoint, status, duration_ms, image_tag
| filter endpoint = "/api/mentor/learners"
| filter duration_ms > 1000
| sort @timestamp desc
| limit 20
```

このqueryを覚えることが目的ではない。
ログにどのfieldを入れておけば、あとで何を調べられるかを先に考えることが目的である。

field名は、プロジェクト内でそろえる。
この章の例では `duration_ms` を使っているが、`ops-observability-sample` のJSON logでは `durationMs` を使っている。
どちらが絶対に正しいという話ではない。
大事なのは、同じprojectのlog、query、dashboard、PR説明で同じ名前を使い、変えた場合は移行期間を考えることである。

log levelも設計する。
`info` は通常のrequest完了、`warn` は利用者影響に進む可能性がある異常、`error` は失敗として調査対象にする状態、というように使い分ける。
すべてを `error` にすると、重要な失敗が埋もれる。
すべてを `info` にすると、失敗の検索やalert設計が難しくなる。

### request_idとtrace_idで、点を線にする

問題調査では、ログの一行だけを見ても全体は分からない。
利用者の一回の操作は、複数のログに分かれる。
API入口のログ、認可のログ、DB queryのログ、外部API呼び出しのログ、responseのログが別々に出ることがある。
それらをつなぐために、request_idとtrace_idを使う。

request_idは、一つのHTTP requestを追うための識別子である。
API入口で作成し、そのrequestに関係するログへ同じ値を入れる。
問い合わせが来たとき、時刻と画面だけでなくrequest_idが分かれば、該当するログへたどり着きやすくなる。

trace_idは、処理全体を複数のserviceやspanにまたがって追うための識別子である。
今の研修用アプリが単一serviceでも、考え方を早めに持っておく意味がある。
将来、Web app、API、worker、外部serviceが分かれたとき、trace_idがなければ処理の流れを人間が目で推測することになる。

最初から完全な分散トレーシングを導入しなくてもよい。
しかし、ログにrequest_idを入れる、遅い処理区間にdurationを残す、外部APIやDB queryの失敗を同じrequest_idで追えるようにする。
これだけでも、調査の質は大きく変わる。

### ECS（Fargate）とCloudWatchでは、何を見るかを決めてから開く

第16章でECS（Fargate）へデプロイした場合、観測の入口は主にCloudWatchになる。
ECS service（Fargate 起動タイプ）は、task definitionで `awslogs` ログドライバを指定するとコンテナの標準出力をCloudWatch Logsへ流せる。
Container Insightsを有効にすると、CPU、memory、タスク数などのECS metricsをCloudWatchで見られる。
deployやtaskの起動、停止はECS service eventとして残り、APIの監査はCloudTrailで追える。
X-Rayを使う場合は、サイドカーコンテナやADOT（AWS Distro for OpenTelemetry）を入れてアプリにtraceを出させる必要がある。
AWSの画面には多くのタブやグラフがあるため、目的を決めずに開くと迷いやすい。

まず見るのは、時間帯である。
問い合わせが来た時刻、deployした時刻、アラートが鳴った時刻を並べる。
次に、対象のcluster・serviceとenvironmentを確認する。
stagingを見ているのかproductionを見ているのか。
直近のimage tagやtask definitionのrevisionは何か。
この確認を飛ばすと、正しいログを見ているつもりで別環境を見ていた、という初歩的だが重大なミスが起きる。

ECS（Fargate）とCloudWatchで見る観点は、次のように分ける。

- **service event**：deploy、task起動、停止、health checkなど、ECS service自体の出来事を見る。
- **application logs**：`awslogs` ドライバでCloudWatch Logsへ出たアプリのログを見る。request、error、duration、request_idを追う。
- **service metrics**：Container InsightsのCPU、memory、タスク数などの推移を見る。最小公開（public IP 直結）ではALB由来のリクエスト数やレイテンシは出ないため、リクエスト数やlatencyはアプリ側で出すmetricsやlogで補う。
- **alarms**：人が対応すべき状態として設定した条件が発火しているかを見る。
- **traces**：X-Ray（サイドカーやADOT）を使う場合、request内の処理区間とlatencyを見る。

CloudWatchは、metrics、alarms、dashboards、logsをまとめて扱える。
X-RayやOpenTelemetryを使う場合も、アプリ側のinstrumentationが必要になることがある。
CloudWatchやX-Rayの画面があることと、支援ステータス一覧のDB queryや外部API呼び出しがspanとして見えることは別である。
どのtraceが取れていて、どの処理区間はまだ見えていないかを `telemetry-plan.md` に書く。
ただし、画面があるだけでは運用にはならない。
どのダッシュボードを誰が見るのか。
どのアラームで誰が動くのか。
ログを見て何を判断するのか。
この使い方を文書化する必要がある。

### ローカルで観測の型を練習する

実AWS環境がない場合でも、観測の型は練習できる。
このリポジトリの `starter-apps/ops-observability-sample` は、外部npm packageなしで動く小さなHTTP serviceである。
第17章では、CloudWatchの代わりにterminalのJSON logと `/metrics` を使って、同じ考え方を練習する。

```bash
cd starter-apps/ops-observability-sample
npm run dev
```

別のterminalから確認する。

```bash
curl http://localhost:4000/healthz
curl http://localhost:4000/readyz
curl "http://localhost:4000/api/work?delayMs=300"
curl "http://localhost:4000/api/flaky?fail=true"
curl http://localhost:4000/metrics
```

このsampleでは、requestごとに次のようなJSON logが標準出力へ出る。

```json
{
  "level": "info",
  "service": "ops-observability-sample",
  "version": "local",
  "method": "GET",
  "path": "/api/work",
  "status": 200,
  "durationMs": 302,
  "requestId": "..."
}
```

`/api/work?delayMs=300` は遅延を観察するための正常系である。
`/api/flaky?fail=true` は5xx errorを観察するための失敗系である。
`/metrics` は `sample_requests_total`、`sample_errors_total`、`sample_request_latency_ms_average` を返す。
これは本番監視基盤ではなく、学習用の最小例である。
平均latencyしか出していないため、p95やp99の練習には十分ではない。
その不足も含めて、`telemetry-plan.md` に「現時点で測れていないもの」として書く。

ローカル練習では、次を記録する。

- どのendpointを呼んだか。
- terminalに出たlog field。
- `/metrics` の値がどう変わったか。
- errorを起こしたとき、どのfieldで見分けられたか。
- p95、p99、trace、CloudWatch alarmなど、まだ測れていないものは何か。

### Four Golden Signalsを、ユーザー行動に結びつける

Google SREの文脈では、user-facing systemで見る基本的な信号として、latency、traffic、errors、saturationがよく使われる。
これをFour Golden Signalsと呼ぶ。
日本語では、遅延、流量、エラー、飽和と考えるとよい。
ただし、この四つを暗記するだけでは実務に使えない。
Four Golden Signalsは、対象のユーザー行動へ結びつける。

支援ステータス一覧APIなら、次のように見る。

- **latency**：一覧APIが何msで返るか。p50、p95、p99で分布を見る。
- **traffic**：一定時間に何request来ているか。普段より急に増えていないか。
- **errors**：4xx、5xx、認可失敗、DB接続失敗がどれだけ起きているか。
- **saturation**：CPU、memory、DB connection、queue、外部API rate limitが限界に近いか。

latencyでは平均だけを見ない。
平均は一部の遅いrequestを隠すことがある。
p50は中央値、p95は95%のrequestがその値以下で終わる値、p99は99%のrequestがその値以下で終わる値である。
「多くの人は速いが、一部の人だけ極端に遅い」という問題は、平均よりp95やp99で見つけやすい。
また、成功したrequestと失敗したrequestのlatencyは分けて見る。
失敗requestは早く失敗することもあり、成功requestだけが遅い問題を平均値の中に隠すことがある。

error rateも、数字だけでなく意味を見る。
4xxは利用者の入力、認可、存在しないresourceなどの問題で起きることがある。
5xxはサーバー側の失敗を示すことが多い。
すべての4xxを障害扱いする必要はないが、認可ロジックの変更後に403が急増したなら調査が必要である。
メトリクスは、数字そのものではなく、利用者体験の変化として読む。

metricのlabelにも注意する。
endpoint、status class、environmentのように集計したい単位はlabelに向いている。
一方で、request_id、user_id、email、自由入力文字列のように種類が増え続ける値は、metric labelに入れない。
種類が多すぎるlabelは、保管量、費用、集計の重さ、dashboardの読みにくさを増やす。
個別requestを追う情報は、metricsではなくlogsやtracesで扱う。

### SLIとSLOは、守りたい体験を測れる形にする道具である

SLIは Service Level Indicator の略で、service levelを測る指標である。
SLOは Service Level Objective の略で、その指標について守りたい目標である。
SLAは Service Level Agreement の略で、契約や対外的な合意を含むことが多い。
新人の段階では、まずSLIとSLOを自分の機能で説明できればよい。

SLOを考えるときは、サービス提供者の都合ではなく、利用者の行動から始める。
「ECS service（Fargate）のタスクが起動していること」は内部状態としては重要だが、利用者体験そのものではない。
「メンターが支援ステータス一覧を開いたとき、担当受講者の一覧が1秒以内に表示され、権限外の情報は出ないこと」の方が、体験に近い。

たとえば、研修用のSLO草案は次のように書ける。

```md
# SLO Draft

## User journey

メンターが支援ステータス一覧を開き、担当受講者の状態を確認する。

## SLI

`GET /api/mentor/learners` のうち、HTTP 2xxで成功し、server-side latencyが1000ms以下のrequest割合。

## SLO

直近7日間で、対象requestの99%がSLI条件を満たす。

## 除外

- 認証されていないrequest
- 権限外として拒否したrequest
- 講師が許可したメンテナンス時間

## まだ確認が必要なこと

- client-side latencyを測る仕組みがないため、現時点ではserver-side latencyで代用する。
- production trafficが少ない期間は、7日間のrequest数が十分か確認する。
```

この例で大切なのは、完璧な数値を最初から当てることではない。
何を成功とみなすか。
どの時間窓で見るか。
何を除外するか。
測れていないものをどう扱うか。
これを明示することで、レビュー可能な目標になる。

SLOを置くと、error budgetも考えられる。
error budgetは、SLOを満たしながら許容できる失敗の余地である。
たとえば「7日間で99%が成功」というSLOなら、単純化すると1%の失敗余地がある。
この余地を使い切っているなら、新機能を急いで出すより、障害原因、遅延、アラート、rollback手順を直す判断が必要になる。

ここで重要なのは、100%を安易に目標にしないことである。
100%を掲げると、計測上の揺れ、外部依存、メンテナンス、利用者側のネットワーク、実装変更のリスクをすべて失敗扱いにしやすい。
現実のserviceでは、利用者に必要な信頼性と、開発速度、費用、運用負荷のバランスを取る。
新人の段階では、厳密なerror budget運用を作る必要はない。
しかし、SLOを超えて悪化したら何を止め、何を優先するかを `slo-and-alert-note.md` に書く。

### ダッシュボードは、見る人の判断に合わせて作る

ダッシュボードは、グラフを並べる場所ではない。
見る人が次の判断をするための画面である。
確認したい問いが違えば、必要なパネルも違う。

開発者がdeploy直後に見るダッシュボードなら、直近のimage tag、deploy時刻、request count、5xx error rate、p95 latency、主要endpoint別の失敗、CloudWatch Logsへのリンクが欲しい。
メンターや運用担当がサービス状態を見るダッシュボードなら、利用者影響、主要ユーザー行動の成功率、遅延、アラート状態、既知のインシデントが重要になる。

支援ステータス一覧の最低限のダッシュボードは、次のように考えられる。

```md
# Dashboard Plan

## 目的

支援ステータス一覧が、利用者にとって使える状態かを確認する。

## Panels

| panel | question | source |
| --- | --- | --- |
| request count | 普段どおり使われているか | CloudWatch metrics / app metrics |
| error rate | 失敗が増えていないか | status code metrics |
| p95 latency | 遅くなっていないか | duration_ms / service metrics |
| saturation | resourceが限界に近くないか | CPU / memory / DB connection |
| recent errors | 何が失敗しているか | CloudWatch Logs |
| deploy marker | いつ変更を出したか | image_tag / release note |
```

良いダッシュボードは、普段から見るものと、問題時に詳しく調べるものを分ける。
すべての情報を一枚に詰め込むと、結局誰も読まなくなる。
最初の一枚では、利用者影響、直近変化、調査の入口に絞る。

### アラートは、人を起こす理由を説明できるものだけにする

アラートは、多ければ安心というものではない。
頻繁に鳴るが行動につながらない通知は、やがて無視される。
本当に重要な問題が起きたときにも見逃される。

アラートを設計するときは、次の問いに答える。

- これは利用者影響につながるか。
- 通知を受けた人は、何を確認し、何を実行できるか。
- どのくらい続いたら問題とみなすか。
- 一時的な揺れで鳴りすぎないか。
- 発火したら、どのrunbookを見るか。
- 通知しないがダッシュボードで見るだけでよい状態は何か。

たとえば、`5xx error rate > 5% for 5 minutes` は、条件だけなら簡単に書ける。
しかし、trafficが少ない時間帯に1件だけ失敗しても割合は大きく見える。
そのため、最小request数や時間窓も一緒に考える。
`p95 latency > 1000ms for 10 minutes` も、対象endpoint、環境、除外条件、対応手順が必要である。

CloudWatch alarmのような仕組みでは、thresholdだけでなく、period、evaluation periods、datapoints to alarmも決める。
periodは一つのdata pointを作る時間幅である。
evaluation periodsは直近いくつのdata pointを見るかである。
datapoints to alarmは、そのうち何個が条件を満たしたらalarm状態にするかである。
たとえば「1分ごとのdata pointを5個見て、そのうち3個がthresholdを超えたら鳴らす」といった設計ができる。
この設定を考えずにthresholdだけを決めると、一瞬の揺れで鳴りすぎたり、逆に検知が遅れたりする。

アラートには、severity、owner、notification先、runbook、最初の確認をセットにする。
`critical` なら利用者影響が強く、すぐに見る必要がある。
`warning` なら営業時間内に確認すればよいかもしれない。
すべてをcriticalにすると、結局誰も信じなくなる。

アラートは、SLOとつなげて考える。
SLOに影響する状態なら通知する理由を説明しやすい。
SLOに関係しない内部指標でも、resource枯渇やDB接続失敗のように、近いうちに利用者影響へつながるものは通知対象になり得る。
逆に、見るだけでよい情報はダッシュボードへ置く。

### 遅いAPIを、感想ではなく証拠で調査する

「支援ステータス一覧が遅い」という報告が来たとする。
この時点では、まだ原因は分からない。
遅いという言葉には、画面全体が重い、APIが遅い、DBが遅い、認証が遅い、外部APIが遅い、初回表示だけ遅い、一部のメンターだけ遅い、などが含まれる。

まず、症状を具体化する。
どの画面か。
どの操作か。
どの環境か。
いつからか。
全員か一部か。
直前にdeployはあったか。
データ件数は増えているか。
request_idやtrace_idは取れているか。

次に、改善前の数値を取る。
改善前を測らずに直すと、直ったことを説明できない。
最低限、対象期間、request count、error rate、p50、p95、p99、主なstatus、対象image tagを記録する。

```md
# Slow API Investigation

## 対象

- **endpoint**：GET /api/mentor/learners
- **environment**：production
- **time range**：2026-06-25 09:00-10:00 JST
- **image tag**：app-3f6c9a1

## 症状

メンターが支援ステータス一覧を開くと、表示まで数秒かかることがある。

## 改善前の数値

| metric | value | source |
| --- | --- | --- |
| request count |  |  |
| error rate |  |  |
| p50 latency |  |  |
| p95 latency |  |  |
| p99 latency |  |  |

## 仮説

| hypothesis | evidence | result |
| --- | --- | --- |
| DB queryが遅い |  |  |
| N+1 queryが起きている |  |  |
| 外部APIが遅い |  |  |
| data volumeが増えた |  |  |
| deploy差分で処理が増えた |  |  |

## 修正案

-

## 改善後の数値

| metric | before | after |
| --- | --- | --- |
| p50 latency |  |  |
| p95 latency |  |  |
| p99 latency |  |  |
```

仮説は、思いつきで終わらせない。
DB queryが遅いなら、query logや実行計画、対象件数を見る。
N+1 queryなら、request一回あたりのquery数を見る。
外部APIが遅いなら、外部呼び出しspanのdurationを見る。
data volumeなら、対象メンターごとの件数やpaginationの有無を見る。
deploy差分なら、直近commitとimage tagを確認する。

修正PRには、変更内容だけでなく、症状、再現条件、改善前数値、原因、修正、改善後数値、残る課題を書く。
「速くしました」ではなく、「p95が2.4秒から620msに下がった。ただしproduction trafficが少ないため翌日再確認する」のように、証拠と制約をセットで書く。

### インシデント対応は、まず影響を小さくする

問題が起きたとき、最初の目的は犯人探しではない。
利用者影響を把握し、影響を小さくし、復旧へ向かうことである。
原因調査は必要だが、影響が続いている最中に、すべてを完全に解明しようとすると対応が遅れる。

インシデント対応では、次の順に考える。

1. 何が起きているかを短く表す。
2. 誰に、どの範囲で、どの程度影響しているかを見る。
3. すぐに影響を下げる一時対応を選ぶ。
4. 復旧したかを観測データで確認する。
5. 事実のtimelineを残す。
6. 恒久対応と再発防止を決める。

小さなチームでも、対応中の役割を分けると混乱しにくい。
一人がすべてを抱えるのではなく、可能なら次の役割を置く。

- **状況整理**：何が起きているか、影響範囲、次の判断をまとめる。
- **調査**：logs、metrics、traces、recent deploy、DB状態を見る。
- **復旧作業**：rollback、roll forward、feature off、設定変更を実行する。
- **連絡**：関係者へ、事実、影響、次の更新時刻を共有する。
- **記録**：時刻、見た証拠、判断、実行結果をtimelineに残す。

研修では一人で担当することもある。
その場合でも、メモ上では役割を分けて書く。
「今は調査しているのか」「復旧判断をしているのか」「共有文を作っているのか」が混ざると、対応が荒くなる。

たとえば、直近deploy後に支援ステータス一覧が5xxを返しているなら、まず対象環境、対象endpoint、error rate、開始時刻、直近deploy、rollback可否を見る。
原因が完全に分からなくても、previous image tagへ戻せるなら、利用者影響を止める判断が先になることがある。
一方で、DB migrationのように戻せない変更がある場合、rollbackは慎重に判断する。
第16章のrelease runbookがここで効く。

対応中のメモは、きれいな文章でなくてよい。
時刻、見たもの、判断、実行したこと、結果を残す。
あとでインシデントレビューを書くとき、記憶ではなくtimelineをもとに振り返れる。

### インシデントレビューは、責任追及ではなく次の設計である

インシデントレビュー、またはポストモーテムは、誰が悪かったかを決める文書ではない。
何が起き、どの情報で気づき、どの判断をし、何が足りず、次に何を改善するかを残す文書である。
Google SREのポストモーテム文化でも、学習と再発防止が中心にある。

レビューでは、まず事実を書く。
発生時刻、検知時刻、復旧時刻、影響範囲、利用者影響、対応者、環境、関連するdeploy、関連するアラートを整理する。
次に、timelineを書く。
いつ誰が何を見て、何を判断し、何を実行し、結果がどう変わったかを並べる。

そのうえで、原因と再発防止を書く。
原因は一つとは限らない。
コードの不具合、テスト不足、SLO未定義、アラート不足、ログ不足、runbook不足、review観点不足が重なることがある。
人の注意不足だけで終わらせると、次も同じ条件で失敗する。

```md
# Incident Review Note

## Summary

-

## Impact

- affected users:
- affected feature:
- start:
- detected:
- mitigated:
- recovered:

## Timeline

| time | event | evidence |
| --- | --- | --- |
|  |  |  |

## What went well

-

## What was difficult

-

## Missing telemetry

-

## Action items

| action | owner | due | type |
| --- | --- | --- | --- |
|  |  |  | code / test / alert / runbook / docs |
```

action itemは、反省文ではなく作業にする。
ログfieldを追加する。
SLOを見直す。
アラート条件を調整する。
slow API testを追加する。
rollback手順をrunbookへ追記する。
PR templateに性能確認欄を追加する。
このように、次に誰が何を変えるかまで落とす。

### AIは調査を助けるが、観測データの代わりにはならない

AIは、ログの要約、メトリクスの読み方、調査仮説、CloudWatch Logs Insightsのquery案、インシデントレビューの下書きに使える。
ただし、AIに貼ってよい情報と貼ってはいけない情報を分ける。
secret、token、password、個人情報、AWS account id、内部URL、未公開の障害詳細をそのまま貼らない。
必要なら匿名化し、最小限の情報にする。

AIの仮説は、証拠ではない。
「N+1 queryかもしれません」とAIが言ったとしても、ログ、trace、DB query数、コード差分で確認する。
「このCloudWatch queryで調べられます」と提案されたら、field名、料金、対象log group、時間範囲、結果の解釈を自分で確かめる。
観測データを読む章で、AIの文章を観測データの代わりにしてはいけない。

AIへ依頼するなら、次のように境界を明示する。

```md
次の匿名化したログfieldとメトリクスをもとに、遅延原因の仮説を整理してください。
禁止事項:
- 存在しない事実を断定しない
- 個人情報やsecretを推測しない
- 確認すべき追加データを分けて書く
- 修正案は、確認方法と一緒に出す

出力:
- 観察できる事実
- 可能性のある仮説
- 仮説ごとの追加確認
- すぐに試せる一時対応
- 恒久対応の候補
```

これは第3章と第18章につながる。
AIを使うほど、観測データ、検証、採否の記録が重要になる。

### observability-goals.mdに書くこと

`observability-goals.md` は、何を観察したいかを先に決める文書である。
ログやダッシュボードを作る前に、重要なユーザー行動を選ぶ。
支援ステータス一覧なら、メンターが担当受講者の状態を確認できることが中心になる。

```md
# Observability Goals

## Scope

- environment: local / staging / production / 想定手順
- feature:
- owner:
- related release-runbook:

## User journeys

| user journey | why it matters | endpoint / view | impact if broken |
| --- | --- | --- | --- |
|  |  |  |  |

## SLI / SLO draft

| journey | SLI | SLO draft | window | exclusion | error budget note |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Current measurement

| item | can measure now | source | gap |
| --- | --- | --- | --- |
| success rate |  |  |  |
| latency p95 |  |  |  |
| request count |  |  |  |
| error count |  |  |  |

## Unknowns

- 
```

この文書の目的は、すべてを測ることではない。
何を大事にするかを選ぶことである。
重要な行動が決まっていない状態では、ログもメトリクスも散らばる。

### telemetry-plan.mdに書くこと

`telemetry-plan.md` には、ログ、メトリクス、トレースへ何を出すかを書く。
同時に、何を出さないかも書く。
観測設計は、情報を増やす作業であると同時に、出してはいけない情報を止める作業でもある。

```md
# Telemetry Plan

## Logs

| field | reason | example | allowed |
| --- | --- | --- | --- |
| timestamp | 時系列で追う | 2026-06-25T10:15:30Z | yes |
| level | 重要度を分ける | info / warn / error | yes |
| request_id / requestId | requestを追う | req_xxx | yes |
| trace_id | traceと結びつける | trace_xxx | yes |
| endpoint | 対象APIを見る | /api/mentor/learners | yes |
| status | 成功/失敗を見る | 200 / 500 | yes |
| duration_ms / durationMs | 遅延を見る | 184 | yes |
| image_tag / version | releaseと結びつける | app-3f6c9a1 | yes |
| environment | 環境を分ける | staging | yes |
| user name | 個人情報に当たる |  | no |
| token | secretである |  | no |

## Log level rule

| level | when to use | example |
| --- | --- | --- |
| info | 通常のrequest完了 | 200 response |
| warn | 失敗前に調査したい状態 | retry, slow request |
| error | request失敗や復旧対象 | 5xx, DB connection failure |

## Metrics

| metric | type | labels | reason |
| --- | --- | --- | --- |
| request count | counter | endpoint, environment | trafficを見る |
| success rate | ratio | endpoint, environment | 主要操作が成功しているか |
| error rate | ratio | endpoint, status_class, environment | 失敗の増加を見る |
| p50 / p95 / p99 latency | histogram or percentile metric | endpoint, environment | 遅さの分布を見る |
| CPU / memory | gauge | service, environment | saturationを見る |
| DB connection or query duration | gauge / histogram | db, environment | DBが詰まっていないか |

Metric labelに入れないもの:

- request_id
- user_id
- email
- 自由入力文字列
- tokenやsecret

## Traces

| span | reason | current status |
| --- | --- | --- |
| API handler | request全体を見る |  |
| authorization | 権限確認の遅延や失敗を見る |  |
| database query | DBが遅いか見る |  |
| external API call | 外部依存を見る |  |

## Local sample observation

| endpoint | expected | observed log / metric |
| --- | --- | --- |
| `/healthz` | process alive |  |
| `/readyz` | ready |  |
| `/api/work?delayMs=300` | delayed 200 |  |
| `/api/flaky?fail=true` | 500 and error metric |  |
| `/metrics` | counters and average latency |  |

## CloudWatch location

- log group:
- dashboard:
- alarms:
- SLO / Application Signals, if used:
```

field名はプロジェクトに合わせてよい。
ただし、調査で使うfieldと禁止fieldを明記する。
「ログに気をつける」では弱い。
どの値を出し、どの値を出さないかを書く。

### slo-and-alert-note.mdに書くこと

`slo-and-alert-note.md` では、SLOとアラートを一緒に扱う。
SLOは守りたい体験の目標であり、アラートは人が動くきっかけである。
二つが切り離されていると、目標はあるが気づけない、通知はあるが重要度が分からない、という状態になる。

```md
# SLO and Alert Note

## User journey

-

## SLI

-

## SLO

-

## Error budget note

- SLOを外してよい余地:
- 使い切りそうなときに止めること:
- 優先する信頼性対応:

## Dashboard panels

| panel | metric/log | why | first action |
| --- | --- | --- | --- |
| availability | success rate | 主要操作が成功しているか | error logを見る |
| latency p95 | latency percentile | 利用者が待たされていないか | slow API investigationへ |
| error rate | 5xx / 4xx rate | 失敗が増えていないか | recent deployとlogsを見る |
| traffic | request count | 通常と違う使われ方か | 急増/急減を見る |
| saturation | CPU / memory / DB connection | resourceが限界に近いか | scaleや処理を確認する |
| deploy marker | image tag / release note | deployと変化を結びつける | release-runbookを見る |

## Alerts

| alert | condition | period | evaluation | datapoints to alarm | owner | action | runbook |
| --- | --- | --- | --- | --- | --- | --- | --- |
| high error rate |  |  |  |  |  |  |  |
| high latency |  |  |  |  |  |  |  |

## SLO violation handling

-
```

アラート条件は、必ず行動とセットにする。
通知を受けた人が何もできないなら、条件を見直す。
runbookへのリンクや、最初に見るログ、rollback判断の基準を近くに置く。

### slow-api-investigation.mdに書くこと

`slow-api-investigation.md` は、遅さを証拠で調べる文書である。
遅いという感想を、対象、時間、環境、数値、仮説、確認、修正、改善後の比較へ変える。

この文書では、beforeとafterを必ず分ける。
改善前のp95が分からなければ、改善後に良くなったとは言いにくい。
error rateが増えていないかも見る。
速度だけ上げて失敗が増えたなら、改善とは言えない。

PR本文に転用できる形で書くとよい。

```md
# Slow API Investigation

## Target

- endpoint:
- environment:
- time range:
- image tag / version:
- data size:
- measurement method:

## Before

| metric | value | source |
| --- | --- | --- |
| request count |  |  |
| error rate |  |  |
| p50 latency |  |  |
| p95 latency |  |  |
| p99 latency |  |  |

## Hypotheses

| hypothesis | evidence to check | result |
| --- | --- | --- |
| DB queryが遅い | query duration, rows, index |  |
| N+1 queryが起きている | query count per request |  |
| 外部APIが遅い | external span duration |  |
| data volumeが増えた | row count, pagination |  |
| deploy差分で処理が増えた | code diff, image tag |  |

## After

| metric | before | after | source |
| --- | --- | --- | --- |
| p50 latency |  |  |  |
| p95 latency |  |  |  |
| p99 latency |  |  |  |
| error rate |  |  |  |

## Confidence and limitations

- sample size:
- time range difference:
- still unmeasured:

## PR Summary

支援ステータス一覧APIのp95 latencyが高くなっていたため、DB queryを見直した。

## Evidence

- before p95:
- after p95:
- request count:
- error rate:
- related logs:
- related trace:

## Cause

-

## Fix

-

## Remaining risk

-
```

この書き方は、レビューする人にも役立つ。
変更差分だけでなく、なぜその変更が必要で、何で改善を確認したかが分かる。

### incident-review-note.mdに書くこと

`incident-review-note.md` は、インシデントを次の改善へ変える文書である。
障害が大きくなかったとしても、練習として小さなincident reviewを書く価値がある。
たとえば、stagingでdeploy後に一覧APIが5xxを返した、アラートが鳴らなかった、ログにrequest_idがなく調査に時間がかかった、という程度でもよい。

書くべきことは、事実、影響、timeline、一時対応、恒久対応、足りなかった観測、action itemである。
誰が悪かったかではなく、次はより早く気づき、より安全に戻し、より少ない影響で直せるかを見る。

action itemは、必ず所有者と期限を持たせる。
所有者が決まっていない改善は、だいたい残らない。
研修では実名でなく担当ロールでもよい。
文書は、改善PR、runbook更新、テスト追加、アラート調整へつながる必要がある。

```md
# Incident Review Note

## Summary

-

## Scope

- environment:
- severity draft:
- owner:
- detection source:
- related release:

## Impact

| item | detail |
| --- | --- |
| affected users |  |
| affected feature |  |
| data impact |  |
| start time |  |
| detected time |  |
| mitigated time |  |
| recovered time |  |

## Timeline

| time | event | evidence |
| --- | --- | --- |
|  |  |  |

## Response

| type | action | result |
| --- | --- | --- |
| mitigation |  |  |
| rollback / roll forward / feature off |  |  |
| communication |  |  |

## What went well

-

## What was difficult

-

## Missing telemetry

- logs:
- metrics:
- traces:
- dashboard:
- alert:
- runbook:

## Action items

| action | owner | due | type | verification |
| --- | --- | --- | --- | --- |
|  |  |  | code / test / alert / runbook / docs |  |
```

### 観測とSREで起きやすい誤解

- 観測ツールを入れればオブザーバビリティがあると考える。必要なsignalをアプリが出していなければ調査できない。
- ログをたくさん出せば安心だと考える。調査に必要なfieldと、出してはいけない情報を分ける。
- errorだけをログに出す。成功requestのdurationや件数がないと、遅さや普段との差を説明しにくい。
- log field名がばらばらでも後で何とかなると思う。query、dashboard、PR説明で同じfield名を使えるようにする。
- 平均latencyだけを見る。p95、p99を見ないと、一部利用者の遅さを見逃しやすい。
- request_idやuser_idをmetric labelに入れる。種類が増え続ける値はlogsやtracesで扱う。
- sample数が少ないのにp95やerror rateを断定する。期間、request count、測定条件を書く。
- SLOをサーバー都合で決める。利用者が何をできればよいかからSLIを選ぶ。
- SLOを100%にするのが正しいと思い込む。必要な信頼性、費用、変更速度、運用負荷のバランスを見る。
- error budgetを計算ごっことして扱う。悪化したときに何を止め、何を優先するかへつなげる。
- アラートを増やせば安全だと考える。行動できない通知は疲労を生む。
- アラート条件をthresholdだけで決める。period、evaluation、datapoints to alarm、owner、runbookも必要である。
- ダッシュボードをグラフ置き場にする。見る人が次に判断できる配置にする。
- request_idやtrace_idを入れず、複数ログを目で追う。
- CloudWatchの画面を開いただけで観測できたと思う。どの時間帯、どの環境、どのservice、どのimage tagかを確認する。
- ECSやX-Rayの画面があるだけでtraceが取れていると思う。アプリ側のinstrumentationとspan設計を確認する。
- 遅いという感想だけで修正する。改善前後の数値を取る。
- インシデントレビューを反省会にする。事実、影響、原因、action itemへ落とす。
- インシデント対応中に、調査、復旧、連絡、記録を一人の頭の中で混ぜる。小さな演習でも役割を分けて書く。
- AIにログや内部情報をそのまま貼る。匿名化し、秘密情報と個人情報を除く。
- AIの仮説を原因として採用する。ログ、メトリクス、トレース、コード差分で検証する。

### テレメトリとインシデント記録で確認すること

この章では、`observability-goals.md`、`telemetry-plan.md`、`slo-and-alert-note.md`、`slow-api-investigation.md`、`incident-review-note.md` を作る。

最初に、第16章の `release-runbook.md` と `cloud-config-and-secrets.md` を読み直す。
どのenvironmentへdeployしたか、どのimage tagか、CloudWatch Logsをどこで見るか、secretや個人情報をどこへ出してはいけないかを確認する。
次に、第11章のAPI契約、第12章の画面状態、第13章のテスト観点を読み直し、利用者にとって重要な行動を一つ選ぶ。

`observability-goals.md` には、重要なユーザー行動、対象画面、対象endpoint、壊れたときの利用者影響、SLI/SLO草案、測定期間、まだ測れないことを書く。
SLOには、除外条件、error budgetの考え方、悪化したときに優先する信頼性対応も書く。

`telemetry-plan.md` には、ログfield、メトリクス、トレース対象、CloudWatch上の場所、ログに出さない値を書く。
request_id、trace_id、endpoint、status、duration_msまたはdurationMs、image_tagまたはversion、environmentを候補にする。
metric labelには、request_id、user_id、email、自由入力文字列、secretを入れない。
実AWS環境がない場合は、`ops-observability-sample` の `/healthz`、`/readyz`、`/api/work`、`/api/flaky`、`/metrics` で観察した結果と、クラウドではまだ確認できていない項目を分ける。

`slo-and-alert-note.md` には、SLO、dashboard panel、alert condition、通知後の行動、runbookへの接続を書く。
high error rateとhigh latencyは最低限検討する。
アラートには、period、evaluation periods、datapoints to alarm、owner、severity、最初に見るlogやdashboardを書く。

`slow-api-investigation.md` には、対象endpoint、環境、期間、image tag、症状、改善前のp50/p95/p99、error rate、仮説、確認した証拠、修正案、改善後の数値、PR本文の草案を書く。
request count、測定方法、測定期間の違い、まだ測れていないものも書く。

`incident-review-note.md` には、事実、影響、timeline、一時対応、恒久対応、足りなかったtelemetry、action itemを書く。
実際の障害がなければ、stagingで起きた想定incidentを使ってよい。
ただし、実際に起きたことと想定を混ぜない。
action itemにはowner、期限、種類、完了確認方法を書く。

実AWS環境を使わない場合でも、この章の成果物は作れる。
CloudWatchの実画面がないなら、想定するlog field、metrics、dashboard、alarm、investigation workflowを文書化する。
実行していないqueryや確認を、実行済みのように書かない。

### オブザーバビリティとSREの章で持ち帰ること

第17章で身につけるべきことは、リリース後のシステムを、感想ではなく観測データで説明することである。
監視は異常に気づく仕組みであり、オブザーバビリティは問題を調べられる性質である。
ログ、メトリクス、トレースは、それぞれ出来事、数値、処理の流れを見る。
request_idとtrace_idは、ばらばらの記録を一つの操作へつなげる。
ただし、ツールの画面があるだけでは足りない。
log field、metric label、span、dashboard、alarm、runbookを、利用者にとって重要な行動へ結びつける必要がある。

SREの考え方では、利用者にとって大事な行動をSLIとSLOで表す。
latency、traffic、errors、saturationは、ユーザー行動に結びつけて初めて意味を持つ。
SLOは100%を目指す標語ではなく、必要な信頼性と変更速度のバランスを話すための基準である。
error budgetを使うと、SLOを外しそうなときに新機能より信頼性対応を優先する判断を説明しやすくなる。
ダッシュボードは見る人の判断に合わせ、アラートは人が行動すべき状態だけに絞る。
アラートにはthresholdだけでなく、period、evaluation、owner、runbookを書く。

遅いAPIを調査するときは、症状、環境、時間、image tag、改善前数値、仮説、証拠、修正、改善後数値を残す。
インシデントレビューは責任追及ではなく、事実と学習を次の改善へ変える文書である。
AIは調査を助けられるが、観測データと検証の代わりにはならない。

### LLMと生成AIの基礎の章へ

次章では、LLMと生成AIの基礎へ進む。
AIを使うと、文章やコードの候補は速く増やせる。
しかし、出力が正しいか、安全か、根拠があるかは、人が観察し、評価し、証拠を残す必要がある。
第17章で扱った「見える情報から状態を判断する」姿勢は、そのままAI利用の評価にもつながる。

### 参考資料

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE Book: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [Google SRE Book: Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [Google SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE Workbook: Error Budget Policy for Service Reliability](https://sre.google/workbook/error-budget-policy/)
- [OpenTelemetry: What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/)
- [OpenTelemetry: Signals](https://opentelemetry.io/docs/concepts/signals/)
- [Amazon ECS: What is Amazon Elastic Container Service?](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [Amazon ECS: Monitor Amazon ECS using Container Insights](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-container-insights.html)
- [AWS X-Ray: What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)
- [Amazon CloudWatch User Guide: What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [Amazon CloudWatch Logs: Analyzing log data with Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
- [Amazon CloudWatch Logs Insights query syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [Amazon CloudWatch: Using alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html)
- [Amazon CloudWatch: Alarm evaluation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarm-evaluation.html)
- [Amazon CloudWatch: Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)
- [Amazon CloudWatch: Service level objectives](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-ServiceLevelObjectives.html)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)

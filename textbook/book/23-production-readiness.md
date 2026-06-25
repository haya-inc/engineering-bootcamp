---
title: "第23章 Production Readiness Review"
part: 6
partLabel: "Part 6 最終プロジェクト"
order: 23
---

第21章では、自由テーマの個人開発プロジェクトを作った。
第22章では、そのプロダクトを既存プロダクトとして扱い、status追加のような小さな改善を安全に入れる型を学んだ。
第23章では、その改善PRをrelease candidateとして扱い、出してよいかを判断する。

Production Readiness Review、略してPRRは、本番前に止める理由が残っていないかを確認する作業である。
ここでの本番は、大規模な商用サービスだけを意味しない。
研修の個人課題でも、誰かに見せる、レビューしてもらう、デモで使う、クラウド環境へ置くなら、出す前の確認が必要になる。
動くことと、出してよいことは違う。
一度だけ手元で動いたとしても、危険な入力を保存できる、READMEが古い、エラー時にどこを見ればよいか分からない、戻し方がないなら、まだ出す判断は弱い。

この章のPRRは、正式な監査ではない。
ペネトレーションテストでも、大規模負荷試験でも、24時間オンコール設計でもない。
新人研修の個人プロジェクトとして、セキュリティ、アクセシビリティ、性能、観測、運用、文書、戻し方を横断して確認し、リリース判断の根拠を説明できる状態を作る。

題材は、第22章の改善PRである。
学習ログ整理アプリに `status` を追加し、`needs-help` のログだけを絞り込めるようにした。
既存ログは `learned` 扱いにした。
不正なstatusは保存しない。
READMEも更新した。
この改善を、release candidateとしてPRRにかける。

### この章を読み終えるとできるようになること

- release candidateを、変更内容、非対象、環境、artifact、証拠で固定できる。
- security、accessibility、performance、observability、operations、documentationの六観点で、確認結果とblockerを整理できる。
- skipped checkを隠さず、理由、リスク、owner、期限つきfollow-upへ変換できる。
- secret、個人情報、本番データ、AWS account id、内部URLを、提出物やAI入力に含めない判断ができる。
- smoke testを、既存互換性、新機能価値、問題時の一次対応が見える短い手順にできる。
- runbookに、前提、実行条件、問題時の分岐、rollbackまたはroll forward、cleanupを書ける。
- go、go with follow-up、no-goを、証拠、blocker、accepted risk、follow-upで説明できる。

### PRRはチェックリスト消化ではなく判断作業である

PRRをチェックリストの消化だと考えると、形だけになる。
securityは見た、accessibilityは見た、performanceは見た、という丸付けだけでは、出してよい理由にならない。
大切なのは、確認したこと、確認できていないこと、受け入れるリスク、先に直すblocker、リリース後に追うfollow-upを同じ表で見られるようにすることである。

AWS Well-Architected Frameworkは、クラウド上の構成について、意思決定の長所と短所を理解し、改善点を見つけるための枠組みである。
その説明では、レビューは監査ではなく、アーキテクチャ上の意思決定についての建設的な会話だとされている。
この章のPRRも同じ姿勢で扱う。
誰かを責めるためではなく、リリース判断を説明可能にするために行う。

PRRの結論は、三つに分ける。
goは、このまま進めてよいという判断である。
go with follow-upは、出せるが、追跡すべき残課題があるという判断である。
no-goは、今は出さず、先に直すべきblockerがあるという判断である。

この三つの違いを、気分で決めない。
証拠、影響、残課題、追跡方法で決める。

### この章で扱う範囲

この章では、PRRを次の順で進める。

```txt
release candidate summary
  -> production readiness checklist
    -> security and accessibility readiness
      -> performance and observability readiness
        -> release runbook
          -> smoke test plan
            -> release decision
              -> follow-up issues
```

最初に、release candidate summaryで確認対象を固定する。
何をリリースするのか、何を含めないのか、どの環境で確認するのかを決める。
次に、production readiness checklistで、security、accessibility、performance、observability、operations、documentationの六つの観点を並べる。
その後、security/accessibilityとperformance/observabilityを少し詳しく確認する。
最後に、release runbook、smoke test plan、release decision、follow-up issuesを作る。

この章では、専門家レベルの監査までは扱わない。
正式なセキュリティ監査、ペネトレーションテスト、大規模負荷試験、法務審査、24時間オンコール設計は範囲外である。
ただし、範囲外だから無視するのではない。
必要ならfollow-upにし、今回の判断にどう影響するかを書く。

### Release Candidateを固定する

リリース前確認では、まず確認対象を固定する。
何を出すのかが曖昧だと、確認観点も曖昧になる。
status追加を出すのか。
タグ検索も一緒に出すのか。
通知は含めるのか。
AWS環境に出すのか、ローカルデモまでなのか。
ここが曖昧だと、最後のgo/no-go判断ができない。

`release-candidate-summary.md` は次の形で書く。

```md
# Release Candidate Summary

## Product

学習ログ整理アプリ

## Release Candidate

学習ログにstatusを追加し、`needs-help` のログだけを絞り込めるようにする。

## First Three Items

- **included change**：status追加、status絞り込み、既存ログの `learned` 扱い
- **not included**：通知、status変更履歴、多人数共有、大量データ最適化
- **checked environment**：local。AWSに出す場合はstaging相当の環境も確認する

## Artifact and Version

| item | value | evidence |
| --- | --- | --- |
| branch or PR |  | improvement PR |
| commit SHA or image tag |  | CI/CD log、ECR image tag |
| migration note version |  | `migration-note.md` |
| release note version |  | `release-note.md` |

## Changes Included

- `draft`、`learned`、`needs-help` のstatusを扱う
- 一覧でstatus絞り込みができる
- 既存ログは `learned` として表示する
- README、migration note、release noteを更新する

## Not Included

- 通知
- status変更履歴
- 多人数共有
- 大規模負荷試験

## Main User Flows

| flow | why important | evidence |
| --- | --- | --- |
| ログ作成 | 既存の主要操作 | regression test、手動確認 |
| needs-help絞り込み | 今回の新しい価値 | 手動確認、必要ならtest |
| 既存ログ表示 | 互換性の確認 | migration note、手動確認 |

## Evidence Index

| evidence | status | link or note |
| --- | --- | --- |
| regression test plan | pass / fail / partial |  |
| security/accessibility readiness | pass / fail / partial |  |
| performance/observability readiness | pass / fail / partial |  |
| release runbook | ready / missing |  |
| smoke test plan | ready / missing |  |

## Known Issues

| issue | impact | decision |
| --- | --- | --- |
| 大量データ時の絞り込み性能は未計測 | ログが増えたとき遅くなる可能性 | follow-up |
| status変更履歴は未対応 | 過去の状態変化は追えない | accept |

## Environment

| environment | purpose | URL or service | checked? | evidence |
| --- | --- | --- | --- | --- |
| local | README手順と主要動作確認 | localhost | yes / no | command result |
| staging | 本番相当の事前確認 | 研修環境があれば記入 | yes / no / n/a | deploy log |
| AWS services | 実行環境、DB、ログ確認 | ECS（Fargate）、RDS、CloudWatch Logsなど | yes / no / n/a | console/log note |

## Inputs

- improvement PR:
- release note:
- migration note:
- regression test plan:
```

最初の三項目、included change、not included、checked environmentだけでも先に書く。
これで確認対象が固定される。
PRRでは、確認の深さより先に、確認対象の明確さが必要である。
artifactやcommit SHAが分からないままPRRをすると、何を確認したのか後から追えない。
研修ではURLやSHAを厳密にそろえられない場合もあるが、その場合も「localのこの作業ディレクトリで確認」「PRのこの差分で確認」のように書く。

### 環境を分けて書く

研修では、ローカルだけで確認する場合もある。
AWS環境を使う場合もある。
どちらでもよいが、環境を混ぜて書かない。

ローカルで確認したことは、localと書く。
staging相当の環境で確認したことは、stagingと書く。
AWSで確認したことは、service名と見る場所を書く。

AWS環境を使う場合は、Amazon ECS（Fargate 起動タイプ）、ECR、RDS、Secrets ManagerまたはParameter Store、CloudWatch Logsなどが関係する。
サービス名を暗記することが目的ではない。
どの環境で、どのログ、metrics、deploy historyを見るかを説明できることである。

### Readiness Checklistは六つの見方で作る

PRRのチェックリストは、確認を機械的に終わらせるためではない。
見落としを減らすために使う。
この章では、六つの観点を使う。

securityは、危ない使い方を防ぐ観点である。
不正な入力、権限外操作、secret、依存関係、ログの安全性を見る。

accessibilityは、使える人を不必要に減らしていないかを見る観点である。
キーボード操作、label、focus、error message、色だけに頼らない表示を見る。
WCAGはWebコンテンツをよりアクセシブルにするための国際標準で、WCAG 2.2ではperceivable、operable、understandable、robustという4原則のもとに検証可能な成功基準が整理されている。
研修ではすべての成功基準を網羅しないが、主要操作で明らかな障壁を作っていないかを見る。

performanceは、主要操作が現実的な速さで動くかを見る観点である。
大量データ時の懸念も書く。

observabilityは、問題が起きたときに追えるかを見る観点である。
ログ、metrics、events、deploy history、CloudWatch Logsなど、どこを見るかを書く。
Google SREの監視の章では、Four Golden Signalsとしてlatency、traffic、errors、saturationが挙げられている。
新人研修では本格的な監視基盤を作らなくても、主要操作が遅い、エラーが出る、リクエストが失敗する、容量や接続が詰まる、といった見方を持つ。

operationsは、リリース、確認、戻し、片付けの手順である。
documentationは、README、release note、runbook、migration noteが実装と合っているかを見る。

`production-readiness-checklist.md` は次の形で書く。

```md
# Production Readiness Checklist

## Decision Rule

| decision | condition |
| --- | --- |
| go | high severity blockerがなく、主要フローとsmoke testが確認済み |
| go with follow-up | blockerはないが、期限つきで追うskipped/partialがある |
| no-go | secret漏えい、権限外アクセス、既存データ消失、主要フロー失敗、戻し方不明などのblockerがある |

## Summary

| category | meaning | status | blocker? | evidence |
| --- | --- | --- | --- | --- |
| security | 危ない使い方を防ぐ | pass / fail / partial | yes / no |  |
| accessibility | 使える人を減らさない | pass / fail / partial | yes / no |  |
| performance | 主要操作が遅すぎない | pass / fail / partial | yes / no |  |
| observability | ログや数字で追える | pass / fail / partial | yes / no |  |
| operations | 手順どおり動かせる | pass / fail / partial | yes / no |  |
| documentation | 文書が実装と合っている | pass / fail / partial | yes / no |  |

## Checklist

| category | check | method | expected | result | severity |
| --- | --- | --- | --- | --- | --- |
| security | 不正なstatusを保存しない | test/manual | errorまたは拒否 | pass | high |
| accessibility | status選択にlabelがある | manual | keyboardとscreen readerで意味が伝わる | pass / partial | medium |
| performance | 一覧表示が極端に遅くない | manual | 主要操作が現実的に使える | pass / skipped | medium |
| observability | validation errorを追える | log確認 | secretなしで原因を追える | pass / partial | medium |
| operations | rollback手順がある | runbook review | 戻す対象が分かる | pass | high |
| documentation | READMEとrelease noteが更新済み | doc review | 実装と一致する | pass | medium |

## Skipped Checks

| check | reason | risk | owner | due | follow-up |
| --- | --- | --- | --- | --- | --- |
| 大量データ負荷試験 | 個人課題の範囲外 | 件数増加時に遅くなる可能性 |  |  | follow-up issueにする |
```

statusは、pass、fail、partialを使う。
resultは、pass、fail、skippedを使う。
skippedは悪いことではない。
理由とfollow-upがないskippedが危険なのである。
blockerは、severityだけで自動決定しない。
利用者影響、データ影響、戻しやすさ、検知しやすさを見て決める。
ただし、secret漏えい、権限外データアクセス、既存データ消失、主要フロー失敗は、no-go候補として扱う。

### Security Readinessは危ない使い方を防ぐ確認である

security readinessでは、攻撃名を並べるより、今回の変更で危ない使い方ができないかを見る。
status追加なら、不正なstatusを保存できないか。
担当外データを見られないか。
secretや個人情報がログ、Git、AI入力、READMEに混ざっていないか。
依存関係に明らかな問題がないか。
エラー表示が内部情報を出していないか。

OWASP ASVSは、Webアプリケーションの技術的セキュリティコントロールを検証するための基準であり、開発者に安全な開発要件のリストを提供する。
研修ではASVSのすべてを実施する必要はない。
ただし、入力検証、認可、secret、ログ、安全なエラー表示といった基本観点を、release前に見る。

`security-accessibility-readiness.md` のsecurity部分は次のように書ける。

```md
# Security and Accessibility Readiness

## Security Checks

| check | method | expected | result | evidence | release impact |
| --- | --- | --- | --- | --- | --- |
| input validation | 不正statusを送る | 保存しない、安全なエラー | pass / fail / skipped | test/manual result | failならblocker |
| authorization | 担当外データが見えないことを確認 | 権限外操作を拒否 | pass / fail / skipped | existing auth check | failならblocker |
| secret handling | `.env`、README、logsを確認 | secret値が出ていない | pass / fail / skipped | secretなし | failならblocker |
| dependency check | package audit等 | high/criticalを説明できる | pass / fail / skipped | command result | severityで判断 |
| logging safety | validation error logを見る | 個人情報やsecretなし | pass / fail / skipped | log sample | failならblocker候補 |

## Blockers

- 不正statusを保存できる場合はno-go。
- secretがREADMEやログに出ている場合はno-go。
- 権限外データが見える場合はno-go。
- 本番データや実在の個人情報を提出物やAI入力へ含めた場合はno-go。

## Follow-up

- dependency warningのうち、今回の変更に直接関係しないmedium以下はfollow-upとして追う。
```

Securityの判断では、failの扱いを分ける。
secret漏えい、権限外データ表示、不正な入力による破壊的な保存はblockerになりやすい。
一方、研修範囲外の詳細な依存関係調査はfollow-upにすることもある。
blockerやfollow-upは、理由を説明する。
AWS account idは、パスワードやAPIキーのようなsecretそのものではない。
しかし、公開教材やAI入力に不要に含めると、環境の特定につながる情報になる。
この研修では、AWS account id、内部URL、実ログのrequest idなどは、必要がなければ伏せて提出する。

### Accessibility Readinessは使える人を減らさない確認である

accessibility readinessでは、主要操作を使える人を不必要に減らしていないかを見る。
status絞り込みのUIを追加したなら、キーボードだけで操作できるか。
selectやradioにlabelがあるか。
focusが見えるか。
エラーが色だけでなく文字でも分かるか。
statusを色だけで表していないか。

研修では、アクセシビリティの専門監査まではしない。
しかし、基本的な確認はできる。

```md
## Accessibility Checks

| check | method | expected | result | evidence | release impact |
| --- | --- | --- | --- | --- | --- |
| keyboard operation | Tab、Enter、Spaceで操作 | 主要操作を完了できる | pass / fail / skipped | 手動確認 | failなら主要操作に影響 |
| labels | input/selectにlabelがある | status選択の意味が分かる | pass / fail / skipped | DOM/画面確認 | medium |
| focus visibility | focus位置が見える | 現在位置が分かる | pass / fail / skipped | 手動確認 | medium |
| error messages | 不正status時の説明がある | 何を直せばよいか分かる | pass / fail / skipped | 画面確認 | high |
| not color-only | statusが文字でも分かる | 色以外でも状態が分かる | pass / fail / skipped | 画面確認 | medium |

## Follow-up

- screen readerでの詳細確認はfollow-up。
```

accessibilityを「余裕があれば」にしない。
主要操作がキーボードでできない、エラーが読めない、色だけで状態を伝える、という問題は、利用者を直接困らせる。
リリース判断に含める。

### Performance Readinessは主要操作の現実性を見る

performance readinessでは、主要操作が現実的な速さで動くかを見る。
個人課題では、大規模負荷試験は範囲外でよい。
しかし、一覧表示が明らかに重い、不要に大量のデータを返している、status絞り込みで全件を何度も再計算している、という問題は見つけられる。

`performance-observability-readiness.md` のperformance部分は次のように書ける。

```md
# Performance and Observability Readiness

## Performance Checks

| flow | method | expected | actual | result | note |
| --- | --- | --- | --- | --- | --- |
| ログ一覧を開く | manual | 主要操作として待てる時間で表示 |  | pass / fail / skipped | サンプル件数で極端な遅さはない |
| needs-help絞り込み | manual | 操作後に一覧が更新される |  | pass / fail / skipped | 件数増加時はfollow-up |
| ログ作成 | manual | 保存後に一覧へ戻れる |  | pass / fail / skipped | validation error時も確認 |

## Data Growth Concern

| concern | current decision | follow-up |
| --- | --- | --- |
| ログ件数が増えると一覧が重くなる可能性 | MVPでは許容。大量データ試験は未実施 | paginationまたはindex検討 |
| status絞り込みがDB側か画面側か | 現状の実装に合わせて記録 | 件数増加時に再評価 |
```

performanceの確認では、測定できるなら測る。
測れないなら、手動確認と懸念を分ける。
「未確認だが問題ないと思う」と書かない。
未確認なら未確認としてfollow-upにする。
数値を取る場合は、環境、データ件数、操作、計測方法を書く。
ローカルの手動体感とstagingの計測値を同じ意味で扱わない。

### Observability Readinessは問題時に見る場所を決める

observability readinessでは、問題が起きたときにどこを見るかを決める。
ログ、metrics、events、deploy history、CloudWatch Logs、アプリの起動ログ、ブラウザのNetworkタブなどである。
CloudWatchは、AWS上のresourceやapplicationを監視し、metrics、alarms、dashboards、logsなどを使ってobservabilityを提供する。
ECS（Fargate）を使う環境では、CloudWatch LogsやCloudWatch metrics、EventBridge、CloudTrail、X-Rayなどと連携して観測できる。

個人課題では、全部を作り込まなくてよい。
ただし、少なくとも次を書く。

```md
## Observability Checks

| event or failure | where to look | expected signal | safe to share? | result |
| --- | --- | --- | --- | --- |
| app startup | terminal log / service log | startup success or error | yes / redact | pass / fail / skipped |
| request error | app log / browser Network | 4xx/5xxと原因候補 | yes / redact | pass / fail / skipped |
| validation error | app log / UI message | secretなしで原因を追える | yes / redact | pass / fail / skipped |
| deploy issue | deployment history / service events | failed deploy reason | yes / redact | pass / fail / skipped |

## Log Safety

- **secret**：ログへ出していない
- **個人情報**：架空データのみ
- **AWS account id**：secretではないが提出物には不要なら書かない
- **internal URL**：提出物には書かない

## Follow-up

- CloudWatch Logsでvalidation errorを確認する手順を第23章以降に整える。
```

observabilityでは、ログがあることだけでなく、ログが安全であることも見る。
secret、個人情報、AWS account id、内部URLを提出物やAI入力へ含めない。

### Operations Readinessは手順どおり動かせるかを見る

operations readinessでは、リリース前、リリース中、リリース後、問題時対応、rollback、cleanupを見る。
これは大げさな運用手順ではない。
誰が読んでも、次に何をすればよいかが分かる程度でよい。

`release-runbook.md` は次の形で書く。

```md
# Release Runbook

## Scope and Preconditions

- **release candidate**：
- **environment**：
- **operator**：
- **do not proceed if**：PRR blockerが残っている、secret漏えいがある、rollback方針が未記入

## Before Release

1. release candidate summaryを確認する。
2. regression test planの既存動作と新機能の確認を実行する。
3. security/accessibility readinessでblockerがないことを確認する。
4. README、migration note、release noteが更新されていることを確認する。

## Release

1. release candidateのbranchまたはcommitを確認する。
2. デプロイ対象環境を確認する。
3. デプロイまたは提出を実行する。

## After Release

1. smoke testを実行する。
2. ログまたはconsoleで明らかなエラーがないことを確認する。
3. release noteとknown issuesを共有する。

## If Something Goes Wrong

| symptom | severity | check | action | escalate if |
| --- | --- | --- | --- | --- |
| 一覧が開かない | high | app log、browser Network | releaseを止める、revert検討 | 原因が15分以内に分からない |
| 既存ログが消えたように見える | high | migration note、DB/data、filter状態 | no-goまたはrollback | 既存データ影響がある |
| 不正statusが保存できる | high | validation test | releaseを止めて修正 | データが破壊的に変わる |
| 表示が遅い | medium | request timing、DB query、件数 | follow-upまたはroll forward | 主要操作が完了できない |

## Rollback or Revert

status入力UI、絞り込みUI、保存処理、README更新を戻す。
データ変更がある場合、既存ログが読めることを先に確認する。
rollbackでデータ整合性が崩れる場合は、roll forwardでread-time fallbackやvalidationを直す。

## Cleanup

- 一時データやdebug logを消す。
- follow-up issuesを作る。
- release decisionを更新する。
- 研修用AWS resourceを使った場合、削除対象、削除担当、削除確認を記録する。
```

runbookは、問題が起きたときに読む。
だから、長い背景説明より、手順と判断条件が大切である。

### Smoke Testは短く主要動線を見る

smoke testは、リリース直後に短時間で主要動線が生きているかを見る最小確認である。
すべてのテストを再実行するものではない。
「出した直後に最低限これが通らなければまずい」という確認を三つ程度に絞る。

```md
# Smoke Test Plan

| order | action | expected result | actual result | pass/fail | failure action |
| --- | --- | --- | --- | --- | --- |
| 1 | 一覧画面を開く | 既存ログが表示される |  |  | releaseを止めてログ確認 |
| 2 | needs-helpで絞り込む | needs-helpのログだけが表示される |  |  | filter処理とqueryを確認 |
| 3 | 新しいログを作成する | statusつきで保存され一覧に表示される |  |  | create処理とvalidationを確認 |
```

smoke testは短くする。
長すぎると実行されなくなる。
短すぎると重要な故障に気づけない。
主要フロー、既存互換性、新機能の価値を1つずつ見るのが基本である。

### Release Decisionは証拠とリスクで書く

最後に、release decisionを書く。
ここで、go、go with follow-up、no-goのいずれかを決める。
判断には、理由、証拠、受け入れるリスク、blocker、follow-up owner and dateを書く。

```md
# Release Decision

## Decision

go with follow-up

## Decision Matrix

| item | status | effect on decision |
| --- | --- | --- |
| high severity blocker | none | go/go with follow-up可能 |
| smoke test | pass | go/go with follow-up可能 |
| skipped checks | documented | follow-upが必要 |
| accepted risks | documented | go with follow-upの根拠 |

## Reason

主要フロー、既存ログ表示、status保存、不正statusの拒否、README更新、smoke testは確認済み。
大量データ時の絞り込み性能は未確認だが、現時点の研修データ量ではblockerではないため、follow-upとして追う。

## Evidence

- **regression test plan**：existing behavior pass
- **security/accessibility readiness**：high severity blockerなし
- **smoke test**：pass
- **README**：updated
- **release note**：updated

## Accepted Risks

- 大量データ時の性能は未計測。
- CloudWatch Logsでのvalidation error確認はfollow-up。

## Blockers

- なし。

## Follow-up Owner and Date

| issue | owner | due | next action |
| --- | --- | --- | --- |
| 一覧件数増加時のperformance確認 |  |  | サンプル件数を増やして確認 |
| CloudWatch Logsでvalidation errorを確認する手順作成 |  |  | validation errorを発生させて見る場所を記録 |
```

no-goにする例も知っておく。
secretがログやREADMEに出ている。
既存ログが表示されない。
不正statusを保存できる。
主要操作がキーボードでできない。
rollback方針がなく、データ変更の影響が分からない。
こうした場合は、出すより先に直す。

### Follow-up Issuesは追跡可能にする

go with follow-upを選ぶなら、follow-upを追跡できる形にする。
「あとで見る」だけでは消える。
owner、期限、次の行動を書く。

```md
# Follow-up Issues

## Priority Guide

- **P1**：早めに追う。
- **P2**：次に余裕を見て追う。

| priority | issue | why | next action | owner | due | status |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | 大量データ時の絞り込み性能確認 | 件数増加時に一覧が遅くなる可能性 | サンプル件数を増やして計測 |  |  | open |
| P1 | CloudWatch Logs確認手順 | エラー時の一次調査を明確にする | validation errorを発生させて見る場所を記録 |  |  | open |
| P2 | status変更履歴 | 将来、状態変化を追いたい可能性 | 第24章後の改善候補へ入れる |  |  | open |
```

follow-up issueは、発表資料ではなく作業の入口である。
何が問題で、なぜ追うのか、次に何をするのかが必要になる。
可能なら、owner、due、statusも付ける。
ownerが決まらないfollow-upは、実質的に追跡されないことが多い。

### AIは抜け漏れ確認に使えるが、go判断は委ねない

AIは、PRRの抜け漏れ確認に使える。
security、accessibility、performance、observability、operations、documentationの観点を出してもらう。
smoke test候補を三つに絞ってもらう。
release decision文書の不足をレビューしてもらう。

ただし、AIの判断だけでgoにしない。
AIは、実際の環境、実行結果、ログ、差分、データの状態を、与えられない限り知らない。
AIが「出してよい」と言っても、release decisionにはならない。
人間が、実行結果、コード差分、ログ、公式資料、README、既知の問題を見て判断する。

AIに相談するときは、secret、実在の個人情報、本番データ、AWS account id、内部URLを入れない。
入力前、採用前、共有前、PR前の確認を行う。

```txt
第22章で作った改善PRについて、研修用のProduction Readiness Reviewを行います。

release candidate:
学習ログにstatusを追加し、needs-helpだけを絞り込めるようにする。

確認済み:
- 既存ログは表示される
- 新規ログにstatusを保存できる
- 不正なstatusは保存されない
- READMEは更新済み

未確認:
- 一覧件数が増えた場合の性能
- CloudWatch Logsでのエラー確認

お願い:
1. セキュリティ、アクセシビリティ、性能、ログ確認、運用手順、文書の観点で抜け漏れを挙げてください。
2. go / go with follow-up / no-go判断に必要な追加確認を提案してください。
3. smoke testを3項目に絞って提案してください。
4. release decision文書の不足をレビューしてください。
```

AIの出力を採用する前に、自分の成果物と照合する。
AIが挙げた確認を、実際にできるもの、今回はskipするもの、follow-upにするものへ分ける。

AIの抜け漏れ確認は、次の表に残す。

| AI suggestion | decision | reason | evidence or follow-up |
| --- | --- | --- | --- |
| CloudWatch Logsでvalidation errorを見る | follow-up | AWS環境では未確認 | follow-up issue |
| 不正statusの自動テストを追加する | adopt | release blockerになり得る | test result |
| 大規模負荷試験を行う | skip | 研修範囲外 | performance follow-up |

### PRRで起きやすい誤解

- PRRをチェックリストの丸付けだと考える。確認結果からgo、go with follow-up、no-goを判断する。
- release candidateを固定しない。何を出すのか、何を含めないのか、どの環境で見るのかを先に書く。
- artifactやcommitを記録しない。どの差分を確認したのか後で追えなくなる。
- 動いたことだけを証拠にする。security、accessibility、performance、observability、operations、documentationを見る。
- securityを専門家だけの仕事にする。入力検証、認可、secret、ログ安全性は開発者も見る。
- AWS account idをsecretと同じ扱いで誤解する。秘密鍵ではないが、公開提出やAI入力には不要なら載せない。
- accessibilityを最後に回す。主要操作のkeyboard、label、focus、error messageはリリース前に見る。
- performanceを大規模負荷試験だけと考える。主要操作の体感とデータ増加懸念から始める。
- observabilityを「ログがある」で終える。問題時にどこを見るか、ログが安全かを書く。
- runbookに背景説明だけを書く。リリース前、後、問題時、rollback、cleanupを手順にする。
- smoke testを長くしすぎる。主要動線を短く確認する。
- skippedを隠す。理由とfollow-upがあれば判断材料になる。
- follow-upにownerや期限を付けない。追跡されずに残リスクが放置される。
- AIの提案だけでgoにする。実行結果、差分、ログ、公式資料で確認する。
- go with follow-upのfollow-upを追跡しない。owner、期限、次の行動を書く。

### リリース判断と残リスクで確認すること

この章では、`release-candidate-summary.md`、`production-readiness-checklist.md`、`security-accessibility-readiness.md`、`performance-observability-readiness.md`、`release-runbook.md`、`smoke-test-plan.md`、`release-decision.md`、`follow-up-issues.md` を作る。

最初に、第22章の成果物を読む。
`change-impact-analysis.md` で、目的、範囲、互換性リスクを見る。
`regression-test-plan.md` で、既存動作と新機能の確認を見る。
`migration-note.md` で、既存データの扱いを見る。
`improvement-pr-summary.md` と `release-note.md` で、利用者に見える変化と残課題を見る。

次に、`release-candidate-summary.md` を作る。
included change、not included、checked environmentを最初に書く。
artifact、commit SHA、関連PR、証拠一覧も可能な範囲で書く。
主要ユーザーフローは三つ以内に絞る。
既知の問題は、accept、follow-up、blockのどれかに分ける。

次に、`production-readiness-checklist.md` を作る。
security、accessibility、performance、observability、operations、documentationの六観点を並べ、status、blocker、result、severityを書く。
skipped checkには理由、リスク、owner、due、follow-upを書く。

次に、`security-accessibility-readiness.md` と `performance-observability-readiness.md` を作る。
証拠、release impact、blocker、follow-upを分ける。
secret、個人情報、本番データ、AWS account id、内部URLを含めない。

最後に、`release-runbook.md`、`smoke-test-plan.md`、`release-decision.md`、`follow-up-issues.md` を作る。
release decisionでは、go、go with follow-up、no-goのどれかを選ぶ。
選んだ理由を証拠とリスクで説明する。

### Production Readiness Reviewで持ち帰ること

第23章で身につけるべきことは、作ったものを出してよいか判断する型である。
PRRは、正式な監査ではない。
しかし、動いたから出す、という短い判断を避けるための重要な作業である。

release candidateを固定し、主要ユーザーフローと既知の問題を整理する。
security、accessibility、performance、observability、operations、documentationの六観点で確認する。
確認できたこと、確認できなかったこと、skipped、blocker、accepted risk、follow-upを分ける。
runbookとsmoke testで、出す手順、出した後の確認、問題時の戻し方を用意する。
最後に、release decisionでgo、go with follow-up、no-goを証拠に基づいて決める。

この章のゴールは、すべての不安を消すことではない。
残る不安を言葉にし、受け入れるもの、先に直すもの、後で追うものに分けることである。
それが、リリース判断の根拠になる。

### 最終発表と次の学習計画の章へ

次章では、最終発表と次の学習計画を扱う。
第23章で作ったrelease candidate summary、readiness checklist、runbook、smoke test、release decision、follow-up issuesは、最終発表の重要な証拠になる。
何を作ったかだけでなく、出してよいかをどう確認したか、残るリスクをどう扱ったかを説明できると、発表は実務に近づく。

### 参考資料

- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Amazon ECS とは](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [Amazon ECS: Container Insights](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-container-insights.html)
- [Amazon CloudWatch User Guide: What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [W3C WAI: WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [W3C Recommendation: WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [NIST SP 800-218: Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

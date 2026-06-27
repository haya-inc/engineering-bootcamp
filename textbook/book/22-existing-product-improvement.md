---
title: "第22章 既存プロダクト改善"
part: 6
partLabel: "Part 6 最終プロジェクト"
order: 22
---

第21章では、自由テーマの個人開発プロジェクトを企画し、MVPを決め、最初の縦切り実装を動かし、セルフレビューとデモ台本まで作った。
第22章では、そのプロダクトを既存プロダクトとして扱う。
自分が作った小さなアプリであっても、いったん動く状態になり、READMEがあり、保存済みデータがあり、主要操作があるなら、それは守るべき現在の状態を持つ。

既存プロダクト改善では、新規開発とは違う力が必要になる。
新しい機能を作るだけでは足りない。
今ある画面、データ、API、確認手順、README、利用者の期待を壊さずに変える必要がある。
この章で扱うのは、作る力から、壊さず変える力への移行である。

題材は、第21章で作った学習ログ整理アプリを想定する。
このアプリには、学習ログを作成し、一覧で確認する流れがある。
今回の変更要求は、相談が必要なログを見つけやすくするため、`status` を追加し、一覧で `status` による絞り込みができるようにすることである。
`status` は `draft`、`learned`、`needs-help` の三種類にする。
既存ログは `learned` 扱いにする。

この変更は小さく見える。
しかし、UI、保存処理、APIまたはserver action、DB、既存データ、テスト、README、PR説明、release noteに影響する。
既存ログが一覧から消えたら困る。
今まで通りログを作れなくなったら困る。
不正なstatusを保存できても困る。
既存プロダクト改善では、この「困る」を実装前に見つけに行く。

### この章を読み終えるとできるようになること

- 既存プロダクトの「現在の約束」を、README、画面、API、データ、テスト、確認ログから棚卸しできる。
- 変更要求を、目的、対象範囲、対象外、受け入れ条件、影響範囲、不明点へ分解できる。
- UI、API、DB、テスト、README、セキュリティ、運用への影響を、仮説と確認済みに分けて記録できる。
- 既存データに新しいfieldを足すとき、nullable、default、backfill、読み取り時補完の違いを説明できる。
- 既存動作と新しい動作を分けて、回帰確認計画とcharacterization testを作れる。
- 仕様変更、リファクタリング、データ変更、文書更新を混ぜすぎないsafe change planを書ける。
- improvement PR summaryとrelease noteで、互換性、移行、確認結果、未確認事項を説明できる。

### この章で扱う範囲

この章では、改善を次の流れで進める。

```txt
existing behavior inventory
  -> change impact analysis
    -> regression test plan
      -> safe change plan
        -> migration note
          -> implementation
            -> improvement PR summary
              -> release note
```

最初に、変更前の振る舞いを棚卸しする。
次に、変更要求を目的、範囲、非対象、受け入れ条件、影響範囲、互換性リスクへ分ける。
その後、既存動作と新しい動作の回帰確認計画を作る。
safe change planでは、テスト、リファクタリング、仕様変更、文書更新、データ変更を混ぜすぎないように順序を決める。
データの形が変わるならmigration noteを書く。
最後に、改善PRの説明とrelease noteを作る。

この章では、大規模なレガシー刷新や全面的なアーキテクチャ移行は扱わない。
本番データ移行の詳細オペレーションやfeature flag基盤の構築も扱わない。
第22章の対象は、既存プロダクトに一つの改善を安全に入れることである。

### 既存プロダクトとは、現在の約束を持つソフトウェアである

既存プロダクトとは、すでに誰かが使える状態になっているソフトウェアである。
大規模な商用サービスだけを指すわけではない。
第21章で作った個人プロジェクトも、動く画面、保存済みデータ、README、デモ台本、確認ログを持った時点で、既存プロダクトとして扱える。

既存プロダクトには、現在の約束がある。
この約束は、契約書のように明文化されたものだけではない。
README通りに起動できること。
ログを作成できること。
一覧に保存済みログが表示されること。
既存データが読めること。
エラー時に画面が壊れないこと。
これらも、利用者や開発者が頼りにしている約束である。

現在の約束は、思い出ではなく証拠で扱う。

| promise | source | evidence before change | risk if broken |
| --- | --- | --- | --- |
| README通りに起動できる | README | 実行コマンドと結果 | レビューやデモが始められない |
| ログを作成できる | 画面、API、テスト | 作成操作、test result | 主要価値が失われる |
| 既存ログが一覧に出る | DB、seed data、画面 | 既存ログを含む一覧確認 | 過去データが消えたように見える |
| 入力エラーで画面が壊れない | UI、validation | 未入力時の画面確認 | 利用者が復旧できない |
| READMEの確認手順が正しい | README、確認ログ | 手順を実行した結果 | 次の人やAIが古い前提で作業する |

新規開発では、まだ誰も依存していないものを作る場面が多い。
既存改善では、すでにある約束を守りながら変更する。
この違いを意識しないと、新しい機能だけを見て、既存機能を壊す。

### 改善の最初は、変更前を確認すること

改善の最初の作業は、実装ではない。
変更前の振る舞いを確認することである。
変更前を知らなければ、変更後に何が壊れたか判断できない。
前からそうだったのか、今回壊したのかを分けられない。

学習ログ整理アプリなら、まず次を見る。

- README通りに起動できるか。
- 学習ログを作成できるか。
- 一覧に作成済みログが表示されるか。
- 既存ログのfieldは何か。
- 既存テストはあるか。
- 手動確認手順はあるか。
- 第21章のSelf Reviewで、壊してはいけない振る舞いとして何を書いたか。

これを `existing-behavior-inventory.md` に残す。

```md
# Existing Behavior Inventory

## Product

学習ログ整理アプリ

## Current Main Flows

| flow | steps | expected result | actual result | evidence | keep? |
| --- | --- | --- | --- | --- | --- |
| ログ作成 | title/body/tagsを入力して保存 | 一覧に新しいログが表示される | 表示された | 手動確認 | yes |
| ログ一覧 | `/logs` を開く | 保存済みログが新しい順に表示される | 表示された | 画面確認 | yes |
| README起動 | READMEの手順で起動 | localhostで画面を開ける | 開けた | command result | yes |

## Current Screens

| screen | current behavior | keep? |
| --- | --- | --- |
| ログ登録画面 | title、body、tagsを入力できる | yes |
| ログ一覧画面 | 保存済みログを表示する | yes |

## Current API or Server Actions

| endpoint or action | current behavior | keep? |
| --- | --- | --- |
| create log | 入力されたログを保存する | yes |
| list logs | 保存済みログを返す | yes |

## Current Data

| data | fields | note |
| --- | --- | --- |
| learning log | date、title、body、tags、created_at | statusはまだない |

## Current Verification

| where | command or action | expected | actual | result | note |
| --- | --- | --- | --- | --- | --- |
| terminal | `npm test` | pass | pass / skipped | pass / skipped | 既存テストの有無を書く |
| terminal | `npm run lint` | errorなし | pass / fail | pass / fail | failなら既知かを書く |
| browser | ログ作成と一覧表示 | 作成したログが一覧に出る | 表示された | pass | 手動確認 |

## Behavior to Preserve

1. 既存ログが一覧に表示され続ける。
2. これまで通りログを作成できる。
3. READMEの起動手順が壊れない。

## Not Verified Yet

| item | reason | how to verify |
| --- | --- | --- |
| 削除操作 | MVPに削除がないため | 今回の変更範囲外として記録 |
```

この棚卸しは、立派な設計書ではない。
変更前の基準である。
基準があると、変更後のレビューで「既存動作は守れているか」を確認できる。
未確認のものは空欄にせず、Not Verified Yetに理由と確認方法を書く。
「確認していない」と書くことは弱さではない。
今回の変更で何を守り、何を範囲外にしたかをレビュアーへ正直に伝えるための情報である。

### 変更要求は、そのまま実装しない

変更要求は、そのまま実装しない。
「statusで絞り込めるようにしてほしい」という依頼だけでは、まだ足りない。
誰が何を見つけやすくしたいのか。
statusにはどの値があるのか。
既存ログはどう扱うのか。
不正な値はどうするのか。
今回は何をやらないのか。
どの確認で完了とするのか。
これらを分ける必要がある。

`change-impact-analysis.md` には、変更要求を分解して書く。

```md
# Change Impact Analysis

## Change Request

学習ログにstatusを追加し、一覧でstatusによる絞り込みができるようにする。

## Purpose

相談が必要なログを見つけやすくし、メンターへ相談する前の整理時間を減らす。

## In Scope

- status fieldの追加
- **statusの許可値**：`draft`、`learned`、`needs-help`
- ログ作成時のstatus指定
- 一覧でのstatus絞り込み
- 既存ログを `learned` 扱いにする
- READMEの使い方と確認方法の更新

## Out of Scope

- 通知
- 多人数共有
- 複雑な権限管理
- status変更履歴
- 外部サービス連携

## Acceptance Criteria

1. 新しいログに `draft`、`learned`、`needs-help` のstatusを保存できる。
2. 一覧でstatusを指定して絞り込める。
3. 既存ログは `learned` として表示され続ける。
4. 不正なstatusを保存しない。
5. 既存のログ作成と一覧表示が壊れていない。

## Status Contract

| value | meaning | user-facing label | created when | legacy handling |
| --- | --- | --- | --- | --- |
| `draft` | まだ整理中 | 下書き | 新規作成時に選べる | 既存ログには使わない |
| `learned` | 学びとして整理済み | 学習済み | 新規作成時に選べる | statusなし既存ログはこれとして扱う |
| `needs-help` | 相談したい | 相談したい | 新規作成時に選べる | 既存ログには明示されない |

## Validation Rules

- 許可値以外のstatusは保存しない。
- status未指定の新規ログは、UIまたは保存処理でdefaultを決める。
- statusがない既存ログは、一覧表示と絞り込みで `learned` として扱う。

## Impact Areas

| area | impact | files or evidence | risk |
| --- | --- | --- | --- |
| UI | 登録画面と一覧の絞り込みUIを変更 | screen確認 | medium |
| API / server action | statusの保存と取得を追加 | route/action確認 | medium |
| DB / data | status fieldまたはdefaultが必要 | schema確認 | high |
| tests | 既存作成とstatus絞り込みを確認 | test plan | medium |
| README / docs | 使い方と確認方法を更新 | README | low |
| security / validation | 不正なstatusや想定外入力を拒否 | validation test | medium |
| logs / operations | 今回は大きな変更なし | なし | low |

## Compatibility Risks

| type | risk | why it matters | mitigation | verification |
| --- | --- | --- | --- | --- |
| data | 既存ログにstatusがない | 一覧から消える可能性がある | missing statusは `learned` 扱いにする | 既存ログ一覧とlearned絞り込み |
| API | API responseの形が変わる | 呼び出し元が壊れる可能性がある | 既存fieldを残し、追加fieldとして扱う | 既存API利用箇所を検索 |
| validation | 不正なstatusを保存できる | 絞り込みや表示が壊れる | 保存前に許可値を検証する | 不正値test |
| docs | READMEが古い | レビューやAI利用時に古い仕様で作業する | READMEとrelease noteを更新 | README手順の再実行 |
| rollback | statusだけ戻せない | データとUIの整合が崩れる | revert時に戻す対象を列挙 | Rollback or Revert Note |

## Unknowns

| unknown | how to check |
| --- | --- |
| 既存データにstatusがない場合の保存形式 | DB schemaとseed dataを確認 |
| 既存テストの範囲 | test directoryを確認 |
```

この文書を書くと、変更が画面だけで終わらないことが見える。
影響範囲は、完璧に予想できなくてもよい。
分かったことと未確認のことを分け、未確認のことには確認方法を書く。
statusのような小さな値でも、意味、表示名、default、既存データの扱い、validationを一つの契約としてそろえる。
これをそろえないと、UIでは「相談したい」、APIでは `needs-help`、テストでは `help`、READMEでは `needs_help` のように表記が割れる。

### 互換性は、既存の使い方を困らせないこと

互換性とは、既存の使い方、既存データ、既存API、既存手順が変更後も困らず使えることである。
既存改善では、互換性を軽く見ない。

status追加で考える。
既存ログにはstatusがない。
もしstatusを必須にして、既存ログをそのまま読めなくしたら、過去のログが一覧から消えるかもしれない。
API responseにstatusを追加するだけなら安全に見えるが、呼び出し側が厳密なschemaを期待している場合は影響するかもしれない。
READMEの手順が変わったのに更新しなければ、レビューやデモでつまずく。

互換性リスクは、すべてを禁止するために書くのではない。
壊す可能性があるなら、移行方法、告知、戻し方を考えるために書く。
「今回は既存ログを `learned` 扱いにする」と決めれば、実装もテストもREADMEもその前提で揃えられる。

### 既存データは、変更後も読めなければならない

既存データを見るときは、すでに保存されている情報が変更後も自然に読めるかを考える。
status fieldを追加するなら、古いログにはstatusがない。
このときの選択肢は複数ある。

- nullableにする。statusが空でも保存できる。
- defaultを設定する。新規作成時に初期値を入れる。
- backfillする。既存データへあとから値を埋める。
- 読み取り時に、statusがないものを `learned` として扱う。

どれが正しいかは状況による。
研修の小さなプロジェクトなら、既存ログは `learned` 扱いにする、と明示するだけで十分な場合もある。
ただし、その判断をmigration noteに残す。

選択肢は、次のように比較する。

| option | 何をするか | 既存データへの効き方 | 向いている場面 | 注意点 |
| --- | --- | --- | --- | --- |
| nullable | `status` が空でも保存できる | 既存ログは空のまま残る | すぐ値を決められない | 空の表示・絞り込みルールが別に必要 |
| default | 新規作成時の初期値を決める | 既存ログには自動では入らない | 新しいログを必ず一定の状態にしたい | 既存ログの扱いは別途必要 |
| backfill | 既存ログへ値を埋める | 既存ログに `learned` などが入る | 既存データも明示的にそろえたい | 件数、実行時間、戻し方の検討が必要 |
| read-time fallback | 読み取り時に空を `learned` 扱いにする | 保存値は変えず表示・絞り込みで補完 | 研修の小さな変更、低リスクで始めたい | UI/API/テストで同じ補完を使う必要がある |

この章の共通例では、read-time fallbackを基本案にする。
ただし、DB schemaにNOT NULL制約を入れる、または本番相当のデータを扱う場合は、defaultやbackfillも含めて別途検討する。
「defaultを設定したから既存データも埋まる」とは考えない。

専門用語を覚えるより、まず問いを持つ。
古いデータは読めるか。
新しいデータは正しい値を持つか。
不正な値は入らないか。
戻すとき、どのデータに影響するか。
この問いが、migrationの入口である。

### Migration Noteは、データ変更の説明である

migration noteは、データ変更の説明メモである。
本番データ移行の詳細な作業手順までは、この章では扱わない。
ここで必要なのは、何を変え、既存データをどう扱い、どう確認し、戻すとき何に注意するかである。

```md
# Migration Note

## Data Change

学習ログに `status` を追加する。
許可値は `draft`、`learned`、`needs-help` とする。

## Existing Data Handling

既存ログは `learned` 扱いにする。
DBに値がない場合も、一覧表示と絞り込みでは `learned` として扱う。

## Chosen Strategy

| option | decision | reason |
| --- | --- | --- |
| nullable | maybe | DB schemaによっては一時的に許容する |
| default | yes for new logs | 新規ログのstatusを必ず決める |
| backfill | no for this chapter | 研修の小さな変更では既存値を書き換えない |
| read-time fallback | yes | statusなし既存ログを `learned` 扱いにして互換性を保つ |

## Default or Backfill

- 新規作成時のdefaultは `draft` または入力値とする。
- 既存データへのbackfillが必要かは、DB schemaと保存方式を見て判断する。
- 研修提出では、既存ログが一覧から消えないことを優先して確認する。

## Verification

| check | expected result |
| --- | --- |
| 既存ログ一覧 | status追加後も既存ログが表示される |
| learned絞り込み | 既存ログが `learned` として表示される |
| 新規ログ作成 | statusを指定して保存できる |
| 不正status | 保存されない、または安全なエラーになる |

## Rollback Consideration

status列や絞り込みUIを戻す場合、既存ログの表示、作成処理、READMEの確認手順がどう変わるかを確認する。
保存済みデータにstatusを書き込んだ場合、その値を消すのか、使わずに残すのかを決める。
DB schemaを戻せない場合は、roll forwardで表示やvalidationを修正する方が安全なこともある。

## Risks

- 既存ログのstatus解釈が画面とAPIでずれる。
- default値と表示時の扱いが一致しない。
- backfillを実行した場合、戻すときに元の「statusなし」状態を復元できない可能性がある。
```

データ変更では、実装より先に言葉を揃える。
`draft` は下書きなのか。
`learned` は学習済みなのか。
`needs-help` は相談したい状態なのか。
状態の意味が曖昧だと、UI、API、テスト、release noteがずれる。

### 仕様変更とリファクタリングを分ける

仕様変更とリファクタリングは分けて考える。
仕様変更は、利用者から見える振る舞いを変えることだ。
statusが保存できる、statusで絞り込める、既存ログをlearned扱いにする、という変更である。

リファクタリングは、利用者から見える振る舞いを変えずに内部構造を整理することである。
FowlerのRefactoringでは、既存コードの設計を安全に改善するために、ふるまいを保つ小さな変換を積み重ねる考え方が説明されている。
小さく変え、壊れていないことを確認しながら進む。

どちらも大事である。
しかし、同じ大きな差分に混ぜるとレビューが難しくなる。
レビュアーは、どの変更がstatus追加に必要で、どの変更が内部整理なのかを見分けなければならない。
バグが出たときも、仕様変更が原因なのか、整理が原因なのか分かりにくい。

safe change planでは、リファクタリングの境界を書く。
必要なら、先に小さな整理をする。
不要なら、今回のPRに入れない。
「ついでにきれいにする」は、既存改善では危険な合図である。

### 回帰確認は、変えていないはずの価値を見る

回帰確認は、regression checkとも呼ぶ。
新しい機能が動くかだけでなく、前からできていたことが壊れていないかを見る確認である。
status絞り込みを作ったなら、絞り込みが動くかを見る。
同時に、ログを作れるか、一覧に既存ログが出るか、README通りに起動できるか、不正なstatusを保存しないかも見る。

`regression-test-plan.md` は次のように書ける。

```md
# Regression Test Plan

## Existing Behavior Checks

| check | method | pre-change evidence | expected after change |
| --- | --- | --- | --- |
| README通りに起動 | manual | README手順でlocalhostを確認 | localhostで一覧画面を開ける |
| 既存ログ作成 | automated / manual | 変更前に作成できることを確認 | title/body/tagsでログを作成できる |
| 既存ログ一覧 | automated / manual | 変更前の既存ログ一覧を確認 | 保存済みログが一覧に表示される |

## New Behavior Checks

| check | method | expected result | negative or edge case |
| --- | --- | --- | --- |
| status保存 | automated / manual | `draft`、`learned`、`needs-help` を保存できる | 未指定時のdefault |
| status絞り込み | automated / manual | 指定statusのログだけが表示される | 該当0件の空状態 |
| 不正status | automated | 不正な値を保存しない | `help`、空文字、想定外文字列 |
| 既存ログの扱い | automated / manual | statusなしのログが `learned` として表示される | learned絞り込みに含まれる |

## Characterization Test

| current behavior to lock | test idea | reason |
| --- | --- | --- |
| ログ作成後に一覧へ表示される | create log then list logs | 既存の主要動線を守るため |

## Commands

| purpose | command or operation | expected result | actual result | result |
| --- | --- | --- | --- | --- |
| test | `npm test` | 既存動作と新機能の確認が通る |  | pass / fail / skipped |
| lint/typecheck | `npm run lint` / `npm run typecheck` | errorがない、または既知の失敗を説明できる |  | pass / fail / skipped |
| manual check | READMEのDemo Flow | 既存動作とstatus絞り込みを確認できる |  | pass / fail / skipped |

## Not Checked

| item | reason | follow-up |
| --- | --- | --- |
| 本番データ移行 | 第22章の範囲外 | 第23章で確認 |
| 多人数利用 | Out of Scope | 将来の改善候補 |
```

既存テストが少ない場合、完璧なテスト群を急に作らなくてよい。
まず、壊したくない現在の動きを一つテストにする。
これをcharacterization testと呼ぶことがある。
「今のアプリはこう動いている」という証拠をテストにするのである。
characterization testは「理想の仕様」を決めるテストではなく、「現在の実際の振る舞い」を固定するテストである。
現在の振る舞いが望ましくない可能性がある場合は、そのテストにメモを残し、仕様変更として直すかどうかを別に判断する。

### Safe Change Planは、小さく戻せる順序を作る

safe change planは、安全に変えるための手順である。
安全とは、失敗しないことではない。
失敗に早く気づき、原因を切り分けられ、必要なら戻せることである。

Googleのコードレビュー実践では、小さな変更はレビューしやすく、問題があったときに戻しやすいという考え方が示されている。
研修では実際のPRを一つにまとめる場合でも、PR本文の中で変更の種類を分ける。
調査、テスト追加、必要最小限のリファクタリング、仕様変更、README更新を説明できるようにする。

```md
# Safe Change Plan

## Strategy

既存動作を先に確認し、status追加を小さな手順に分ける。
仕様変更とリファクタリングを混ぜすぎない。
既存ログが一覧から消えないことを最優先で確認する。

## Steps

| order | step | type | done when | verification | stop if |
| --- | --- | --- | --- | --- | --- |
| 1 | 既存動作を棚卸しする | test | behavior inventoryが埋まる | 手動確認、既存test | README起動が再現できない |
| 2 | 既存のログ作成をcharacterization testにする | test | ログ作成と一覧表示をtestで確認 | `npm test` | 既存動作が不安定で固定できない |
| 3 | statusの型と許可値を定義する | feature | 許可値が一箇所で説明できる | unit/API test | 値の意味が決まっていない |
| 4 | 保存処理でstatusを扱う | feature | 新規ログにstatusを保存できる | test、手動確認 | 不正値が保存される |
| 5 | 既存ログをlearned扱いにする | migration | statusなしログが一覧に残る | regression check | 既存ログが消える |
| 6 | 一覧にstatus絞り込みを追加する | feature | needs-helpだけを表示できる | manual check | learnedの既存ログが見えない |
| 7 | README、migration note、PR summary、release noteを更新する | docs | 確認手順と利用者向け変更が書かれる | doc review | 文書が実装と一致しない |

## Refactoring Boundary

- **needed**：statusの許可値を重複させないための小さなhelper
- **not included**：一覧画面全体のcomponent分割、DB層の全面整理
- **reason**：今回の目的はstatus追加であり、大きな内部整理を混ぜるとレビューしにくい

## AI Delegation

| work | AI role | human verification |
| --- | --- | --- |
| 影響範囲の候補出し | UI/API/DB/tests/READMEに分けて挙げる | 関連ファイルを検索して確認 |
| 回帰確認観点 | 既存動作と新機能のチェック候補を出す | 実際のアプリの動きに合わせて削る |
| PR説明下書き | 目的、互換性、確認結果を整理 | 未確認の断定がないか確認 |

## AI Checkpoints

| timing | what to check | result |
| --- | --- | --- |
| 入力前 | APIキー、パスワード、実在の個人情報、本番データ、未公開の事業情報を入れていない |  |
| 採用前 | AIの候補を、検索、差分、テスト、画面操作で確認した |  |
| 共有前 | PR説明やrelease noteに秘密情報や未確認の断定がない |  |
| PR前 | 既存動作、新しい動作、互換性リスクを自分で確認した |  |

## Security and Dependency Check

| item | check |
| --- | --- |
| input validation | statusの許可値以外を保存しない |
| authorization | 今回の変更で権限の前提が増えていない |
| secrets | 新しいsecretや本番データを追加していない |
| dependencies | 新しい依存を追加する場合、必要性、lock file、脆弱性確認を書く |
| logs | 実在の個人情報や顧客情報をログ出力しない |

## Rollback or Revert Note

status追加を戻す場合、status入力UI、絞り込みUI、保存処理、READMEの確認手順を合わせて戻す。
DBや保存済みデータにstatusを追加している場合、戻した後も既存ログが読めるか確認する。
```

safe change planの目的は、手順を増やすことではない。
変更を小さくし、何を確認すれば次へ進めるかを明確にすることである。
NIST SSDFのような安全な開発の考え方では、リリース前に脆弱性やセキュリティ上の影響を減らす実践が重視される。
第22章の小さな改善でも、新しい入力値、依存関係、secret、ログ出力が増えるなら、セキュリティ観点をsafe change planに入れる。

### AIは影響調査の補助に使えるが、確認済みにはしない

AIは、影響範囲の候補出しに使える。
「この変更で関係しそうなファイルをUI、API、DB、tests、READMEに分けて挙げてください」と依頼できる。
互換性リスクや回帰確認観点の洗い出しにも使える。

ただし、AIの出力は仮説である。
AIが「影響なし」と言っても、それは確認済みという意味ではない。
開発者が検索し、差分を読み、テストを実行し、画面操作で確かめる必要がある。

AIに渡してよい情報も制限する。
APIキーやパスワードなどの秘密情報、実在の個人情報、本番データ、未公開の事業情報は入れない。
エラー調査でログを渡す場合も、必要な範囲だけを切り出す。

AIへの依頼は、次の形にできる。

```txt
既存の学習ログ整理アプリに、小さな改善を入れます。

現在の仕様:
- 学習ログを作成できる
- ログには日付、タイトル、本文、タグがある
- 一覧でログを確認できる

変更要求:
- statusを追加する
- statusは draft / learned / needs-help
- 一覧でstatusによる絞り込みができる
- 既存ログは learned 扱いにする

制約:
- 既存ログが表示され続けること
- 既存の作成機能が壊れないこと
- 不正なstatusを保存しないこと

お願い:
1. 影響しそうな領域を UI / API / DB / tests / README に分けて挙げてください。
2. 互換性リスクを挙げてください。
3. 回帰確認観点を提案してください。
4. 仕様変更とリファクタリングを分けた実装手順を提案してください。
5. 出力は「仮説」として書き、確認に使う検索語、見るファイル、実行するテストも提案してください。
```

この出力を、そのまま計画にしない。
自分のリポジトリを検索し、既存のファイル、既存のテスト、README、保存形式に合わせて修正する。

AIの影響調査は、次の表で検証する。

| AI suggestion | checked by | result | adopted? | note |
| --- | --- | --- | --- | --- |
| UIに登録画面と一覧が関係する | `rg "status|create|list"`、画面確認 | 関係あり | yes | filesを記録 |
| DB schemaの変更が必要かもしれない | schema、store、migrationを確認 | 保存方式による | partial | read-time fallbackを選ぶ |
| operations影響なし | README、release note、rollbackを確認 | docs更新は必要 | no | 「影響なし」を修正 |

AIが挙げなかった領域も、一度は人間が見る。
特にREADME、既存データ、validation、rollbackは、コード生成の文脈だけでは抜けやすい。

### PR Summaryは、レビューの入口である

改善を実装したら、`improvement-pr-summary.md` を作る。
これはPull Request本文の下書きとして使える。
GitHubのPull Requestは変更の提案とレビューの場所であり、Googleの変更説明ガイドでも、変更説明は将来の履歴として読まれることが重視されている。

改善PRでは、変更内容だけでなく、互換性、データ移行、確認結果、レビューしてほしい点を書く。

```md
# Improvement PR Summary

## Purpose

相談が必要な学習ログを見つけやすくするため、ログにstatusを追加し、一覧でstatus絞り込みをできるようにする。

## Changes

- statusの許可値を `draft`、`learned`、`needs-help` に定義
- ログ作成時にstatusを保存
- 既存ログを `learned` 扱いにする
- 一覧にstatus絞り込みを追加
- READMEの起動手順と確認手順を更新

## Compatibility

- 既存ログは一覧に表示され続ける。
- 既存ログは `learned` として扱う。
- 既存のtitle、body、tagsは維持する。

## Data Migration

- status fieldを追加する。
- 既存データは `learned` 扱いにする。
- 詳細は `migration-note.md` を参照する。

## Verification

| check | expected | actual | result | evidence |
| --- | --- | --- | --- | --- |
| existing behavior | ログ作成、一覧表示が壊れていない |  | pass / fail | command or screen |
| new behavior | status保存、status絞り込みが動く |  | pass / fail | command or screen |
| invalid status | 不正値を保存しない |  | pass / fail | test result |
| test | 既存動作と新機能の確認が通る |  | pass / fail / skipped | command result |
| lint/typecheck | errorなし、または既知の失敗を説明 |  | pass / fail / skipped | command result |
| manual check | README手順で確認できる |  | pass / fail / skipped | README手順 |

## Checks Not Run

| check | reason | risk | follow-up |
| --- | --- | --- | --- |
| 本番データ移行 | 第22章の範囲外 | 本番相当データでは未確認 | 第23章PRRで確認 |

## Known Issues

- status変更履歴は未対応。
- 通知はOut of Scope。

## Chapter 23 Inputs

- **release candidateとして渡す変更**：status追加と一覧絞り込み
- **追加で確認したいこと**：入力検証、アクセシビリティ、README、rollback
- **follow-upにすること**：status変更履歴

## Rollback or Roll Forward

- **revert candidate**：status入力UI、絞り込みUI、保存処理、README更新
- **data caution**：保存済みstatusを削除するか、使わずに残すか判断が必要
- **roll forward candidate**：既存ログの表示だけが壊れた場合、read-time fallbackを修正する

## Review Focus

1. 既存ログを `learned` 扱いにする方針が妥当か。
2. 不正なstatusを保存しない確認が十分か。
3. 仕様変更と不要なリファクタリングが混ざっていないか。
```

PR Summaryは、レビュアーのためだけではない。
第23章の本番リリース判定へ渡す入力にもなる。
既存動作、新機能、互換性、データ移行、残課題が揃っていると、本番前確認へ進みやすい。

### Release Noteは、利用者に見える変化を書く

release noteは、何が変わったかを利用者や運用者に伝える短い文書である。
PR Summaryよりも、利用者に見える変化を優先する。
技術的な差分をすべて書く必要はない。
ただし、互換性、migration、既知の問題は隠さない。

```md
# Release Note

## Summary

学習ログにstatusが追加され、相談が必要なログを一覧で絞り込めるようになりました。

## Who Is Affected

- 学習ログを登録、一覧確認する受講者
- 相談したいログを確認するメンター

## User-visible Changes

- ログに `draft`、`learned`、`needs-help` のstatusを付けられます。
- 一覧でstatusを指定して絞り込めます。
- 既存ログは `learned` として扱われます。

## Compatibility

- 既存ログは引き続き一覧に表示されます。
- 既存のログ作成手順は維持されます。

## Action Needed

- READMEの新しい確認手順に沿って、status付きログの作成と絞り込みを確認してください。

## Migration

- statusがない既存ログは `learned` 扱いです。
- READMEの確認手順を更新しました。

## Known Issues

- status変更履歴はありません。
- 通知は未対応です。

## Operations Note

- 第23章では、入力検証、アクセシビリティ、rollback、README、監視観点を確認します。
```

release noteを書くと、変更の利用者視点が明確になる。
「実装した」ではなく、「使う人には何が見えるか」を説明する。
この違いは、第24章の最終発表にもつながる。

### READMEも変更対象である

既存改善では、コードだけを変えて終わりにしない。
READMEも変更対象である。
statusを追加したなら、使い方、確認方法、既知の制約が変わる。
READMEが古いままだと、レビュー、デモ、第23章のPRRでつまずく。

READMEには、少なくとも次を更新する。

- statusの意味。
- statusの許可値。
- statusで絞り込む手順。
- 既存ログが `learned` 扱いになること。
- 確認方法。
- 未対応の範囲。
- last reviewed、更新日、関連PR。
- 失敗時または空状態の表示。

READMEは、人間だけでなくAIが読むcontextにもなる。
古いREADMEをAIに渡すと、AIは古い仕様を前提にした提案をする。
第20章で扱った文書保守は、ここでも効く。

### 変更を実装する前のチェックリスト

実装前に、次を確認する。

- 変更前の主要動作を確認したか。
- 既存データの形を見たか。
- 変更要求の目的を説明できるか。
- In ScopeとOut of Scopeを書いたか。
- 受け入れ条件を書いたか。
- UI、API、DB、tests、READMEへの影響を見たか。
- 互換性リスクを書いたか。
- 既存動作の回帰確認を書いたか。
- 新しい動作の確認を書いたか。
- migration noteを書いたか。
- safe change planで、仕様変更とリファクタリングを分けたか。
- validation、secret、依存関係、ログ出力の影響を見たか。
- rollbackまたはroll forwardの方針を書いたか。
- AIを使う場合、入力前と採用前の確認を決めたか。

このチェックリストは、作業を遅くするためのものではない。
変更後に壊れてから調査する時間を減らすためのものだ。

### 既存改善で起きやすい誤解

- 既存プロダクト改善を、新規開発の続きだと考える。まず現在の約束を確認する。
- 変更前の確認をしない。前からそうだったのか、今回壊したのか分からなくなる。
- 変更要求をそのまま実装する。目的、範囲、非対象、受け入れ条件へ分ける。
- 画面だけを見て影響範囲を判断する。UI、API、DB、tests、README、operationsを見る。
- 互換性リスクを後回しにする。既存データや既存手順が困る可能性を先に見る。
- status追加を単なるfield追加だと考える。既存ログ、default、backfill、不正値を確認する。
- defaultを設定すれば既存データにも値が入ると考える。defaultは多くの場合、新規作成時の初期値であり、既存データは別に扱う。
- 仕様変更とリファクタリングを混ぜる。レビューしにくく、戻しにくくなる。
- 新機能だけを確認する。既存動作の回帰確認を入れる。
- AIの影響調査を確認済みとして扱う。検索、差分、テスト、画面操作で検証する。
- AIが見落としやすいREADME、既存データ、validation、rollbackを人間が見ない。
- PR説明に互換性やmigrationを書かない。レビュアーが重要な影響を見落とす。
- revertすれば必ず元通りになると思い込む。データ変更がある場合、roll forwardの方が安全なこともある。
- release noteを技術差分だけにする。利用者に見える変化を書く。
- READMEを更新しない。使い方と確認方法が古くなる。
- 古いREADMEをAIに渡し続ける。AIの提案も古い仕様に引っ張られる。

### 影響範囲と回帰確認で確認すること

この章では、`existing-behavior-inventory.md`、`change-impact-analysis.md`、`regression-test-plan.md`、`safe-change-plan.md`、`migration-note.md`、`improvement-pr-summary.md`、`release-note.md` を作る。
READMEも更新する。

最初に、第21章の成果物を読む。
`project-brief.md` でユーザーと課題を確認する。
`mvp-scope.md` で最初の完成形を確認する。
`delivery-plan.md` で保存データと主要操作を確認する。
`self-review.md` のChapter 22 Hand-offで、壊してはいけない振る舞いを見る。
READMEの起動手順と確認手順を実際に試す。

次に、変更前の振る舞いを `existing-behavior-inventory.md` に書く。
主要操作、画面、APIまたはserver action、既存データ、現在の確認結果、守る振る舞い、未確認事項を残す。

次に、`change-impact-analysis.md` を書く。
変更要求、目的、In Scope、Out of Scope、Acceptance Criteria、Status Contract、Validation Rules、Impact Areas、Compatibility Risks、Unknownsを埋める。

次に、`regression-test-plan.md` を作る。
Existing Behavior Checks、New Behavior Checks、Characterization Test、Commands、Not Checkedを分ける。
既存テストが少ない場合は、壊したくない動作を一つだけでもテストまたは手動確認として固定する。

次に、`safe-change-plan.md` と `migration-note.md` を作る。
変更手順、stop条件、refactoring boundary、AI Delegation、AI Checkpoints、Security and Dependency Check、Rollback or Revert Noteを書く。
データ変更があるなら、既存データの扱い、選んだ戦略、default、backfill、確認、戻し方を書く。

改善を実装したら、`improvement-pr-summary.md` と `release-note.md` を作る。
PR Summaryには、目的、変更内容、互換性、データ移行、確認結果、Checks Not Run、Known Issues、Chapter 23 Inputs、Rollback or Roll Forward、Review Focusを書く。
Release Noteには、影響を受ける人、利用者に見える変化、互換性、必要な行動、migration、既知の問題、operations noteを書く。

最後に、READMEを更新する。
statusの意味、許可値、絞り込み手順、既存ログの扱い、確認方法、未対応範囲を反映する。

### 既存プロダクト改善で持ち帰ること

第22章で身につけるべきことは、既存プロダクトを壊さずに改善する型である。
既存プロダクトには、現在の約束がある。
README、画面、API、保存済みデータ、テスト、デモ台本、確認手順は、すべて変更時に守るべき手がかりになる。

改善は、実装から始めない。
まず既存振る舞いを棚卸しする。
次に変更要求を分解し、影響範囲、互換性リスク、不明点を見る。
回帰確認計画で、既存動作と新しい動作を分けて確認する。
safe change planで、仕様変更、リファクタリング、データ変更、文書更新を小さく並べる。
migration noteで、既存データの扱いを説明する。

AIは、影響範囲や確認観点の候補出しに役立つ。
しかし、AIの出力は確認済みではない。
検索、差分、テスト、手動確認で検証し、PR SummaryとRelease Noteで、何を変え、何を守り、何を確認したかを説明する。

この章のゴールは、良さそうな変更を速く入れることではない。
今ある価値を守りながら、小さく変え、確認し、戻せる状態で説明することである。

### 本番リリース判定の章へ

次章では、本番リリース判定を扱う。
第22章で作ったexisting behavior inventory、change impact analysis、regression test plan、safe change plan、migration note、improvement PR summary、release noteは、そのまま第23章の入力になる。
本番に出してよいかを判断するには、変更内容だけでなく、既存動作、互換性、データ、確認結果、残課題が必要である。
第22章の成果物は、その判断材料になる。

### 参考資料

- [Software Engineering at Google](https://abseil.io/resources/swe-book/html/toc.html)
- [Martin Fowler: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Martin Fowler: Refactoring](https://martinfowler.com/books/refactoring.html)
- [GitHub Docs: Collaborating with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Google Engineering Practices: Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Google Engineering Practices: Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)
- [NIST SP 800-218: Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

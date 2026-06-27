---
title: "第24章 最終発表と次の学習計画"
part: 6
partLabel: "Part 6 最終プロジェクト"
order: 24
---

第24章は、Bootcamp 1の最終章である。
新しい技術項目は増やさない。
第1章から第23章までで作った成果物を読み直し、何を作り、なぜ作り、どう確かめ、何を学び、次に何を伸ばすのかを説明できる形へまとめる。

最終発表は、画面を順番に見せるショーケースではない。
聞き手が知りたいのは、完成度だけではない。
配属後に、あなたがどのように課題を捉え、範囲を決め、実装し、確認し、相談し、AIを使い、リスクを扱い、次の行動へつなげられるかである。
発表は、その仕事の進め方を証拠つきで説明する場である。

第21章では、個人開発プロジェクトを作った。
第22章では、そのプロダクトを既存プロダクトとして改善した。
第23章では、本番リリース判定を行い、go、go with follow-up、no-goのいずれかのrelease decisionを作った。
第24章では、それらを最終発表と次の90日計画へ変換する。

この章で重視するのは、見栄えのよい資料を作ることではない。
発表資料と、実際の成果物、確認ログ、PRR結果、AI利用ログ、残課題が一致していることを重視する。
きれいなスライドより、説明と証拠がずれていないことが大切である。

### この章を読み終えるとできるようになること

- 発表で主張することを、core evidence、supporting evidence、missing evidence、do not showへ分けられる。
- secret、個人情報、本番データ、AWS account id、内部URL、実ログを、発表資料やAI入力に含めない判断ができる。
- final presentation briefで、ユーザー、課題、成果、技術判断、品質証拠、AI利用、残課題、欲しいフィードバックを一つの流れにできる。
- demo scriptに、初期状態、価値を示す操作、期待結果、失敗時の代替証拠、見せてはいけない情報を含められる。
- AI利用を、入力前、採用前、共有前、PR前の確認と、採用しなかった提案まで含めて説明できる。
- 失敗、迷い、削った範囲を、次に変える行動と証拠へ変換できる。
- next 90 days planを、action、output、success signal、support needed、review cadenceで具体化できる。

### この章で扱う範囲

この章では、最終発表を次の順序で準備する。

```txt
final evidence index
  -> final presentation brief
    -> final demo script
      -> learning reflection
        -> next 90 days plan
```

最初に、final evidence indexで証拠を棚卸しする。
発表で見せるcore evidence、質問時に開くsupporting evidence、足りないmissing evidence、見せてはいけないdo not showを分ける。
次に、final presentation briefで、中心メッセージ、聞き手、ユーザー、課題、成果、技術判断、品質証拠、AI利用、残課題、欲しいフィードバックを整理する。
その後、final demo scriptで、価値を見せるユーザーフローと失敗時の代替証拠を用意する。
最後に、learning reflectionとnext 90 days planで、学びを次の配属後の行動へつなげる。

この章では、プレゼンテーションデザインの細部、話し方、発声、社外登壇資料の作り込みは扱わない。
研修成果を実務に接続するための説明と計画に集中する。

### 最終発表は、成果物の羅列ではない

発表準備で最初にやりがちな失敗は、作った画面やファイルを順番に並べることである。
Project Briefがあります。
MVP Scopeがあります。
Demo Scriptがあります。
PRRもやりました。
こう並べても、聞き手には何を判断すればよいか伝わりにくい。

発表では、成果物を「主張を支える証拠」として使う。
ユーザーと課題を説明するなら、project-brief.mdが証拠になる。
範囲を削った判断を説明するなら、mvp-scope.mdやlearning-reflection.mdが証拠になる。
既存プロダクトを壊さず改善したことを説明するなら、change-impact-analysis.md、regression-test-plan.md、improvement-pr-summary.mdが証拠になる。
出してよいかを判断したことを説明するなら、production-readiness-checklist.md、smoke-test-plan.md、release-decision.mdが証拠になる。

つまり、発表はファイル紹介ではない。
主張、証拠、判断をつなぐ作業である。

### Final Evidence Indexで証拠を選ぶ

final evidence indexは、最終発表で使う根拠リストである。
第1章から第23章までの成果物をすべて見せる必要はない。
むしろ、全部を見せようとすると話が散らばる。
発表で実際に使うcore evidence、補足として残すsupporting evidence、足りないmissing evidence、見せないdo not showを分ける。
さらに、証拠ごとにsource of truth、発表での使い方、安全に見せられるか、代替証拠を決める。
source of truthは、迷ったときに正本として見るもののことである。
たとえば、機能の現在仕様は発表スライドではなく実装、README、テスト、PRR文書にある。
発表資料は証拠の入口であり、証拠そのものを置き換えるものではない。

```md
# Final Evidence Index

## Core Evidence

| evidence | claim it supports | source of truth | use in talk | safe to show? | fallback |
| --- | --- | --- | --- | --- | --- |
| project-brief.md | ユーザー、課題、成果の根拠 | project brief | 課題説明で一部を見せる | yes | final-presentation-brief.md |
| mvp-scope.md | 最初に作る範囲と削った範囲の根拠 | MVP scope | Must/Won'tを短く見せる | yes | learning-reflection.md |
| improvement-pr-summary.md | status追加改善の内容と互換性の根拠 | PR summary / diff | 技術判断で参照 | yes | release-note.md |
| production-readiness-checklist.md | 品質確認の根拠 | PRR checklist | PRR結果で見せる | yes / redact | release-decision.md |
| release-decision.md | go / go with follow-up / no-go判断の根拠 | release decision | 発表後半で見せる | yes / redact | final evidence index |

## Supporting Evidence

| evidence | claim it supports | when to use | safe to show? |
| --- | --- | --- | --- |
| regression-test-plan.md | 既存動作と新機能の確認 | 質問時に開く | yes |
| migration-note.md | 既存ログをlearned扱いにした判断 | 技術判断の補足 | yes |
| ai-work-log.md | AIに何を依頼し、何を確認したか | AI利用の補足 | yes / redact |
| smoke-test-plan.md | リリース直後確認 | PRR補足 | yes |

## Missing Evidence

| missing evidence | claim affected | how to handle in talk | follow-up |
| --- | --- | --- | --- |
| 大量データ時の性能 | 大量データでも十分速いとは言えない | 未確認として話し、主張を弱める | follow-up issue |
| CloudWatch Logsでのvalidation error確認 | AWS上での一次調査手順は未確認 | local確認とAWS未確認を分ける | 第23章のfollow-up |

## Do Not Show

| item | reason | safe alternative |
| --- | --- | --- |
| `.env` | secretを含む可能性がある | `.env.example` |
| 実在人物の学習ログ | 個人情報になる可能性がある | 架空データ |
| 内部URLやAWS account id | 提出物に出す必要がない | service名や伏せ字 |
| 本番ログ全文 | 個人情報、token、request idを含む可能性 | 必要箇所だけredactしたメモ |
```

do not showは、発表の安全性を守るための欄である。
secret、実在の顧客情報、実在の個人情報、本番データ、内部URL、AWS account idを発表資料やAI入力へ入れない。
発表では、見せる証拠だけでなく、見せない判断も必要である。
「見せない」は隠すことではない。
公開してはいけない情報を避け、同じ主張を安全なサンプル、伏せ字、集計、手順、テスト結果で支えることである。

### Core Messageを一文で決める

発表にはcore messageが必要である。
core messageは、発表全体で最も伝えたい一文である。
これがないと、スライドもデモも削りにくい。

学習ログ整理アプリなら、次のように書ける。

```txt
研修中の学習ログを整理し、相談が必要なログを見つけやすくするWebアプリを作り、status追加の改善とリリース前確認まで行った。
```

この一文には、ユーザー、成果、改善、品質確認が含まれている。
すべての機能名は入っていない。
通知、タグ検索、集計、デザインの細部も入っていない。
発表の中心は、何を作り、何を確かめたかである。

core messageが長くなりすぎる場合は、発表の焦点が広がりすぎている。
一文に入らない話は、補足か、質問時に回す。

### Final Presentation Briefで発表の骨子を作る

final presentation briefは、発表の骨子である。
スライドを先に作り込む前に、話の流れを文字で決める。
GoogleのTechnical Writing教材が重視するように、読者、構造、明確さを先に置く。
発表でも同じである。
聞き手が誰で、何を判断してほしいのかを決める。

```md
# Final Presentation Brief

## Core Message

研修中の学習ログを整理し、相談が必要なログを見つけやすくするWebアプリを作り、status追加の改善とリリース前確認まで行った。

## Audience

研修メンター、講師、配属先でオンボーディングを支援する人。

## User, Problem, Outcome

- **user**：研修中の受講者
- **problem**：学習ログ、詰まり、相談事項が散らばり、次に相談する内容を整理しにくい
- **outcome**：相談が必要なログを一覧で見つけやすくし、メンターへ相談しやすくする

## Product Summary

学習ログを登録し、statusで絞り込めるWebアプリ。
第22章でstatusを追加し、既存ログをlearned扱いにした。

## Key Technical Decisions

| decision | reason | trade-off | evidence |
| --- | --- | --- | --- |
| statusを3種類に絞る | MVPで状態を説明しやすくする | 詳細な状態履歴は持たない | mvp-scope.md |
| 既存ログをlearned扱いにする | 過去ログを一覧から消さない | 過去の実際の状態は区別できない | migration-note.md |
| needs-help絞り込みを主要デモにする | 相談価値が伝わりやすい | 他の絞り込みはfollow-up | demo-script.md |

## Quality and PRR Evidence

| area | evidence | result |
| --- | --- | --- |
| tests | regression-test-plan.md | 既存作成と一覧表示を確認 |
| security | security-accessibility-readiness.md | 不正statusとsecretを確認 |
| accessibility | security-accessibility-readiness.md | keyboard、label、error messageを確認 |
| operations | release-runbook.md | release、smoke test、rollbackを整理 |
| documentation | README、release-note.md | 使い方と既存ログの扱いを更新 |
| PRR / release decision | release-decision.md | go with follow-up |

## AI Use and Verification

| stage | AI use | human check | adopted? | evidence |
| --- | --- | --- | --- | --- |
| 入力前 | テーマ整理、影響範囲候補 | secret、個人情報、本番データを入れていない | yes | ai-use-log.md |
| 採用前 | 実装案、テスト観点、PR説明下書き | 差分、テスト、実行結果で裏取りした | partly | ai-work-log.md |
| 共有前 / PR前 | 発表構成レビュー | 自分の証拠にない話を削った | partly | final-presentation-brief.md |
| 不採用 | 通知や集計など便利機能の追加 | MVP範囲外として削った | no | mvp-scope.md |

## Risks and Follow-up

- 大量データ時の絞り込み性能は未確認。follow-up issueにした。
- CloudWatch Logsでのvalidation error確認は未実施。次の90日計画に入れる。

## Feedback Wanted

| question | why I want feedback | after receiving |
| --- | --- | --- |
| status設計はMVPとして妥当か | 追加状態を増やすべきか迷ったため | 次の改善範囲に反映する |
| go with follow-up判断でよいか | 性能未確認をどう扱うか学びたいため | follow-upの優先度を調整する |
| AI利用の検証説明は十分か | 採用前確認をどう伝えるべきか知りたいため | AI利用ログを改善する |
```

briefは、発表原稿ではない。
発表の構造を決める文書である。
ここが整うと、スライドに何を載せるか、デモで何を見せるか、どの証拠を補足に回すかが決まる。
特に、claimとevidenceの対応を見る。
「速い」「安全」「使いやすい」「AIで効率化できた」のような強い主張には、それぞれ証拠が必要である。
証拠がない主張は、言わないか、「未確認」「今後確認する」に弱める。

### 価値から始め、技術判断へ進む

技術発表でも、最初は価値から入る。
誰が、何に困っていて、作ったものによって何が良くなるのか。
ここを説明しないまま技術名に入ると、聞き手はその技術判断の意味を評価しにくい。

流れは次のように作る。

```txt
user and problem
  -> outcome
    -> product
      -> demo
        -> technical decisions
          -> quality evidence
            -> AI use and verification
              -> reflection
                -> next 90 days plan
```

この順序にすると、デモが単なる機能紹介ではなくなる。
デモは、最初に話した価値を画面で確認する時間になる。
技術判断は、価値を実現するための判断として説明できる。
品質確認は、成果物を出してよいと判断するための証拠になる。

### 技術判断は、技術名ではなく理由とtrade-offで説明する

技術判断を説明するとき、使った技術名を並べるだけでは足りない。
発表では、その作り方を選んだ理由、他の案、今回はやらなかったこと、確かめ方を説明する。

status設計なら、次のように説明できる。

```txt
statusはdraft、learned、needs-helpの三種類に絞りました。
学習ログの状態をMVPとして説明するには十分で、入力検証もしやすいからです。
既存ログはlearned扱いにしました。
過去ログが一覧から消えると既存価値を壊すためです。
一方で、過去ログの本当の状態を区別できないtrade-offがあります。
この点はmigration-note.mdとrelease-decision.mdに残しました。
```

この説明には、判断、理由、trade-off、証拠が入っている。
聞き手は、設計が完璧かどうかだけでなく、判断の仕方を評価できる。

Googleの変更説明ガイドでも、変更説明は将来の読者がなぜ変更されたかを理解するための履歴として重要である。
発表の技術判断も同じである。
未来の自分や配属先の人が、なぜそうしたのかを理解できるように話す。

### Demo Scriptは、価値を見せるための台本である

デモは、機能一覧を順に見せる時間ではない。
主要ユーザーフローを使って、価値と動作を見せる。
デモで見せる流れは一つ、長くても二つに絞る。

```md
# Final Demo Script

## Demo Goal

相談が必要な学習ログを、statusで見つけやすくなることを見せる。

## Demo Safety and Setup

- 使用するデータは架空データだけにする。
- `.env`、内部URL、AWS account id、実ログ全文を画面に出さない。
- ブラウザの不要なtab、通知、履歴を閉じる。
- 起動コマンドと確認済みcommitをメモする。

## Initial State

複数の学習ログがあり、学習済みのログと相談が必要なログが混ざっている。

## Flow 1

| step | action | expected result | note |
| --- | --- | --- | --- |
| 1 | 一覧画面を開く | 複数のログが表示される | 既存ログが残っていることを見せる |
| 2 | needs-helpのログを作成する | statusつきで保存される | 新しいstatusの価値を見せる |
| 3 | needs-helpで絞り込む | 相談が必要なログだけが表示される | 主要価値 |

## Flow 2

| step | action | expected result | note |
| --- | --- | --- | --- |
| 1 | 不正なstatusを試す | 保存されない、またはエラーになる | security確認の補足 |
| 2 | READMEの確認手順を示す | 他者が起動できる | documentation確認 |

## If Demo Fails

| problem | what I will say | fallback evidence |
| --- | --- | --- |
| ローカル環境が起動しない | 当日の環境問題なので、事前確認の証拠で価値を示す | スクリーンショット、smoke-test-plan.md、release-decision.md |
| status絞り込みが動かない | 本来の期待結果と確認済み証拠を分けて説明する | regression-test-plan.md、実行ログ、PR summary |
| 画面に見せてはいけない情報が出そう | デモを止め、redact済み証拠に切り替える | final evidence index、redact済みスクリーンショット |

## After Demo

- **quality evidence**：production-readiness-checklist.md
- **known limitation**：大量データ時の性能は未確認
- **next improvement**：CloudWatch Logsでエラー確認手順を作る
```

デモには失敗がある。
ネットワークが不安定になる。
ローカル環境が起動しない。
ブラウザの状態が違う。
だから、fallback evidenceを用意する。
デモの目的は、画面操作を成功させることだけではなく、主張を証拠で支えることである。
見せてはいけない情報が出そうなときは、無理に続けない。
安全な代替証拠に切り替えることも、発表準備の一部である。

### PRR結果は、発表の品質証拠になる

第23章のPRR結果は、最終発表の重要な材料である。
動きました、ではなく、どの観点で確認し、何を未確認として残したかを話せる。

PRR結果がgoなら、なぜ出せると言えるのかを説明する。
go with follow-upなら、確認済みのことと、後で追うことを分ける。
no-goなら、止めた理由と、何を直せばgoに近づくかを説明する。

no-goは失敗発表ではない。
重大なリスクを見つけ、出さない判断ができたなら、それは実務に近い成果である。
たとえば、既存ログが表示されなくなる、secretがREADMEに混ざっている、不正なstatusを保存できる、rollback方針がない、といったblockerを見つけたなら、no-goの判断は妥当である。
発表では、何を根拠に止めたか、次に何を直すかを説明する。

### AI利用は、便利だったではなく検証を話す

AI利用の説明は、「Claude Codeを使いました」「ChatGPTに聞きました」だけでは足りない。
どの段階で使ったか。
何を入力したか。
何を入力しなかったか。
どの出力を採用したか。
採用前にどう確かめたか。
これを話す。

NIST AI Risk Management Frameworkは、AIのリスクを個人、組織、社会への影響として扱い、trustworthinessを設計、開発、利用、評価へ取り込むための任意利用の枠組みである。
2026年6月時点ではAI RMF 1.0の改訂も進められているため、発表では「NIST AI RMFの全項目に準拠した」とは言わない。
研修発表では大きな管理文書までは不要だが、入力前、採用前、共有前、PR前の確認は説明できるようにする。

AI利用は、次のように表にすると話しやすい。

```md
## AI Use and Verification

| stage | AI use | human check | evidence |
| --- | --- | --- | --- |
| theme refinement | テーマ候補とMVPの整理 | ユーザーと課題が広がりすぎていないか削った | project-brief.md |
| implementation | status追加の実装案 | diffを読み、テストと手動確認を行った | ai-work-log.md |
| review | 影響範囲とPRR観点の洗い出し | 実際の成果物と照合し、未確認はfollow-upにした | release-decision.md |
| presentation | 発表構成のレビュー | 自分の証拠にない話を削った | final-presentation-brief.md |
```

AIを使ったこと自体を成果にしない。
AIの出力を、自分の成果物、実行結果、公式資料、テスト、レビューで確かめたことを成果にする。

### 失敗、迷い、削った範囲を学びに変える

最終発表では、うまくいったことだけを話さなくてよい。
詰まったこと、最初の見積もりが大きすぎたこと、削った範囲、レビューで直したことも学びになる。
ただし、失敗談を長く話すだけでは弱い。
次に変える行動まで話す。

`learning-reflection.md` は次の形で書ける。

```md
# Learning Reflection

## What Went Well

| learning | evidence | next use |
| --- | --- | --- |
| Project Briefでユーザーと課題を絞れた | project-brief.md | 配属後の小さな改善でも最初に課題を書く |
| MVPを小さくしたため、最初の縦切りを動かせた | mvp-scope.md、demo-script.md | 迷ったら最初の縦切りへ戻る |
| 第23章でgo with follow-upの判断まで書けた | release-decision.md | 残リスクを隠さず説明する |

## What Was Hard

| difficulty | what happened | what I will change |
| --- | --- | --- |
| statusの種類を増やしたくなった | MVPが広がりかけた | 先にMust/Won'tを書く |
| 既存ログの扱いを後回しにしそうになった | 互換性リスクを見落としかけた | 変更前の既存動作を棚卸しする |
| AIの提案に便利機能が多かった | 範囲外の案を採用しそうになった | acceptance criteriaと照合して採否を決める |

## Decisions I Changed

| original | changed to | why |
| --- | --- | --- |
| タグ検索も入れる | status絞り込みに集中 | デモで価値を説明しやすくするため |
| 既存ログのstatusを空にする | learned扱いにする | 既存ログが一覧から消えるリスクを避けるため |

## Scope I Cut

| cut item | reason | future option |
| --- | --- | --- |
| 通知 | 外部連携と確認が増える | 配属後の改善候補 |
| status変更履歴 | DB設計とUIが大きくなる | 第22章以降の改善候補 |

## AI Use Reflection

- **useful**：影響範囲と確認観点の候補出し
- **risky**：便利機能を増やしすぎる提案が出た
- **verification**：diff、test、README、PRR文書で確認した

## Feedback I Received

| feedback | my interpretation | action | status |
| --- | --- | --- | --- |
| performance follow-upを具体化した方がよい | go with follow-upの追跡が弱い | next 90 days planへ入れる | planned |

## Next Behavior

- 実装前に既存動作の棚卸しを先に行う。
- AI出力は、採用前にacceptance criteriaと照合する。
- follow-upにはownerと期限を入れる。
```

削った範囲を話すことは、弱さではない。
限られた時間で目的に集中した判断である。
削った理由とfuture optionを言えれば、仕事としての判断になる。

### Feedback Wantedを先に出す

最終発表は、評価されるだけの場ではない。
フィードバックを受ける場でもある。
発表前に、聞き手に見てほしい観点を決める。

たとえば、次のように依頼できる。

```md
## Feedback Wanted

| question | why I want feedback | after receiving |
| --- | --- | --- |
| statusの3種類はMVPとして妥当か | 状態を増やすべきか迷った | 次の改善範囲を決める |
| go with follow-up判断でよいか | 性能未確認をどう扱うか学びたい | follow-upの優先度を調整する |
| AI利用の検証説明は十分か | 実務でどこまで説明すべきか知りたい | AI利用ログの書き方を改善する |
```

質問が具体的だと、聞き手は答えやすい。
「何かありますか」では、コメントも抽象的になりやすい。
技術判断、スコープ、品質確認、AI利用、90日計画など、見てほしい観点を先に出す。

### Next 90 Days Planは、気合いではなく行動と成果物で書く

next 90 days planは、気合いを書く文書ではない。
配属後に何を試し、何を成果物として残すかを決める文書である。
focus areaは三つ以内に絞る。
30日、60日、90日に分ける。
各期間に、action、output、success signal、support neededを書く。
success signalは、達成できたかを見分ける小さな合図である。
「頑張る」ではなく、「主要フローを1つ説明できる」「小さなPRを1つ出す」「runbookの改善案を1つ書く」のように、見える形にする。
さらに、weekly reviewを入れる。
90日計画は一度書いて終わりではなく、配属先の状況とフィードバックに合わせて更新する。

```md
# Next 90 Days Plan

## Focus Areas

1. 既存プロダクトを安全に読む力
2. 小さな改善PRを出す力
3. 運用と品質の証拠を残す力

## First 30 Days

| action | output | success signal | support needed |
| --- | --- | --- | --- |
| 配属先プロダクトの主要フローを読む | product-flow-note.md | 主要フローを1つ図か箇条書きで説明できる | メンターに入口ファイルを聞く |
| READMEとrunbookを読み、起動する | local-run-log.md | 起動手順と詰まった点を再現可能に書ける | 開発環境の前提確認 |
| 小さな不明点を相談文にする | technical-question.md | 目的、観察、試したこと、質問が分かれている | レビューしてもらう |

## Days 31-60

| action | output | success signal | support needed |
| --- | --- | --- | --- |
| 小さな改善候補を1つ選ぶ | change-impact-analysis.md | 変更対象、非対象、確認方法を説明できる | 影響範囲の確認 |
| テストまたは文書を1つ更新する | PRまたはdoc update | レビューで意図と確認結果を説明できる | レビュー観点の確認 |
| AI利用ログを残す | ai-use-log.md | 採用した提案、採用しなかった提案、検証方法が残る | チームルール確認 |

## Days 61-90

| action | output | success signal | support needed |
| --- | --- | --- | --- |
| 運用ログやユーザー影響を見て改善案を作る | improvement-proposal.md | 観察した事実と提案を分けて書ける | ログの見方を教わる |
| PRRの簡易チェックを使う | readiness-note.md | blocker、accepted risk、follow-upを分けられる | 出してよい判断のレビュー |
| 学びをチームに共有する | short demo or note | 5分で成果、確認、残課題を説明できる | 発表機会 |

## Weekly Review

| cadence | check | update |
| --- | --- | --- |
| weekly | actionは進んだか、outputは残ったか、support neededは解消したか | planを更新する |

## Questions for Assigned Team or Mentor

1. 最初に読むべき主要フローはどれですか。
2. 新人が触りやすい改善領域はどこですか。
3. AI利用のチームルールは何ですか。

## Feedback to Incorporate

| feedback | plan update |
| --- | --- |
| performance follow-upが曖昧 | Days 61-90にログ確認と改善案を入れる |

## Risks

| risk | mitigation |
| --- | --- |
| 配属先プロダクトの規模に圧倒される | 主要フローを1つに絞って読む |
| AI出力に頼りすぎる | 採用前に差分、テスト、公式資料で確認する |
```

90日計画は、長期キャリア設計ではない。
配属直後の具体的な行動計画である。
読む、作る、確認する、相談する、発表する、という行動へ落とす。
チームの状況によって計画は変わる。
だから、計画に固執するのではなく、成果物と相談事項を残しながら更新する。

### 発表構成の例

最終発表の構成は、次のようにできる。

```txt
1. Core Message
2. User, Problem, Outcome
3. Product Demo
4. Key Technical Decisions
5. Quality and PRR Evidence
6. AI Use and Verification
7. What I Cut and Learned
8. Next 90 Days Plan
9. Feedback Wanted
```

この構成では、デモを早めに置く。
ただし、デモの前にユーザーと課題を説明する。
デモの後に、技術判断と品質確認を説明する。
最後に、学びと90日計画へつなげる。

発表時間が短い場合は、技術判断を一つに絞る。
PRR結果も、すべてのチェックを話さず、release decisionと重要なrisk/follow-upだけ話す。
すべてを詳しく話すことより、発表の筋道を保つことが大切である。

### 発表前の自己レビュー

発表前に、資料の見た目だけでなく、主張と証拠が合っているかを確認する。
次の表を使う。

```md
# Final Presentation Self Review

| area | check | evidence | status | fix before presentation |
| --- | --- | --- | --- | --- |
| value | user、problem、outcomeが一文でつながっている | project-brief.md | pass / fix |  |
| scope | 作ったものと作らなかったものが分かる | mvp-scope.md、learning-reflection.md | pass / fix |  |
| demo | デモが主要価値を示している | final-demo-script.md | pass / fix |  |
| technical decision | 理由、trade-off、証拠がある | final-presentation-brief.md | pass / fix |  |
| quality | test、security、accessibility、PRR結果を説明できる | readiness documents | pass / fix |  |
| AI use | どこに使い、どう検証し、何を採用しなかったかが分かる | ai-work-log.md | pass / fix |  |
| risk | accepted risk、follow-up、no-go理由を隠していない | release-decision.md | pass / fix |  |
| safety | secret、個人情報、本番データ、内部URL、AWS account idを含めない | final evidence index | pass / fix |  |
| next step | 90日計画がaction、output、success signalになっている | next-90-days-plan.md | pass / fix |  |
```

自己レビューでfixが残ったままなら、発表資料を増やすより先に直す。
特に、安全性と証拠の不足は優先して直す。
時間が足りない場合は、証拠がない主張を削るか、未確認として話す。

### no-goの場合も発表は成立する

第23章でno-goになった場合でも、最終発表は成立する。
no-goは、重大なリスクが残るので今は出さないという判断である。
実務では、止める判断も重要な成果である。

no-goの場合は、次を話す。

- release candidateは何だったか。
- どの確認でblockerを見つけたか。
- blockerの利用者影響、安全性影響、運用影響は何か。
- なぜgo with follow-upではなくno-goにしたか。
- 次に何を直せばgoに近づくか。
- その判断から何を学んだか。

未完成を隠すより、止めた理由と次の行動を説明する方が実務に近い。
発表では、結果の良し悪しだけでなく、判断の根拠を見る。

### AIに発表構成を相談するときの注意

AIは、発表構成のレビューに使える。
話の順番、抜けている観点、技術判断の説明、90日計画の具体化を手伝わせることができる。
ただし、AIに発表を丸ごと作らせると、自分の成果物にない話が混ざることがある。
AIは、手元の証拠を知らない限り、もっともらしい発表を作る。

AIに相談するときは、次のように依頼する。

```txt
最終発表の構成を作っています。

中心メッセージ:
研修中の学習ログを整理し、相談が必要なログを見つけやすくするWebアプリを作り、status追加の改善とリリース前確認まで行いました。

発表に入れたい内容:
- ユーザー、課題、成果
- デモ
- 重要な技術判断
- 品質確認とPRR結果
- AI利用と検証
- 失敗と学び
- 次の90日計画

手元の根拠:
- project-brief.md
- mvp-scope.md
- improvement-pr-summary.md
- production-readiness-checklist.md
- release-decision.md

お願い:
1. 発表構成をレビューしてください。
2. 成果物と説明がつながっていない箇所を指摘してください。
3. 技術判断の説明として不足しそうな観点を挙げてください。
4. AI利用について、入力前、採用前、共有前、PR前の確認が足りているか見てください。
5. next 90 days planを、行動と成果物が分かる形に改善してください。
```

AIの出力をそのまま発表内容にしない。
自分の成果物、確認結果、メンターのフィードバックに合わせて修正する。
証拠にない話は削る。

### 最終発表で起きやすい誤解

- 発表をスライドの見栄えで考える。先にevidence indexとpresentation briefを作る。
- 成果物を全部見せようとする。core evidenceとsupporting evidenceを分ける。
- デモを機能一覧にする。主要ユーザーフローで価値を見せる。
- 技術判断を技術名の羅列にする。理由、trade-off、証拠を話す。
- PRR結果を省略する。出してよいかをどう判断したかが重要である。
- no-goを失敗として隠す。止めた理由と次の行動を説明する。
- AI利用を便利だった感想で終える。どこに使い、どう検証したかを話す。
- 失敗談を長く話し、次の行動へつなげない。
- 90日計画を気合いにする。action、output、support neededで書く。
- 90日計画に成功条件がない。success signalとweekly reviewを入れる。
- feedback wantedを出さない。聞き手に見てほしい観点を指定する。
- secretや実在データを発表資料に入れる。do not showを先に作る。

### 発表証拠と90日計画で確認すること

この章では、`final-evidence-index.md`、`final-presentation-brief.md`、`final-demo-script.md`、`learning-reflection.md`、`next-90-days-plan.md` を作る。

最初に、第1章から第23章までの成果物を棚卸しする。
すべてを読み込む必要はない。
発表で使う可能性が高いものから見る。
第21章のproject briefとMVP、第22章のimprovement PR summary、第23章のproduction readiness checklistとrelease decisionを先に開く。

次に、`final-evidence-index.md` を作る。
core evidence、supporting evidence、missing evidence、do not showを分ける。
source of truth、safe to show、fallbackも書く。
secret、実在の個人情報、本番データ、AWS account id、内部URL、実ログ全文が含まれていないか確認する。

次に、`final-presentation-brief.md` を作る。
Core Messageを一文で書く。
User、Problem、Outcome、Product Summary、Key Technical Decisions、Quality and PRR Evidence、AI Use and Verification、Risks and Follow-up、Feedback Wantedを埋める。
強い主張には証拠を対応させ、証拠がない主張は弱める。

次に、`final-demo-script.md` を作る。
Demo Goal、Demo Safety and Setup、Initial State、Flow、If Demo Fails、After Demoを書く。
デモで見せるflowは一つから二つに絞る。
fallback evidenceも用意する。

最後に、`learning-reflection.md` と `next-90-days-plan.md` を作る。
reflectionでは、うまくいったこと、難しかったこと、変えた判断、削った範囲、AI利用の学び、次に変える行動を書く。
90日計画では、focus areaを三つ以内に絞り、30日、60日、90日のaction、output、success signal、support needed、weekly reviewを書く。

### 最終発表で持ち帰ること

第24章で身につけるべきことは、研修成果を発表と次の行動へ変換する力である。
最終発表は、成果物のショーケースではない。
自分がどう考え、作り、確認し、学んだかを、証拠つきで説明する場である。

final evidence indexで証拠を選ぶ。
final presentation briefで、価値、判断、品質、AI利用、リスク、フィードバック観点をつなぐ。
final demo scriptで、主要ユーザーフローと代替証拠を用意する。
learning reflectionで、失敗、迷い、削った範囲を次の行動へ変える。
next 90 days planで、配属後に何を読み、何を作り、何を確認し、誰に相談するかを決める。

Bootcamp 1のゴールは、すべてを一人で完璧にできるようになることではない。
価値を確認し、手元で動かし、小さく変更し、テストし、レビューを受け、運用や文書まで含めて説明する。
その流れを一度通し、次の仕事で再利用できる形にすることである。

### 研修の終わりから実務へ

この章でBootcamp 1は終わる。
しかし、ここで作った文書は終わりの記念品ではない。
配属後の最初の相談、最初のPR、最初のレビュー依頼、最初の運用確認で再利用できる作業の型である。

分からないことが出たら、技術名だけを検索する前に、どの章の型が使えるかを考える。
価値を確認するなら第2章。
AIを使うなら第3章、第18章、第19章。
チームに相談するなら第4章。
既存コードを読むなら第8章。
ドメイン、データ、API、画面、テスト、セキュリティを見るなら第9章から第14章。
運用やPRRを見るなら第17章、第23章。
文書に残すなら第20章。

最終発表は、研修の締めではなく、次の仕事への入口である。

### 参考資料

- [Google for Developers: Technical Writing](https://developers.google.com/tech-writing)
- [Software Engineering at Google](https://abseil.io/resources/swe-book/html/toc.html)
- [Diátaxis](https://diataxis.fr/)
- [Principles behind the Agile Manifesto](https://agilemanifesto.org/principles.html)
- [Google Engineering Practices: Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

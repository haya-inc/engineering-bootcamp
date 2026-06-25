---
title: "第21章 個人開発プロジェクト"
part: 6
partLabel: "Part 6 最終プロジェクト"
order: 21
---

第21章から、最終プロジェクトのPartに入る。
ここまでの20章では、価値、AI利用、チーム連携、ローカル環境、Git、HTTP、既存コード、ドメイン、データ、API、フロントエンド、テスト、セキュリティ、コンテナ、クラウド、CI/CD、オブザーバビリティ、生成AI、AIコーディング、技術文書を扱ってきた。
第21章では、それらを自由テーマの小さなWebアプリへ統合する。

自由テーマという言葉には、魅力と危うさがある。
自分で作りたいものを選べるのは楽しい。
しかし、自由だからこそ、範囲はすぐに広がる。
技術的に面白そうな機能を入れたくなる。
通知、外部API、認証、ダッシュボード、AI機能、スマートフォン対応、管理画面を入れたくなる。
気づくと、誰の何を良くするのかが薄くなり、最後に「いろいろ作りかけたが説明しにくいもの」が残る。

この章の目的は、大きなプロダクトを作ることではない。
誰のどんな困りごとを扱うのかを説明し、最初に価値を確かめるMVPを決め、一つの縦切り実装を動かし、README、進捗ログ、セルフレビュー、デモ台本、レビュー依頼で説明できる状態にすることである。
小さくてもよい。
むしろ、最初は小さくなければならない。
小さく動くものを作り、確認し、説明できる状態が、第22章の改善、第23章の本番前確認、第24章の最終発表へつながる。

### この章を読み終えるとできるようになること

- 自由テーマを、ユーザー、困りごと、成果、扱うデータ、対象外へ分けて説明できる。
- 研修でレビュー可能なテーマかどうかを、実装量、外部依存、データ安全性、確認方法で判断できる。
- MVPを「手抜き版」ではなく、最初に価値を確かめる小さな完成形として切れる。
- 受け入れ条件を、画面操作、保存結果、エラー時、再起動後、README手順で確認できる形に書ける。
- 最初の縦切り実装を、画面、処理、データ保存、確認ログまで一筋で通せる。
- AIへ任せる作業と、人間が必ず確認する作業を分け、AIの出力を採用した根拠を残せる。
- self-review、demo script、mentor review requestを使って、メンターが見やすいレビュー入口を作れる。

### この章で扱う範囲

この章では、自由テーマを次の順序でプロジェクトに変える。

```txt
theme
  -> project brief
    -> MVP scope
      -> delivery plan
        -> first vertical slice
          -> progress log
            -> self review
              -> demo script
                -> mentor review request
```

最初に、テーマを選ぶ。
次に、project briefで、ユーザー、課題、成果、範囲、制約、データ安全性を言葉にする。
その後、MVP scopeで、必ず作るもの、できれば作るもの、今回は作らないものを分ける。
delivery planでは、最初の縦切り実装、保存するデータ、タスク、AI利用、確認コマンドを決める。
実装中はprogress logを残す。
最後にself-review、demo script、mentor review requestを作り、レビューを受けられる状態にする。

この章では、AWSデプロイや本番運用の詳細は必須にしない。
それらは第23章で扱う。
既存プロダクトへの仕様変更も、第22章で扱う。
第21章では、まず自分で選んだテーマを、ローカルで動き、説明でき、レビューできる小さなプロダクトにする。

### 自由テーマにも条件がある

自由テーマとは、何でも好きに作ってよいという意味ではない。
何を作るかを自分で選ぶが、研修成果物として評価できる条件を満たす必要がある。

条件は複雑ではない。
Webアプリケーションであること。
一つ以上のユーザー操作があること。
一つ以上の永続化されるデータがあること。
ローカルで起動できること。
READMEに起動方法と確認方法が書かれていること。
最初のデモで見せる操作が決まっていること。
受け入れ条件と確認ログが残ること。
secret、実在の顧客情報、実在の個人情報を扱わないこと。
AIを使った場合、利用範囲と検証結果を残すこと。

この条件は、自由を狭めるためではない。
レビューできる成果物にするためである。
動く画面があり、保存されるデータがあり、確認方法があり、扱うデータが安全であれば、メンターは具体的にレビューできる。
逆に、テーマが大きくても、誰の課題か分からず、何を確認すればよいか分からないものは、レビューしにくい。

Agile Manifestoは、動くソフトウェアや変化への対応を重視する。
その原則の中には、価値あるソフトウェアを早く継続的に届けること、動くソフトウェアを進捗の主要な尺度とすること、作らない作業の量を最大化する単純さが重要だという考え方がある。
個人開発でも同じである。
最初から全部作るのではなく、小さく価値を見せる。
作らないものを決める。
動くものを確認する。

### テーマは、機能名ではなく困りごとから選ぶ

テーマ選びで最初に書くのは、機能名ではない。
ユーザーと困りごとである。
「タスク管理アプリを作る」だけでは広すぎる。
誰のタスクなのか。
どの場面で困るのか。
作った後、何が少し良くなるのか。
そこまで書くと、プロジェクトが小さくなる。

たとえば、次の四つは個人開発の候補になる。

| candidate | user | problem | MVP example | avoid |
| --- | --- | --- | --- | --- |
| 学習ログ整理アプリ | 研修中の受講者 | 学んだこと、詰まったこと、次に聞きたいことが散らばる | ログ登録、状態やタグでの一覧、相談したい項目の抽出 | SNS化、通知、複雑な権限管理 |
| 個人タスク棚卸しアプリ | 自分の作業を整理したい若手エンジニア | 作業、相談、調査、レビュー待ちが混ざり、次に何をするか迷う | タスク登録、状態変更、今日やるものの表示 | 多人数共有、カレンダー同期、複雑な通知 |
| 読書メモと実践メモ管理アプリ | 技術書や記事を実務に活かしたいエンジニア | 読んだ内容と自分の行動がつながらない | メモ登録、学び、試すこと、結果の記録、未実践メモ一覧 | 記事全文保存、外部記事クローリング |
| 小さな在庫・備品メモアプリ | 個人または小さなチームで備品を管理する人 | 何が足りないか、最後に確認したのがいつか分からない | 備品登録、数量と最終確認日の更新、不足しそうなものの一覧 | 会計、発注、外部サービス連携 |

良いテーマは、すぐに大きくしない。
ユーザーを一種類に絞る。
主要な流れを一つに絞る。
扱うデータを安全にする。
最初のデモで何を見せるかが想像できる。

避けたいテーマもある。
SNS、課金、通知、多人数共有、複雑な認証を最初から含むもの。
実在する顧客情報、実在の個人情報、本番データを扱うもの。
外部API、メール、決済、クローリングなど、確認事項が急に増えるもの。
新しい技術を試すことだけが目的で、ユーザーや課題を説明しにくいもの。

これらを絶対に作ってはいけないわけではない。
ただし、研修の最終プロジェクトでは、短い期間でレビュー可能な成果へ持っていく必要がある。
複雑なテーマは、学習の中心を実装から調整、規約、外部依存、権限、事故対応へ移してしまう。
第21章では、まずローカルで安全に動く小さなWebアプリを選ぶ。

### テーマ確定前に、実装量とリスクを一度見る

テーマ候補が出たら、すぐ実装に入らない。
短くてもよいので、実装量とリスクを確認する。
この確認をしないと、作り始めてから外部サービス、権限、データ安全性、法務、運用の確認が増え、MVPではなく調整作業が中心になる。

テーマ確定前には、次の表を埋める。

| check | 見ること | 危ない例 | 小さくする例 |
| --- | --- | --- | --- |
| user | 使う人を一種類に絞れるか | 学生、社会人、管理者、講師すべて | 研修中の自分だけ |
| main flow | 最初のデモを5分以内で見せられるか | 登録、共有、通知、分析、管理を全部見せる | 1件登録して一覧で見る |
| data | 実在の個人情報や顧客情報を使わずに作れるか | 実名、メール、社内ログを保存する | 架空データだけを保存する |
| external dependency | 外部API、メール、決済、認証なしで価値を見せられるか | 外部APIが落ちるとデモできない | 手入力またはローカルのサンプルで動かす |
| verification | 完了条件を操作と結果で確認できるか | 「便利になった気がする」だけ | 保存後に一覧へ出る、空入力で保存しない |
| next chapter | 第22章で小さな改善を入れやすいか | 一度きりのスクリプトで画面がない | 状態変更や絞り込みを後で足せる |

この表は、テーマを否定するためではない。
最初の完成形を小さくするための確認である。
大きな構想は、Out of ScopeやDeferred Workに残せばよい。
第21章で必要なのは、最初の縦切りを動かし、確認し、レビューを受けられる状態にすることだ。

### Project Briefは、開発の基準点である

Project Briefは、個人開発の企画メモである。
大きな企画書ではない。
開発中に迷ったとき、何に戻ればよいかを示す基準点である。

Project Briefには、Title、User、Problem、Outcome、Success Signal、Main Flow、In Scope、Out of Scope、Constraints、Data Safety、AI Use Plan、Riskiest Assumption、Mentor Questionsを書く。
機能名を並べるだけでは足りない。
誰が、何に困っていて、何が良くなればよいのかを言葉にすることだ。

学習ログ整理アプリなら、次のように始められる。

```md
# Project Brief / 企画メモ

## Title

学習ログ整理アプリ

## User

研修中の受講者。毎日の学習内容、詰まったこと、次に相談したいことを整理したい人。

## Problem

学習ログ、メモ、相談したいことが複数の場所に散らばり、メンターへ何を相談すべきか分かりにくくなる。

## Outcome

今日の学び、詰まり、次に相談したいことを一つの一覧で確認できる。
相談前に、自分が何に困っているかを短く説明できる。

## Success Signal

デモで、ログを1件登録し、相談したいログだけを一覧で見せられる。
READMEの手順で別の人がローカル起動できる。

## Main Flow

1. 学習ログを登録する。
2. 状態とタグを付ける。
3. 一覧で確認する。
4. 相談したいログだけを見る。

## In Scope

- ログ登録
- ログ一覧
- 状態での絞り込み
- READMEに起動方法と確認方法を書く

## Out of Scope

- SNS化
- 通知
- 複数ユーザー共有
- 外部記事の取り込み
- 本番デプロイ

## Constraints

- ローカルで動けばよい。
- 実在の個人情報は扱わない。
- 1週間以内に最初の縦切りを動かす。

## Data Safety

- **secret**：扱わない
- **個人情報**：実在人物の名前や連絡先は入れない
- **顧客情報**：扱わない
- **外部データ**：記事全文や社内資料は保存しない

## Data Lifecycle

| data | store? | sample only? | delete/update method | AI input allowed? |
| --- | --- | --- | --- | --- |
| 学習ログtitle | yes | yes | ローカルDBを削除、または削除ボタン | yes、架空データのみ |
| 学習ログbody | yes | yes | ローカルDBを削除、または削除ボタン | yes、架空データのみ |
| 実名、メール、社員番号 | no | no | 保存しない | no |

## AI Use Plan

| work | use AI? | human verification |
| --- | --- | --- |
| theme refinement | yes | ユーザーと課題が広がりすぎていないか自分で削る |
| implementation | yes | diffを読み、ローカルで動かす |
| test ideas | yes | 受け入れ条件と対応しているか確認する |
| README draft | yes | 事実とコマンドが正しいか実行して確認する |

## AI Checkpoints

| checkpoint | what to check | result |
| --- | --- | --- |
| 入力前 | secret、実在の個人情報、実在の顧客情報を入れていない |  |
| 採用前 | AIの案を自分で動かす、読む、削る |  |
| 共有前 | README、レビュー依頼、デモ台本に危険な情報がない |  |
| PR前 | 差分、テスト、残課題を自分で確認した |  |

## Riskiest Assumption

状態を `未整理`、`相談したい`、`解決済み` の三つに絞っても、相談前の整理に足りる。

## Evidence Needed

- 状態を変更したログが一覧で分かる。
- `相談したい` のログだけを表示できる。
- 空のtitleを保存しない。

## Mentor Questions

- 状態の種類は、未整理、相談したい、解決済みの三つで十分か。
- 最初のMVPにタグ絞り込みまで入れるべきか。
```

Project Briefは、最初に完璧に書く必要はない。
ただし、空欄のまま進めない。
途中で判断が変わったら、progress logに理由を残し、briefも更新する。
企画メモは、開始時の儀式ではなく、開発中の基準点である。

### Data Safetyを最初に見る

個人開発では、作りたいものに近い実データを使いたくなることがある。
しかし、研修成果物でsecret、実在の個人情報、顧客情報、本番データを扱う必要はない。
安全なサンプルデータで十分である。

Data Safetyでは、次を確認する。

- secretを保存しない。
- 実在の氏名、メールアドレス、電話番号、住所、社員番号を使わない。
- 顧客名、契約情報、社内資料、本番ログを使わない。
- AIへ入力する情報に、未公開情報や個人情報を含めない。
- サンプルデータは架空であることが分かるようにする。
- READMEやデモ台本にも危険な情報を載せない。
- データを消す方法、またはサンプルデータを初期化する方法をREADMEへ書けるか確認する。

AIを使う場合は特に重要である。
NIST AI Risk Management Frameworkでは、AIリスク管理をGovern、Map、Measure、Manageという機能で整理する。
個人開発では大きなガバナンス文書を作る必要はないが、少なくとも入力前、採用前、共有前、PR前の確認を入れる。
AIに任せることと、人間が確認することを分ける。

### MVPは、最初に価値を確かめる小さな完成形である

MVPは、Minimum Viable Productの略である。
日本語では、最初に価値を確かめる小さな完成形、と考えるとよい。
MVPは、手を抜いた版ではない。
また、作りたいものを諦めるための表でもない。
最初に何を完成させるかを決める道具である。

学習ログ整理アプリなら、最初のMVPは次のように切れる。

```md
# MVP Scope

## Product

学習ログ整理アプリ

## Must

| item | acceptance criteria | verification |
| --- | --- | --- |
| ログを登録できる | titleとbodyを入力して保存できる | 手動確認、必要ならAPI test |
| 一覧で見られる | 保存したログが一覧に表示される | 手動確認 |
| 状態で絞り込める | `相談したい` のログだけを表示できる | 手動確認、queryまたは画面操作 |
| README通りに起動できる | セットアップ、起動、確認手順がREADMEにある | READMEに沿って実行 |

## Should

- タグを付けられる
- 日付で並び替えられる

## Could

- 簡単な件数集計を表示する

## Won't

| item | reason |
| --- | --- |
| SNS化 | 主要課題が学習ログ整理から広がるため |
| 通知 | 外部連携と確認項目が増えるため |
| 多人数共有 | 認証と認可が必要になり、MVPが大きくなるため |
| 外部記事取り込み | 著作権やクローリングの確認が必要になるため |

## First Demo Flow

1. ローカルでアプリを開く。
2. 学習ログを1件登録する。
3. 一覧に表示されることを見る。
4. 状態を `相談したい` にして絞り込む。
5. 今回未対応の機能と次の改善候補を説明する。

## Risks

| risk | mitigation |
| --- | --- |
| 状態やタグが増えすぎる | MVPでは状態を3種類に絞る |
| 実データを入れたくなる | 架空データだけを使う |
| UIを作り込みすぎる | 最初は主要操作の通過を優先する |
```

Mustは少なくする。
多くても三つ程度に絞る。
Mustが十個あるなら、それはMVPではなく最終構想になっている可能性が高い。
ShouldとCouldは、後で追加できる。
Won'tは、作らないものを明示する欄である。
ここが空だと、開発中に範囲が膨らみやすい。

### 完了条件は、実装したではなく確認できたで書く

「ログ登録を実装する」は、完了条件として弱い。
どの操作ができればよいのか。
保存されたかどうかをどう見るのか。
未入力のときはどうなるのか。
README通りに別の人が起動できるのか。
これらが分からないと、完成したかどうかを判断できない。

acceptance criteriaは、確認可能な形で書く。

```md
- [ ] titleとbodyを入力して保存すると、一覧に新しいログが表示される
- [ ] titleが空のときは保存せず、エラーメッセージを表示する
- [ ] 状態を `相談したい` に変更すると、絞り込み一覧に表示される
- [ ] アプリを再起動しても保存済みログが残る
- [ ] READMEの手順でセットアップ、起動、確認ができる
```

このように書くと、実装、テスト、デモ、セルフレビューがつながる。
AIに実装を頼むときも、acceptance criteriaを渡せる。
メンターへレビュー依頼を出すときも、何を確認してほしいかを伝えられる。

受け入れ条件には、成功時だけでなく、最低限の失敗時や空状態も入れる。
個人開発では「動いた」だけで進めたくなるが、未入力、空の一覧、再読み込み後、保存失敗時のどれか一つでも確認しておくと、レビューで会話しやすい。
すべてを自動テストにする必要はない。
ただし、手動確認なら、どの画面で何を入力し、何を期待し、実際にどうなったかをverification logに残す。

### 技術構成は、目的より先に出さない

個人開発では、新しい技術を試したくなる。
それ自体は悪くない。
しかし、技術構成が目的より先に来ると、プロジェクトの軸がぶれる。
「このフレームワークを使いたい」「このDBを試したい」「AI機能を入れたい」が先に立つと、ユーザーの困りごとが後付けになる。

第21章では、研修で使ってきた標準構成を基本にする。
Webアプリとして、画面、APIまたは処理、データ保存、確認、READMEをそろえる。
AWSデプロイは必須にしない。
外部API、メール、決済、複雑な認証は、必要性とリスクを説明できる場合だけ採用する。

技術選定は、次の順で考える。

```txt
user problem
  -> main flow
    -> data to store
      -> UI and API
        -> verification
          -> technology
```

技術は最後に出す。
ユーザー、流れ、データ、確認が決まると、必要な技術は自然に絞られる。

### 縦切り実装で、最初の細い流れを通す

vertical slice、縦切り実装とは、一つのユーザー操作が、画面、APIまたは処理、データ保存、確認まで通る最小単位である。
画面だけを長く作り込むことでも、DBだけを先に作り込むことでもない。
細くてもよいので、端から端まで通す。

学習ログ整理アプリなら、最初の縦切りは「ログを1件作成し、一覧に表示する」でよい。
この流れには、保存する項目、入力画面、保存処理、一覧画面、確認手順が含まれる。
タグ検索や集計は後でよい。
まず、ひとつのログが保存され、見えることを確認する。

縦切りができると、相談しやすい。
「ここまで動いています。次に状態絞り込みを足す予定です」と説明できる。
レビューもしやすい。
メンターは、UI、API、DB、README、確認方法を一つの流れで見られる。
第22章で改善を入れるときも、壊してはいけない既存動作として使える。

最初の縦切りには、最低限の証拠をそろえる。

| evidence | 何を残すか |
| --- | --- |
| screen or API flow | どの画面またはAPIで、どの操作をしたか |
| persisted data | 保存した値が、一覧、DB、再起動後のどこかで確認できること |
| validation or empty state | 未入力や空一覧など、最低一つの失敗時または空状態 |
| command result | 起動、テスト、lint、型チェック、手動確認の結果 |
| README update | 他者が同じ確認をできる手順 |

この証拠があると、「実装しました」ではなく「ここまで確認しました」と言える。

### Delivery Planで、作業をレビュー可能な単位にする

delivery planは、作業計画である。
単なるTODOリストではない。
最初の縦切り、保存するデータ、タスク、AI委任、人間の確認、実行コマンド、進捗ログのルールをまとめる。

GitHub Issuesでは、ideas、tasks、bugsなどをissueとして記録し、sub-issuesやdependencies、labelsで作業を分けて追跡できる。
GitHub Projectsでは、issuesやpull requestsと連動するtable、board、roadmapで作業を見られる。
研修では必ずしもGitHub Projectsを使う必要はないが、考え方は同じである。
作業は、追跡できる小さな単位にする。

`delivery-plan.md` は次の形で書ける。

```md
# Delivery Plan / 作業計画

## First Vertical Slice

学習ログを1件登録し、一覧に表示する。

## Data to Store

| field | purpose | example | required? |
| --- | --- | --- | --- |
| title | ログの短い見出し | HTTPの復習 | yes |
| body | 学んだことや詰まり | requestとresponseを整理した | yes |
| status | 状態で絞り込む | 相談したい | yes |
| tags | 後で分類する | web, api | no |
| created_at | 登録日時 | 2026-06-25 | yes |

## Tasks

| id | task | files or area | done when | verification |
| --- | --- | --- | --- | --- |
| T1 | 保存する項目を決める | schema/model | fieldの意味と必須が説明できる | design note確認 |
| T2 | ログ登録処理を作る | APIまたはserver action | title/body/statusを保存できる | 手動確認またはtest |
| T3 | 登録画面を作る | UI | 入力して保存できる | browserで確認 |
| T4 | 一覧画面を作る | UI | 保存済みログが表示される | browserで確認 |
| T5 | READMEを更新する | docs | 起動と確認手順がある | README通りに実行 |

## AI Delegation

| task | AI role | human check |
| --- | --- | --- |
| T1 | field候補の抜け漏れ確認 | 実データや個人情報を扱わないか確認 |
| T2 | 実装案の下書き | diffを読み、testまたは手動確認 |
| T5 | README下書き | commandを実行して事実確認 |

## Human Checkpoints

| timing | check |
| --- | --- |
| before implementation | scope still fits MVP |
| after AI output | run/read before adopting |
| before sharing | no secret or real personal/customer data |
| before review request | README, verification, known issues are updated |

## Commands

| purpose | command | expected result |
| --- | --- | --- |
| setup | `npm install` | 依存関係が入る |
| dev server | `npm run dev` | localhostで開ける |
| test | `npm test` | 主要テストが通る |
| lint/typecheck | `npm run lint` / `npm run typecheck` | errorがない、または既知の失敗を説明できる |

## Progress Log Rule

- **update timing**：作業開始時、確認後、詰まったとき
- **what to write**：done、verification、decisions、blockers、next
- **where to write**：`project-progress-log.md`
```

タスクは、レビュー可能な粒度にする。
「フロント実装」「バックエンド実装」だけでは大きすぎる。
「ログ登録画面を作る」「保存処理を作る」「空の一覧表示を作る」「READMEに確認方法を書く」のように、完了条件と確認方法を持てる単位へ分ける。

### AIは、範囲整理と確認補助に使う

個人開発でもAIは使える。
テーマ候補の整理、MVPの絞り込み、タスク分解、実装案、テスト観点、README、レビュー依頼、デモ台本の下書きに役立つ。
ただし、AIの提案は広がりやすい。
便利そうな機能を増やす。
新しい技術を足す。
まだ必要ない抽象化を入れる。
だから、AIに頼む前にProject BriefとMVP Scopeを書く。

AIに相談するなら、次のように依頼する。

```txt
自由テーマの個人開発プロジェクトを計画しています。

ユーザー:
研修中の自分

課題:
学習ログ、詰まったこと、次に相談したいことが散らばっています。

作りたいもの:
学習ログを登録し、状態やタグで一覧できる小さなWebアプリです。

制約:
- まずローカルで動けばよい
- 実在の個人情報は扱わない
- 最初のMVPは1週間以内に作れる範囲にしたい

お願い:
1. MVPのMust/Should/Could/Won'tを提案してください。
2. 最初の縦切り実装を1つ提案してください。
3. レビュー可能なタスクに分解してください。
4. 受け入れ条件を具体化してください。
5. ただし、SNS化、通知、多人数共有、外部API連携は提案しないでください。
```

AIの出力をそのまま採用しない。
自分の時間、技術力、研修の評価観点に合わせて削る。
特に、secret、実在の個人情報、顧客情報、社内資料、本番ログは入力しない。
AIが書いたコードやREADMEは、自分で実行し、読んでから採用する。

AI利用ログには、少なくとも次を残す。

| item | 書くこと |
| --- | --- |
| purpose | 何のためにAIを使ったか |
| input summary | 入力した情報の概要。secretや個人情報を入れていないこと |
| adopted | 採用した提案 |
| rejected | 採用しなかった提案と理由 |
| verification | 採用後に読んだ差分、実行したコマンド、手動確認 |

このログは、AIに頼りすぎていないことを示すためだけではない。
後で不具合が出たとき、どの判断をAIから取り入れ、人間が何を確認したかを追えるようにするためである。

### Progress Logは、作業の証拠になる

個人開発では、作業の途中経過が見えにくい。
最後に成果物だけを出すと、どこで判断したのか、何を確認したのか、何に詰まったのかが分からない。
progress logは、その過程を短く残すための文書である。

progress logは長文でなくてよい。
今日やったこと、確認結果、判断、詰まり、次にやることが分かればよい。

```md
# Project Progress Log

## 2026-06-25

### Done

- Project Briefを作成した。
- MVPをログ登録、一覧、状態絞り込みに絞った。
- 保存するfieldをtitle、body、status、tags、created_atにした。

### Verification

| command or action | result | note |
| --- | --- | --- |
| README draft review | pass | 起動手順は未確認 |
| schema review | pass | 実在の個人情報を保存しない |

### Decisions

- 通知と多人数共有はOut of Scopeにした。
- 最初の縦切りは、ログを1件登録して一覧に表示する流れにした。

### Blockers

- 状態の種類を3つにするか4つにするか未確定。

### Next

- 登録画面と保存処理を作る。
- READMEの起動手順を実行して確認する。
```

progress logは、自分のためにもメンターのためにも役立つ。
詰まったとき、メンターはログを見ることで、どこまで確認済みかを把握できる。
最終発表の準備では、判断の変化や確認結果を思い出す材料になる。

### READMEは、他者が起動できる状態にする

第20章で見たように、READMEは入口である。
個人開発でも、READMEは必須である。
動くアプリを作っても、自分以外が起動できなければレビューしにくい。

READMEには、Local Setup、Run、Verification、Known Limitations、Demo Flow、Verification Logを書く。

```md
## Local Setup

1. Node.jsのversionを確認する。
2. 依存関係を入れる。
3. 必要な環境変数がある場合は、サンプルを見て設定する。

## Run

Commands:

- `npm install`
- `npm run dev`

ブラウザで `http://localhost:3000` を開く。

## Verification

Commands:

- `npm test`
- `npm run lint`

手動確認:

1. 学習ログを1件登録する。
2. 一覧に表示されることを確認する。
3. 状態を `相談したい` にする。
4. `相談したい` のログだけを表示する。

## Known Limitations

- 通知は未対応。
- 多人数共有は未対応。
- サンプルデータは架空データのみを使う。

## Demo Flow

1. 空の一覧を開く。
2. 学習ログを登録する。
3. 一覧に表示される。
4. 状態で絞り込む。

## Verification Log

| check | where | command or operation | expected | actual | result |
| --- | --- | --- | --- | --- | --- |
| setup | terminal | `npm install` | dependency install succeeds | succeeded | pass |
| dev server | terminal | `npm run dev` | localhostで開ける | opened at `http://localhost:3000` | pass |
| main flow | browser | ログ登録と一覧表示 | 保存したログが一覧に出る | 表示された | pass |
| validation | browser | title空で保存 | 保存せずエラー表示 | エラー表示された | pass |
| lint | terminal | `npm run lint` | errorなし |  | pass / fail |
```

READMEのコマンドは、実行して確認する。
AIが書いたコマンドをそのまま置かない。
自分の環境でしか動かないpath、secret、個人情報、未公開情報を書かない。

### Self Reviewは、メンターに出す前の品質確認である

Self Reviewは、誤字確認ではない。
メンターに見せる前に、自分で価値、動作、確認、安全性、アクセシビリティ、既知の問題を見る作業である。

完璧である必要はない。
むしろ、既知の問題や未対応の範囲を隠さないことが重要である。
第23章のProduction Readiness Reviewでも、残るリスクを見えるようにする。
その練習として、個人開発でもself-reviewを書く。

```md
# Self Review

## Value

- **user**：研修中の受講者
- **problem**：学習ログ、詰まり、相談事項が散らばる
- **outcome**：相談前に、今日の学びと詰まりを一覧で確認できる

## Working Demo

- **local URL**：`http://localhost:3000`
- **demo flow**：ログ登録、一覧表示、状態絞り込み

## Verification

| item | result | evidence |
| --- | --- | --- |
| setup | pass / fail | README手順 |
| main flow | pass / fail | 手動確認 |
| test | pass / fail / skipped | command result |
| lint/typecheck | pass / fail / skipped | command result |
| accessibility basics | pass / fail / skipped | label、keyboard、error表示 |
| security basics | pass / fail / skipped | secretなし、架空データのみ |
| data safety | pass / fail | 実在の個人情報、顧客情報、本番ログなし |
| AI use | pass / fail / skipped | 採用、非採用、検証結果 |

## Known Issues

- 状態名は仮であり、メンターに確認したい。

## Deferred Work

- タグ絞り込み
- 日付絞り込み
- 簡単な集計

## Chapter 22 Hand-off

- **behavior to preserve**：ログ登録後、一覧に表示される
- **data to preserve**：title、body、status、created_at
- **README sections to keep working**：Local Setup、Run、Verification
- **small improvement candidate**：状態変更を一覧からできるようにする

## What I Want Reviewed

1. MVPの範囲が広すぎないか。
2. データ項目が学習ログとして妥当か。
3. READMEの確認手順で他者が動かせるか。
```

Self Reviewは、第22章への受け渡しでもある。
第22章では、このプロダクトを既存プロダクトとして扱い、小さな改善を入れる。
そのとき、壊してはいけない振る舞い、保存されるデータ、READMEの起動手順、次に改善したい候補が必要になる。

レビュー依頼前には、次のゲートを通す。

| gate | 確認すること |
| --- | --- |
| value | ユーザー、課題、成果を1分で説明できる |
| scope | MustとWon'tが矛盾していない |
| behavior | 最初の縦切りがローカルで動く |
| evidence | README、verification log、self-reviewが現在の実装と一致している |
| safety | secret、実在の個人情報、顧客情報、本番ログがない |
| honesty | 失敗したテスト、未実施の確認、既知の問題を隠していない |

### Demo Scriptは、価値と動作を短く見せる台本である

デモは、機能一覧を順番に見せる場ではない。
誰のどんな課題を、どの操作で少し良くするかを見せる場である。
デモ台本には、opening、initial state、steps、expected result、failure or empty state、not covered today、next improvementを書く。

```md
# Demo Script

## Opening

研修中の受講者が、学習ログと相談事項を一か所に整理するための小さなWebアプリです。

## Initial State

一覧にはまだログがありません。
今日は、HTTPの復習で詰まった内容を登録します。

## Steps

1. 新規ログ画面を開く。
2. titleとbodyを入力する。
3. statusに `相談したい` を選ぶ。
4. 保存する。
5. 一覧に戻り、保存したログが表示されることを見る。
6. `相談したい` で絞り込む。

## Expected Result

登録したログが一覧に表示され、相談したいログだけを確認できる。

## Failure or Empty State

titleが空の場合は保存せず、エラーメッセージを表示する。
ログがない場合は、空状態の説明を表示する。

## Not Covered Today

- 通知
- 多人数共有
- 外部記事取り込み

## Next Improvement

状態変更を一覧からできるようにする。
```

デモ台本を書くと、実装中の不足にも気づきやすい。
空状態がない。
エラー表示がない。
保存後の遷移が分かりにくい。
READMEの手順とデモが合っていない。
こうした問題は、発表直前ではなく、第21章の時点で見つけて直す。

### Mentor Review Requestは、レビューの入口である

メンターへのレビュー依頼では、「全部見てください」だけでは足りない。
レビューの目的、起動方法、確認方法、見てほしい観点、既知の課題、質問を書く。
第4章で扱ったチームへの情報共有、第6章で扱ったPR説明、第20章で扱った技術文書がここで再利用される。

```md
# Mentor Review Request

## Summary

学習ログ整理アプリの最初の縦切りを作りました。
ログを1件登録し、一覧に表示し、状態で絞り込めます。

## Review Purpose

MVPの範囲、データ項目、READMEの起動手順、主要操作の分かりやすさを確認してほしいです。

## Files to Review

- `project-brief.md`
- `mvp-scope.md`
- `delivery-plan.md`
- `README.md`
- `self-review.md`
- `demo-script.md`

## How to Run

- `npm install`
- `npm run dev`

## How to Verify

1. `http://localhost:3000` を開く。
2. 学習ログを1件登録する。
3. 一覧に表示されることを確認する。
4. 状態で絞り込む。

## Review Focus

1. MVPが広がりすぎていないか。
2. 保存するデータに危険な情報が含まれていないか。
3. 第22章で改善しやすい構造になっているか。

## Known Issues

- タグ絞り込みは未対応です。
- lintは通っていますが、自動テストは未追加です。

## Questions

- 最初の改善候補は、状態変更とタグ絞り込みのどちらがよいですか。
```

レビュー依頼は、相手の時間を節約するための文書である。
何を見ればよいかが分かるほど、レビューは具体的になる。

### GitHub IssuesやProjectsを使うなら、情報を重複させすぎない

作業をissueに分けたり、Project boardで追跡したりしてもよい。
ただし、個人開発では、ツールを整えること自体が目的になりやすい。
大切なのは、作業が小さく、完了条件があり、確認結果が残ることである。

GitHub Issuesを使う場合は、一つのissueに次を書く。

```md
## Goal

ログ登録画面から1件の学習ログを保存できるようにする。

## Done when

- titleとbodyを入力して保存できる
- 保存後に一覧へ表示される
- titleが空ならエラーを表示する
- READMEの手動確認手順を更新する

## Verification

- 手動確認
- 必要ならAPI test

## Links

- Project Brief:
- MVP Scope:
- PR:
```

Projectsを使うなら、status、priority、target date、risk、verificationなどのfieldを作れる。
ただし、最初から複雑なboardを作り込まない。
IssueやProjectは、作業を進める道具であり、成果物そのものではない。

### 評価観点を先に知っておく

この章の評価は、満点のプロダクトを作ることではない。
限られた時間で範囲を決め、動くものを作り、説明できることを見る。

評価観点は次のように考える。

| area | strong submission |
| --- | --- |
| 企画メモ | ユーザー、課題、成果、制約、作る範囲、作らない範囲が具体的で、危険なデータを扱わない方針がある |
| MVP | Mustが小さく、最初のデモで見せる流れと確認条件がはっきりしている |
| 縦切り実装 | 1つの主要操作が、画面、APIまたは処理、データ保存、確認まで通っている |
| 確認 | README通りに起動でき、成功時、失敗時または空状態、再読み込み後などの結果が残っている |
| AI利用 | 入力前、採用前、共有前、PR前の確認があり、採用した提案と採用しなかった提案が説明できる |
| レビュー準備 | 進捗ログ、セルフレビュー、デモ台本、レビュー依頼に、既知の課題と見てほしい観点が書かれている |

この表を見ると、評価対象はコードだけではないことが分かる。
企画、範囲、データ安全性、確認、説明、レビュー準備が含まれる。
これは、実務の開発に近い。
動くものだけでなく、なぜ作り、どう確認し、何が残っているかを説明できることが重要である。

### 第22章への受け渡しを意識する

第21章で作ったものは、第22章で既存プロダクトとして扱う。
つまり、第21章の提出時点で、次を残しておく必要がある。

- すでに動いている主要操作。
- 既存データの形。
- READMEの起動手順と確認手順。
- 壊してはいけない振る舞い。
- 次に入れたい小さな改善候補。

第22章では、ゼロから作るのではなく、動いているものを壊さずに変える。
そのため、21章の終わりで「何が既存の正常動作か」を説明できる状態にする。
Self ReviewのChapter 22 Hand-offは、そのための欄である。

### 個人開発で起きやすい誤解

- 自由テーマだから何でも入れてよいと考える。自由なのはテーマ選択であり、成果物はレビューできる条件を満たす必要がある。
- 技術的に面白いものから始める。まずユーザー、課題、成果を書く。
- 実データに近いほど良いと考える。研修成果物では、架空データで価値と動作を確認できれば十分である。
- MVPを小さくすることを妥協と考える。MVPは最初に価値を確かめる完成形である。
- Won'tを書かない。作らないものを明示しないと、開発中に範囲が膨らむ。
- 画面だけを作り込む。最初は画面、処理、データ保存、確認まで縦に通す。
- タスクを大きく切りすぎる。done whenとverificationを書ける単位にする。
- AIにテーマを広げさせる。AIには制約と除外範囲を渡す。
- AIの採用理由を残さない。採用した提案、採用しなかった提案、検証方法を残す。
- READMEを最後に書く。起動方法と確認方法は、実装中から更新する。
- 成功時だけ確認する。空状態、未入力、再読み込み後など、最低限の弱い場面も見る。
- 進捗ログを感想にする。done、verification、decisions、blockers、nextを書く。
- Self Reviewで問題を隠す。既知の問題と未対応範囲を書く方が信頼できる。
- デモを機能一覧にする。ユーザーの課題から主要操作へ流す。
- レビュー依頼に「全部見てください」とだけ書く。見てほしい観点を指定する。

### 企画とデモ証拠で確認すること

この章では、`project-brief.md`、`mvp-scope.md`、`delivery-plan.md`、`project-progress-log.md`、`self-review.md`、`demo-script.md`、`mentor-review-request.md` を作る。
READMEには、起動方法と確認方法を追記する。

最初に、テーマ候補を一つ選ぶ。
迷う場合は、学習ログ整理アプリ、個人タスク棚卸しアプリ、読書メモと実践メモ管理アプリ、小さな在庫・備品メモアプリのどれかを使う。
自分の状況に合わせて、ユーザー、課題、MVPを小さく調整する。

次に、`project-brief.md` を書く。
User、Problem、Outcome、Success Signal、Main Flow、In Scope、Out of Scope、Constraints、Data Safety、Data Lifecycle、AI Use Plan、Riskiest Assumption、Evidence Needed、Mentor Questionsを埋める。
ここで扱うデータが安全かを確認する。

次に、`mvp-scope.md` を書く。
Must、Should、Could、Won'tを分ける。
Mustは最初のデモで必要なものに絞る。
Won'tには、今回作らない理由を書く。
成功時、失敗時または空状態、再読み込み後の確認も書く。

次に、`delivery-plan.md` を書く。
First Vertical Sliceを一つに絞る。
Data to Store、Tasks、AI Delegation、Human Checkpoints、Commands、Progress Log Ruleを書く。
タスクにはdone whenとverificationを付ける。

実装中は、`project-progress-log.md` を更新する。
Done、Verification、Decisions、Blockers、Nextを短く残す。
READMEにもLocal Setup、Run、Verification、Known Limitations、Demo Flow、Verification Logを追記する。

最後に、`self-review.md`、`demo-script.md`、`mentor-review-request.md` を作る。
Self Reviewでは、価値、動作、確認、安全性、AI利用、アクセシビリティ、既知の問題、第22章への受け渡しを書く。
Demo Scriptでは、開始状態、操作、期待結果、失敗時や空状態、未対応範囲、次の改善を書く。
Mentor Review Requestでは、見てほしい観点、起動方法、確認方法、既知の課題、質問を書く。

### 個人開発プロジェクトで持ち帰ること

第21章で身につけるべきことは、自由テーマをレビュー可能な個人開発プロジェクトへ変えることである。
作りたいものを大きく語るだけでは、プロジェクトにならない。
誰のどんな困りごとを扱うのか。
最初にどこまで作るのか。
何を作らないのか。
どのデータを安全に扱うのか。
どう確認するのか。
どうレビューしてもらうのか。
これらを一つずつ決める。

Project Briefは、開発の基準点である。
MVP Scopeは、最初に価値を確かめる小さな完成形を決める道具である。
Delivery Planは、最初の縦切り、タスク、確認、AI利用を整理する作業計画である。
Progress Logは、作業の証拠である。
Self Review、Demo Script、Mentor Review Requestは、成果物を他者に見せられる状態へ整える文書である。

個人開発では、完成度の高さだけを評価しない。
小さくても動くものがあり、READMEで起動でき、確認結果が残り、既知の課題を説明できることが重要である。
その状態が、第22章の既存プロダクト改善、第23章の本番前確認、第24章の最終発表へつながる。

### 既存プロダクト改善の章へ

次章では、第21章で作ったものを既存プロダクトとして扱い、小さな改善を入れる。
新規開発では、自分が作りたい形へ進めやすい。
しかし既存プロダクト改善では、すでに動いている振る舞い、既存データ、README、ユーザーの期待を壊さないことが重要になる。
第21章で残したProject Brief、MVP Scope、README、Self Review、Chapter 22 Hand-offが、次章の出発点になる。

### 参考資料

- [Manifesto for Agile Software Development](https://agilemanifesto.org/)
- [Principles behind the Agile Manifesto](https://agilemanifesto.org/principles.html)
- [GitHub Docs: About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)
- [GitHub Docs: About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [Google for Developers: Technical Writing](https://developers.google.com/tech-writing)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/)
- [Software Engineering at Google](https://abseil.io/resources/swe-book/html/toc.html)

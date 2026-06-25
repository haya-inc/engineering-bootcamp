---
title: "第19章 AIコーディングの実務ワークフロー"
part: 5
partLabel: "Part 5 AIと知識作業"
order: 19
---

第18章では、LLM、prompt、context、RAG、tool use、agent、evaluationを扱った。
第19章では、その考え方をコード変更に適用する。
AIにコードを書かせること自体が目的ではない。
何を作るかを仕様化し、AIに読ませる情報を選び、計画を確認し、小さく実装し、diffを読み、テストし、PRで説明する。
この一連の流れを、AIコーディングの実務ワークフローとして扱う。

この章では、Claude Codeを中心例にして説明する。
Claude Codeは、単なるチャットではない。
codebaseを読み、fileを編集し、commandを実行し、開発toolと連携できるagentic coding toolである。
ただし、この章の目的はClaude Codeの操作だけを覚えることではない。
Codex、Cursor、GitHub Copilotのagent機能など、使うtoolが変わっても、brief、context、計画、権限、diff、test、PR説明の考え方は変わらない。
便利さが増えるほど、影響範囲も広がる。
だからこそ、細かい機能名を暗記するより、何を任せ、どこで止め、何を人間が確認するかを設計することが重要になる。

題材は、研修用学習ログアプリの「支援ステータス一覧の絞り込み機能」である。
メンターが、支援ステータスと最終更新日で一覧を絞り込めるようにする。
これは小さな機能に見えるが、UI、URLやquery parameter、API、入力検証、認可、テスト、アクセシビリティ、PR説明が関係する。
AIに丸ごと任せるには大きく、人間が全部手で書くにはAIの助けを使える。
AIコーディングの練習にちょうどよい。

この章を読み終えると、次ができるようになる。

- AIに依頼する前に、作るもの、作らないもの、受け入れ条件を書ける。
- AIに読ませるcontextと、読ませてはいけない情報を分けられる。
- plan modeやread-onlyの段階で、編集前に実装方針を確認できる。
- permission、sandbox、approvalの違いを意識して、強い操作を止められる。
- AI-generated diffを、仕様、設計、security、accessibility、testの観点でレビューできる。
- work logとPR説明で、AIに任せたことと人間が確認したことを説明できる。

### AIコーディングは、速く書く道具ではなく作業工程である

AIコーディングを「コードを速く書く道具」とだけ捉えると、失敗しやすい。
AIは速く差分を作れる。
しかし、何を作るかが曖昧なら、曖昧な実装を速く作る。
読ませる情報が足りなければ、既存設計とずれる。
触ってよい範囲を決めなければ、unrelatedな変更が混ざる。
検証を決めなければ、AIの「完了しました」という報告だけで進んでしまう。

実務では、AIコーディングを次の工程として扱う。

```txt
feature brief
  -> context pack
    -> workspace check
      -> plan
        -> implementation
          -> diff review
            -> tests
              -> work log
                -> PR
```

feature briefで、何を作るかを人間が定義する。
context packで、AIに読ませる情報と読ませない情報を分ける。
workspace checkで、branch、未commitの変更、編集してよいfile、実行環境を確認する。
planで、AIの理解と変更方針を編集前に確認する。
implementationで、小さな範囲を実装させる。
diff reviewで、人間が差分を読む。
testsで、AIの説明ではなく実行結果を見る。
work logで、何を依頼し、何を採用し、どう確認したかを残す。
PRで、チームがレビューできる形にまとめる。

この流れの中心にいるのはAIではなく開発者である。
AIは作業を速くし、候補を出し、調査や修正を助ける。
しかし、仕様の最終判断、secretの扱い、テスト結果の解釈、PRとして出す責任は開発者が持つ。

特に、既存の作業途中の変更を壊さないことは大切である。
AIに編集させる前に、`git status` で現在の状態を見て、今回の作業に関係する変更と、触ってはいけない変更を分ける。
自分以外の変更や、別作業の途中の差分があるなら、勝手に戻さない。
AIにも「既存の未commit変更を消さない」「unrelated fileを整形しない」と明示する。

### feature briefで、作るものと作らないものを決める

AIへ依頼する前に、feature briefを書く。
feature briefは、機能の短い作業定義である。
利用者、目的、変更範囲、品質条件、非対象、受け入れ条件、不明点を書く。
これはAIのためだけではない。
自分とチームが、今回何を作るのかを揃えるための文書である。

支援ステータス一覧の絞り込み機能なら、次のように始められる。

```md
# AI Feature Brief

## 機能

メンターが支援ステータス一覧を、ステータスと最終更新日で絞り込めるようにする。

## 利用者

担当受講者の支援状況を確認するメンター。

## 目的

対応が必要な受講者を見つけやすくし、一覧確認の時間を減らす。

## 変更範囲

| area | change | note |
| --- | --- | --- |
| UI | 絞り込みフォームを追加 | statusとupdated date |
| API | query parameterを受け取る | 不正値は安全に扱う |
| DB | 既存schemaを使う | schema変更はしない |
| tests | APIとUIの確認を追加 | 既存テスト形式に合わせる |
| docs | PR説明に確認手順を書く | README大改修はしない |

## 非対象

- DB schema変更
- 通知機能
- CSV export
- 本番デプロイ

## 品質条件

- 既存の認可条件を変えない
- 不正なquery valueで500にしない
- 入力にはlabelを付け、keyboardだけで操作できる
- 依存packageの追加は事前相談する

## 受け入れ条件

- [ ] ステータスで絞り込める
- [ ] 最終更新日の範囲で絞り込める
- [ ] 条件を組み合わせても期待どおりに表示される
- [ ] 不正なquery valueでも画面が壊れない
- [ ] 既存の一覧表示と認可を壊さない

## 不明点

- 日付範囲の境界は含むのか
- URLに条件を残す必要があるか
```

feature briefがないままAIに依頼すると、AIは暗黙の前提を補う。
「便利そうだからDB schemaを変える」「URLには残さない」「不正値は無視する」「既存UIとは別の部品を作る」など、悪意はなくても判断がずれる。
briefは、AIの自由度を下げるためではなく、今回の目的に集中させるためにある。

### acceptance criteriaは、AIの完了報告より強い

AIは、実装後に「完了しました」と言うことがある。
しかし、AIの完了報告は完了条件ではない。
完了を判断するのは、受け入れ条件である。

acceptance criteria、受け入れ条件は、利用者行動と確認可能な状態で書く。
「絞り込みを実装する」では弱い。
「メンターがステータスを選ぶと、一覧がそのステータスの受講者だけになる」のように、操作と結果が見える形にする。

良い受け入れ条件には、正常系だけでなく、境界や失敗時も含める。

```md
- [ ] status=needs_support を選ぶと、該当statusの受講者だけが表示される
- [ ] updated_from と updated_to を指定すると、その範囲の受講者だけが表示される
- [ ] statusと日付範囲を同時に指定できる
- [ ] 不正なstatusを受け取っても500にせず、意味のある扱いをする
- [ ] 担当外の受講者は、絞り込み条件に関係なく表示されない
- [ ] 絞り込み条件を解除すると通常の一覧に戻る
```

受け入れ条件は、実装タスクとは分ける。
「APIにfilter処理を追加する」は実装タスクであり、「status=needs_supportを選ぶと該当statusだけが表示される」は受け入れ条件である。
PRへ出すときは、受け入れ条件と確認証跡を対応させる。

```md
| acceptance criteria | evidence | result |
| --- | --- | --- |
| status=needs_supportで絞り込める | npm test -- support-statuses-api | pass |
| 不正なstatusで500にしない | API test: invalid status | pass |
| labelとkeyboard操作がある | manual UI check | pass |
```

AIに実装を依頼するとき、この条件を渡す。
diff reviewでも、この条件と差分を対応させる。
PR説明でも、この条件をどのテストや手動確認で確かめたかを書く。
受け入れ条件は、AIと人間の共通言語である。

### 作業は調査、計画、実装、検証へ分ける

AIに大きな機能を丸ごと任せると、差分が大きくなり、レビューが難しくなる。
支援ステータス一覧の絞り込みでも、画面、API、テスト、文書を一度に大きく変えると、どこで問題が入ったか分からない。
作業は分ける。

最初にworkspaceを確認する。
現在のbranch、`git status`、未commit変更、生成物、依存関係の状態を見る。
ここで見たいのは「きれいな作業場か」だけではない。
既にある変更のうち、今回触ってよいものと、触ってはいけないものを分ける。
AIに渡す前に、たとえば次を記録する。

```md
## workspace check

- branch: feature/support-status-filter
- git status: modified app/support-statuses/page.tsx は今回対象、modified README.md は別作業なので触らない
- package install: 追加しない
- network access: 使わない
- generated files: 更新しない
```

最初は調査だけを依頼する。
関連ファイル、既存の書き方、テスト、変更候補、リスクを出してもらう。
まだ編集させない。

次に計画を確認する。
どのfileを変えるのか。
既存パターンに沿っているか。
どの受け入れ条件をどのテストで見るのか。
不明点は何か。
人間が読んで、進めてよいかを判断する。

実装は小さく行う。
APIだけ、UIだけ、テストだけ、という単位に分けることもある。
最後に検証し、diffを読む。
AIが強くても、レビューできない大きさの差分は実務では危険である。

### context packは、AIの視野を設計する

context packは、AIに読ませる情報をまとめたものだ。
仕様、関連ファイル、既存の書き方、テスト、制約、やってはいけないこと、実行してよい確認コマンドを含める。
さらに、情報の新しさ、誰が確認した情報か、どのfileは読ませないかも書く。
全部読ませればよいわけではない。
不要な情報が多いと、大事な情報が埋もれる。
古い指示や矛盾した説明も品質を下げる。

支援ステータス一覧の絞り込みなら、context packは次のように書く。

```md
# AI Context Pack

## 作業対象

支援ステータス一覧に、statusとupdated dateの絞り込みを追加する。

## 読ませたいファイル

| file | why | note |
| --- | --- | --- |
| AGENTS.md | AI支援時のリポジトリ方針を見る | あれば最初に読む |
| CLAUDE.md | Claude Code向けのproject instructionsを見る | あれば内容と古さを確認 |
| app/support-statuses/page.tsx | 一覧画面の実装を見る | 実際のpathは調査で確認 |
| app/api/support-statuses/route.ts | APIのquery処理を見る | 実際のpathは調査で確認 |
| tests/support-statuses.test.ts | 既存テスト形式を見る | なければ近いAPI testを見る |

## 現在のworkspace状態

- branch:
- `git status`:
- 既にある変更で触ってよいもの:
- 触ってはいけない既存変更:

## 参考にしたい既存の書き方

| item | where | note |
| --- | --- | --- |
| 絞り込みUI | 既存一覧画面 | labelとkeyboard操作を見る |
| query parameter | 他の一覧API | validation方法を見る |
| API error handling | 既存route | 不正値の扱いを見る |
| tests | 既存test | styleを合わせる |

## 実行してよい確認コマンド

- npm test
- npm run lint
- npm run typecheck

## 情報の分類

| information | classification | handling |
| --- | --- | --- |
| training sample data | public sample | 読ませてよい |
| local `.env` | secret | 読ませない |
| production log | sensitive | 必要部分だけredactして渡す |

## 渡してはいけない情報

- .env
- secrets
- API keys
- 本番データ
- 個人情報
- unrelated files
```

context packは、AIに渡す情報の量を増やす文書ではない。
読むべきものを選び、読ませてはいけないものを止める文書である。
第18章のcontext設計を、コード変更に適用したものと考える。

AGENTS.md、CLAUDE.md、`.cursor/rules`、`.github/copilot-instructions.md` のようなAI向け指示ファイルは便利である。
ただし、これらはsecretを守る境界ではない。
また、toolごとに読み込まれ方が異なり、必ず強制される設定でもない。
大事な禁止事項は、指示ファイルに書くだけでなく、permission、sandbox、review、testでも確認する。

### 渡してはいけない情報を、先に禁止する

AIコーディングでは、AIがfileを読める。
だから、秘密情報の扱いはチャットより重い。
`.env`、secret、API key、本番データ、個人情報、内部URL、不要なログは読ませない。
「AIが必要そうなら読むだろう」では危険である。

禁止情報は、promptだけでなくpermissionやsettingsでも管理する。
たとえば、`.env` を読まないでくださいと書く。
さらに、permissionで読み取りを制限する。
レビュー時には、AIがsecretや個人情報をlogやtest fixtureへ混ぜていないかを見る。

AI向けの指示ファイルにもsecretを書かない。
CLAUDE.md、AGENTS.md、rules file、session planは、AIが読むための文書であり、秘密の保管場所ではない。
「このfileはAIだけが読むから大丈夫」と考えない。
公開リポジトリで共有される可能性があるものには、secretの値、本番接続先、実在ユーザーの個人情報を入れない。

失敗ログをAIに渡すときも同じである。
テストの失敗を直させるために、terminal outputを丸ごと貼ると、環境変数や内部pathが混ざることがある。
必要な範囲だけを渡す。

```md
AIへ渡してよい失敗情報:
- 実行したcommand
- 失敗したtest name
- error messageの必要部分
- 関連するdiff

渡さない:
- .envの値
- access token
- 本番DBの接続先
- 実在する受講者の個人情報
```

AIコーディングでは、便利さより先に、読ませる情報の境界を作る。

### AI coding agentは、チャットではなく作業環境である

AI coding agentは、codebaseを読み、fileを編集し、commandを実行できる。
Claude Codeはその代表例であり、terminal、IDE、desktop app、browserなどで使える。
Codexも、CLIやIDEでローカルのコードを読み、変更し、コマンドを実行できる。
Codexのcloud環境のように、ローカルではなく隔離された環境で背景タスクとして動く形もある。
つまり、自然言語で相談する相手であると同時に、実際の開発環境へ作用する作業相手でもある。

この性質は便利である。
関連ファイルを探せる。
既存パターンを要約できる。
小さな実装を作れる。
テストを走らせられる。
エラーを見て修正案を出せる。
PR説明の下書きも作れる。

一方で、影響も大きい。
間違ったfileを編集する。
大きなrefactorを始める。
許可していないcommandを実行しようとする。
テスト失敗を都合よく解釈する。
意図しないgit操作を提案する。
だから、Claude Codeを使うときは、promptだけでなく、permission、settings、CLAUDE.md、session plan、diff reviewを合わせて設計する。
Codexや他のagentを使う場合も同じである。
tool名が変わっても、読める範囲、書ける範囲、実行できるcommand、network access、approvalの置き方を確認する。

### plan modeで、編集前に理解と方針を見る

いきなり編集させない。
まず調査と計画を依頼する。
Claude Codeのcommon workflowsでも、編集前に計画を作り、変更がdiskへ触れる前にreviewする流れが扱われている。
この段階をplan modeとして考える。
Claude Codeでは、plan modeや `claude --permission-mode plan` のような使い方で、編集前に調査と計画へ寄せられる。
Codexでも、read-onlyや承認つきの状態で調査させ、編集やコマンド実行の前に人間が確認する流れを作れる。
名称はtoolごとに違うが、目的は同じである。

調査依頼は、次のように書ける。

```txt
支援ステータス一覧に、ステータスと最終更新日の絞り込みを追加したいです。

まず編集せずに調査してください。

確認してほしいこと:
- 一覧画面の実装場所
- APIの実装場所
- 絞り込み条件やquery parameterの既存の扱い
- 入力検証と認可の既存パターン
- テストの書き方
- 変更すべきファイル候補
- リスク
- 実装前に確認すべき質問

まだfile editはしないでください。
調査結果と実装計画だけ出してください。
```

計画には、関連ファイル、既存の書き方、変更対象、テスト方針、リスク、質問を含める。
人間は、その計画を見る。
目的と合っているか。
変更範囲が広すぎないか。
DB schema変更のような非対象に踏み込んでいないか。
テスト方針があるか。
不明点を勝手に決めていないか。
既存の未commit変更を壊さない計画になっているか。
新しい依存packageを追加する必要が本当にあるか。

計画レビューを省くと、AIは「良さそうな実装」へ進む。
しかし実務で必要なのは、今回の目的に合う実装である。

計画レビューでは、最低限次を見る。

- changed files候補がbriefの範囲内にあるか。
- 触ってはいけないfileや既存変更を避けているか。
- 受け入れ条件とtest方針が対応しているか。
- 認可、入力検証、accessibilityの確認が抜けていないか。
- rollbackしやすい小さな差分になっているか。
- 不明点を、AIが勝手に仕様決定していないか。

### permissions、sandbox、approvalで、読む、書く、実行するを分ける

permissionは、AIが何を実行できるかを管理する仕組みである。
Claude Codeでは、tool permissionをallow、ask、denyのように扱える。
allowは許可する。
askは確認してから実行する。
denyは実行しない。
denyが設定されている操作は、より狭いallowがあっても止める、という考え方を持つ。

あわせて、sandboxとapprovalも区別する。
sandboxは、AIやAIが起動したcommandが触れられるfile、network、system resourceを技術的に制限する境界である。
approvalは、強い操作の前に人間へ確認する止め方である。
たとえば、workspace内のfileだけ書けるsandboxにしていても、`package.json` やmigration fileを書き換える操作はapprovalで止めたいことがある。
逆に、approvalが出ても、sandboxで許されていない場所へは書けない。

初心者が最初に持つべき方針は単純でよい。
読み取りは必要な範囲で許可する。
対象fileの編集は確認を挟む。
testやlintは許可または確認つきで実行する。
`.env` 読み取り、secret参照、git push、deploy、本番データ変更は拒否する。

```md
| action | policy | reason |
| --- | --- | --- |
| read related source files | allow | 調査に必要 |
| edit target files | ask | 変更前に範囲を確認する |
| run tests | allow/ask | 結果を記録する |
| network access | deny/ask | 外部へ出る操作は目的確認が必要 |
| install package | ask | supply chainとlockfile変更を確認する |
| edit package.json / lockfile | ask | 依存関係変更は影響が広い |
| run migration | deny/ask | DB変更は戻しにくい |
| delete files | ask | 誤削除を防ぐ |
| read .env | deny | secret保護 |
| read production data | deny | 個人情報と本番保護 |
| git commit | ask | 人間が差分確認後に判断 |
| git push | deny | 人間が実行 |
| deploy | deny | 扱わない |
```

permissionは、AIへの信頼度を表すものではない。
作業の影響範囲に応じて安全な摩擦を置く仕組みである。
毎回すべてを確認すると遅い。
しかし、強い操作を無条件で許すと危険である。
読む、書く、実行する、外へ出す、消す、戻せない変更を加える、を分ける。

Codexのようなagentでも同じ考え方で見る。
ローカルCLIでは、workspaceへの書き込み、network access、approval policyを設定できる。
cloudで動く場合は、ローカルPCとは違う隔離環境で動くため、どのsecretがsetup時だけ使われ、agent実行中に何が読めるかを確認する。
`--yolo` やdangerous bypassのような承認とsandboxを外す設定は、通常の開発作業で使わない。
使うとしても、使い捨ての隔離環境で、何が壊れてもよい作業に限る。

### settingsは、個人設定とチーム設定を分ける

settingsでは、Claude Codeの権限やhooks、MCP serverなどの設定をscopeごとに管理する。
公式ドキュメントでは、managed、user、project、localといったscopeが説明されている。
新人研修でまず押さえるのは、projectとlocalの違いである。

project settingsは、チームで共有したい設定に向く。
たとえば、許可するtest command、禁止する危険操作、共通hook、MCP server、プロジェクト標準のtool設定などである。
チームで共有するため、レビュー対象にする。
sharedなproject settingsへ強い許可を入れると、チーム全員のAI作業に影響する。
`git push`、deploy、外部serviceへの書き込み、広いnetwork accessのような設定は、便利でも慎重に扱う。

local settingsは、自分のPCだけの設定に向く。
terminal環境、個人的な確認の好み、machine-specificなpathなどである。
secretや個人のtokenをproject settingsへ書かない。
localに置くべき情報を共有設定へ混ぜると、他の人の環境で壊れるだけでなく、秘密情報の漏えいにもつながる。
local settingsも、secretの置き場として雑に使わない。
必要なら専用のsecret管理や環境変数の仕組みを使い、AIに読ませるfileとは分ける。

settingsは、AIコーディングの安全設計の一部である。
promptで「やらないで」と頼むだけでなく、設定で止める。
ただし、設定を入れれば人間のレビューが不要になるわけではない。
設定、prompt、diff review、testを重ねる。

### CLAUDE.mdは、プロジェクトの前提をAIへ渡す入口である

CLAUDE.mdは、Claude Codeに毎回伝えたいプロジェクトの前提を書くfileである。
開発コマンド、テストコマンド、設計方針、命名規則、禁止事項、レビュー観点を書く。
毎回promptへ貼る代わりに、プロジェクトの共通前提として置く。
他のagentにも、AGENTS.md、rules file、project instructionなど似た役割のfileがある。
このリポジトリのようにAGENTS.mdがある場合は、AI支援時の方針として最初に読む。

ただし、CLAUDE.mdは魔法のsystem promptではない。
公式ドキュメントでも、CLAUDE.mdが読み込まれているか、指示が具体的か、矛盾した指示がないかを確認する必要がある。
長すぎる、古い、矛盾している、抽象的すぎるCLAUDE.mdは、AIの品質を下げる。
CLAUDE.mdやAGENTS.mdは、AIに前提を渡すcontextであり、単独で安全を強制する境界ではない。
本当に止めたい操作は、permission、sandbox、hook、reviewで止める。
長い手順を全部CLAUDE.mdへ入れるより、短い原則だけを書き、繰り返す手順はskillやテンプレートへ分ける方が読みやすい。

良いCLAUDE.mdには、次のような情報を置く。

```md
# Project Instructions

## Commands

- install:
- test:
- lint:
- type check:

## Coding conventions

- 既存のUI componentを優先する
- APIの入力検証は既存helperに合わせる
- DB schema変更は事前相談する

## Security

- .envを読まない
- secret、個人情報、本番データを出力しない

## Review focus

- 受け入れ条件との対応
- 不要な抽象化
- 認可、入力検証
- アクセシビリティ
```

CLAUDE.mdは、書けば終わりではない。
プロジェクトが変われば更新する。
古いコマンドや古い設計方針が残っていると、AIは古い前提で作業する。
人間向けREADMEと同じく、AI向けの入口文書も保守対象である。
目安として、長くなりすぎたら分割を考える。
「AIが毎回必ず読むべき短い前提」と「必要になったときだけ読む手順」を分けると、古い情報が混ざりにくい。

### hooksとskillsは、手順が固まってから使う

hooksは、Claude Codeのlifecycleの特定時点で処理を動かす仕組みである。
たとえば、編集後にformatを走らせる、危険なcommandをblockする、Claudeが入力を必要としているときに通知する、といった用途がある。
skillsは、繰り返し使う手順や専門的な作業指示を再利用する仕組みである。
Claude Codeのhookは、PreToolUseのようにtool実行前に判断を挟める。
ただし、hookもcommandやscriptとして実行されるので、それ自体がコードである。
何を読み、何を実行し、失敗したときにどう止まるかをレビューする。

初心者が最初から高度なhooksやskillsを作る必要はない。
まず、手順を文書にする。
同じreview checklistを何度も使う。
同じtest commandを毎回実行する。
同じPR説明テンプレートを使う。
このように手順が固まってから、自動化やskill化を考える。

自動化は、良い手順を速くする。
悪い手順を自動化すると、悪い結果が速く広がる。
hooksとskillsは便利だが、目的、影響範囲、失敗時の止め方を説明できる段階で使う。
permissionやsandboxで止めるべき操作を、hookだけに任せない。
hookは補助線であり、強い境界は設定、sandbox、reviewと組み合わせる。
skillsは、毎回同じチェックリストやPR文の型を貼っていることに気づいてから作るとよい。

### 実装依頼では、範囲と検証をセットにする

計画を確認したら、実装を依頼する。
このとき、変更してよいfile、触らないfile、受け入れ条件、test command、停止条件を一緒に渡す。
「実装してください」だけでは足りない。

```txt
計画を確認しました。
まずAPI側のquery parameter処理とテストだけ実装してください。

Allowed scope:
- app/api/support-statuses/route.ts
- tests/support-statuses-api.test.ts

Do not change:
- DB schema
- 認可の基本方針
- UI files
- unrelated refactor
- package.json / lockfile
- generated files

Acceptance criteria:
- statusで絞り込める
- updated_from / updated_toで絞り込める
- 不正なstatusで500にしない
- 担当外データを返さない

Verification:
- npm test -- support-statuses
- npm run lint

実装後に、changed files、実行したcommand、exit codeまたはpass/fail、重要な出力、未実行の確認、リスクを報告してください。
実行していない確認を、実行済みのように書かないでください。
```

大切なのは、実装範囲を小さくすることだ。
API側が確認できたら、次にUIをつなぐ。
UIをつないだら、手動確認をする。
最後にPR説明を書く。
小さい差分は、戻しやすく、レビューしやすく、AIの失敗にも気づきやすい。

### AI-generated diffは、人間のコードと同じようにレビューする

AIが作ったdiffも、人間が作ったdiffと同じように読む。
AIの説明だけで判断しない。
`git status`、diff、test result、manual checkを確認する。
stagingしている場合は、`git diff --staged` も見る。
AIの報告に出ていないfileが変わっていないか、既存の未commit変更を上書きしていないかを確認する。

review観点は、少なくとも次を含める。

- **仕様**：受け入れ条件を満たしているか。
- **範囲**：unrelatedな変更が混ざっていないか。
- **既存パターン**：周りのコードの書き方に合っているか。
- **設計**：不要な抽象化や大きな共通化がないか。
- **エラー処理**：不正値、空条件、境界値を扱っているか。
- **認可**：担当外データが見えないか。
- **セキュリティ**：secretや個人情報を扱っていないか。
- **アクセシビリティ**：label、keyboard、focus、状態表示があるか。
- **テスト**：受け入れ条件を確認しているか。
- **依存関係**：package追加、lockfile変更、build設定変更が必要な範囲か。
- **証跡**：実行したcommandと結果が、PRに書ける形で残っているか。

`ai-diff-review.md` には、changed filesと受け入れ条件の対応を書く。

```md
# AI Diff Review

## changed files

| file | change | review result |
| --- | --- | --- |
| app/api/support-statuses/route.ts | status/date filterを追加 | API範囲として妥当 |
| tests/support-statuses-api.test.ts | filter testを追加 | 日付境界testが不足 |

## git確認

| check | result |
| --- | --- |
| git status | 対象2fileのみ変更 |
| git diff | unrelated変更なし |
| git diff --staged | stagingなし |

## 受け入れ条件との対応

| acceptance criteria | satisfied | evidence |
| --- | --- | --- |
| statusで絞り込める | yes | API test |
| 日付範囲で絞り込める | partial | 境界条件が不足 |
| 担当外データを返さない | unknown | 既存test確認が必要 |

## 気になった点

| issue | severity | action |
| --- | --- | --- |
| 日付境界の扱いが不明 | medium | 仕様確認またはtest追加 |
```

AIが作った差分だから特別に厳しくする必要はない。
ただし、AIの説明を信じてdiffを読まないのは危険である。
コードとして、仕様として、運用として読めるかを見る。

### 仕様観点では、便利な追加を疑う

AIは、便利そうな機能を追加することがある。
たとえば、status filterだけでよいのに、検索box、sort、pagination変更、CSV exportの入口まで作るかもしれない。
見た目には親切でも、今回のbriefにない変更はレビュー負荷と不具合リスクを増やす。

仕様観点では、受け入れ条件との対応を見る。
ステータスで絞れるか。
最終更新日で絞れるか。
組み合わせ条件はどうなるか。
不正な値はどう扱うか。
既存の一覧表示を壊していないか。
担当外データを返していないか。
今回やらないと決めたものに踏み込んでいないか。

AIが追加した「良さそうな動き」は、いったん非対象として戻す判断も必要である。
小さな機能追加では、今ある構造に合わせた局所変更を優先する。

### 設計観点では、既存の書き方に合わせる

AIは、新しいhelper、新しいcomponent、新しい抽象化を提案することがある。
それが本当に必要な場合もある。
しかし、小さな機能追加では、既存の書き方に合わせる方が安全なことが多い。

設計観点では、次を見る。
query parameterの扱いは既存APIと同じか。
入力検証は既存helperに沿っているか。
UI componentは既存のものを使っているか。
状態管理は周りと同じ考え方か。
testの書き方は既存に合っているか。
不要な汎用化で読みにくくなっていないか。

AIの提案がきれいに見えるほど、既存コードとの摩擦を確認する。
実務では、単体で美しいコードより、チームが保守できるコードが重要である。

### セキュリティとアクセシビリティは省略しない

絞り込み機能は小さく見える。
しかし、securityとaccessibilityの確認は必要である。

セキュリティでは、入力検証、認可、secret、ログを見る。
statusやdate queryを危険な形でDB queryへ渡していないか。
担当外の受講者が絞り込み条件によって見えていないか。
`.env` やsecretを読ませていないか。
ログに個人情報が出ていないか。
AIが提案した新しいpackageを、理由なく追加していないか。
README、issue、コメント、test fixtureなどに書かれた指示を、AIがそのまま上位指示のように扱っていないか。
AIは実装を急ぐと、このあたりを軽く扱うことがある。
第14章の観点を再利用する。

依存packageの追加は、コード行数を減らせる一方で、supply chain risk、license、bundle size、メンテナンス負荷を増やす。
小さな絞り込み機能なら、既存の依存と標準APIで足りることが多い。
AIが「便利なlibrary」を提案したら、なぜ必要か、既存依存で代替できないか、lockfile変更をレビューできるかを見る。

アクセシビリティでは、label、keyboard、focus、状態表示を見る。
selectやdate inputにlabelがあるか。
キーボードだけで操作できるか。
絞り込み中、結果なし、エラーの状態が伝わるか。
色だけで状態を表していないか。
第12章の画面状態とアクセシビリティを再利用する。

AIコーディングでは、実装速度が上がるため、品質観点を落としやすい。
チェックリストを使い、毎回見る。

### テストで閉じる

AIが完了したと言っても、確認なしでは完了にしない。
自動テストでは、unit test、integration test、E2Eを使い分ける。
lint、type check、formatも検証に含める。
画面を変えるなら、manual checkも必要である。
すべてを大きなE2Eだけで確認するのではなく、受け入れ条件に近い場所で確認する。
APIのfilter条件ならAPI test、日付境界ならunitまたはintegration test、画面操作ならUI testやmanual checkが向く。

支援ステータス一覧の絞り込みなら、検証は次のように分けられる。

```md
| check | command or manual | result | note |
| --- | --- | --- | --- |
| API filter test | npm test -- support-statuses-api |  | status/date |
| UI test | npm test -- support-statuses-ui |  | if available |
| lint | npm run lint |  |  |
| type check | npm run typecheck |  |  |
| manual UI | browser |  | label, keyboard, empty state |
```

テストがない場合は、確認できる最小のテストを追加する。
ただし、テスト追加も目的に合わせる。
AIに大量のsnapshotsや脆いE2Eだけを追加させるのではなく、受け入れ条件を確認できるテストにする。

AIコーディングでは、テストが人間とAIの共通言語になる。
失敗したら、AIに失敗ログを渡して修正を依頼できる。
成功したら、PRで確認結果として示せる。
実行できなかった確認は、実行済みのように書かない。
「`npm run typecheck` はscriptがなかったため未実行」「browser確認は未実施、理由はUI差分が次PRのため」のように、未実行の理由を残す。
未実行を隠すより、残課題として見える方がレビュアーは判断しやすい。

### 失敗ログは、必要な範囲だけ渡す

テストが失敗したら、AIに修正を依頼できる。
しかし、失敗ログの渡し方にも注意が必要である。
terminal outputを全部貼るのではなく、必要な範囲に絞る。

```txt
Command:
npm test -- support-statuses-api

Failure:
should filter by updated_to

Error:
Expected 2 results, received 3.

Related diff:
- route.ts の date filter部分
- support-statuses-api.test.ts の updated_to case

お願い:
date boundaryの扱いを確認し、今回の受け入れ条件に合う最小修正案を出してください。
DB schema変更やunrelated refactorはしないでください。
```

失敗ログは、原因候補を絞るためのcontextである。
同時に、secretや個人情報を漏らす入口にもなる。
必要な情報だけを渡す習慣を持つ。

### sessionが崩れたら、続けるより立て直す

AIが同じ失敗を繰り返すことがある。
依頼文を少し変えても、同じ誤解へ戻る。
このときは、会話を続けるより、sessionを見直す方がよい場合がある。

原因はさまざまである。
古い指示がcontextに残っている。
関係ない情報を読みすぎている。
feature briefが曖昧である。
受け入れ条件が矛盾している。
作業が大きすぎる。
テストが不足していて、AIが正解を確認できない。
CLAUDE.mdに古い指示が残っている。
権限を広げすぎて、AIが不要なfileやcommandに触れる。
逆に権限が狭すぎて、必要な確認ができず推測で進む。

立て直し方は、次のように考える。

- 作業を小さく分ける。
- context packを作り直す。
- plan modeからやり直す。
- 失敗しているtestだけを対象にする。
- 人間が小さな修正を入れてからAIに続けさせる。
- 新しいsessionで、必要なcontextだけを渡す。

次の兆候が出たら、いったん止める。

- AIが同じ修正を3回以上繰り返す。
- briefにない大きなrefactorや依存追加を提案し始める。
- secret、本番データ、広いnetwork access、deploy、git pushが必要だと言い始める。
- 失敗testの原因を確認せず、別のtestや仕様変更へ逃げる。
- 既存の未commit変更を消す、戻す、整形する提案をする。
- 人間がdiffを説明できない大きさになっている。

AIとの会話を長く続けるほど良いわけではない。
不確実性が増えたら、作業を止めて整理する。

### ai-work-logで、AI利用を説明可能にする

AIを使った開発では、何を依頼し、何が変わり、どう検証したかを残す。
prompt全文をすべて残す必要はない。
しかし、主要な依頼、使ったtool、権限状態、採用した計画、変更file、実行したtest、失敗と修正、manual check、残課題は残す。

```md
# AI Work Log

## task

支援ステータス一覧にstatusとupdated dateの絞り込みを追加する。

## tool and mode

| item | value |
| --- | --- |
| tool | Claude Code |
| mode | plan mode -> edit with approval |
| network | not used |
| branch | feature/support-status-filter |

## prompts summary

| step | prompt summary | result |
| --- | --- | --- |
| investigate | 関連fileと既存patternを調査。編集禁止 | API/UI/test候補を取得 |
| plan | 小さな実装計画とtest方針を依頼 | API先行の計画を採用 |
| implement | API filterとtestだけ実装 | date境界testが失敗 |
| fix | failure logを渡し最小修正を依頼 | test通過 |

## accepted plan

- API filterを先に実装し、UIは次の差分に分ける。

## changed files

- app/api/support-statuses/route.ts
- tests/support-statuses-api.test.ts

## workspace status

| timing | status |
| --- | --- |
| before | target files only clean |
| after | route.ts and api test changed |

## verification

| check | command or manual | result | note |
| --- | --- | --- | --- |
| test | npm test -- support-statuses-api | pass |  |
| lint | npm run lint | pass |  |
| type check | npm run typecheck | not run | scriptなし |

## remaining risks

- UI側のmanual checkは次の差分で行う。
```

work logは、監視のためだけの記録ではない。
レビュー、PR、最終発表、後日の振り返りに使う。
AIを使ったかどうかより、どこをAIに任せ、どこを人間が確認したかを説明できることが大切である。
AIの提案を採用しなかった場合も、必要なら残す。
たとえば「新しいdate library追加は見送り。既存helperで足りるため」のように書くと、後から判断を追える。

### PR説明では、AI利用より変更と確認を中心にする

PRでは、AIを使ったこと自体より、何を変更し、なぜ変更し、どう確認したかが重要である。
AI利用については、チームのルールに従って必要な範囲で書く。
隠す必要はないが、AI利用の説明だけが中心になってもいけない。

```md
# PR Description

## Summary

- 支援ステータス一覧にstatusとupdated dateの絞り込みを追加した。

## Changes

- APIでstatus/date queryを受け取る
- 不正なstatusを安全に扱う
- 絞り込みのAPI testを追加した

## AI assistance

- Claude Codeを使って、関連file調査、実装計画、初期実装、test failureの原因候補整理を行った。
- 差分、受け入れ条件、test結果は人間が確認した。
- 新規package追加の提案は採用しなかった。

## Verification

- [x] npm test -- support-statuses-api
- [x] npm run lint
- [ ] npm run typecheck（scriptなしのため未実行）

## Review focus

- date boundaryの扱い
- 既存の認可条件が保たれているか
- 不正なquery valueの扱い

## Remaining work

- UI側のmanual accessibility checkは次PRで実施予定。
```

レビュアーは、AIが書いたかどうかだけではレビューできない。
diffの意図、確認結果、見てほしい場所、残課題が必要である。
AI-assisted PR descriptionは、その情報を渡すための文書である。

### ai-feature-brief.mdに書くこと

`ai-feature-brief.md` には、機能、利用者、目的、変更範囲、品質条件、非対象、受け入れ条件、不明点を書く。
AIへの依頼文を書く前に、人間が作るものと作らないものを決める。

```md
# AI Feature Brief

## 機能

-

## 利用者

-

## 目的

-

## 変更範囲

| area | change | note |
| --- | --- | --- |
| UI |  |  |
| API |  |  |
| DB |  |  |
| tests |  |  |
| docs |  |  |

## 非対象

-

## 品質条件

- 認可:
- 入力検証:
- アクセシビリティ:
- 依存追加:

## 受け入れ条件

- [ ]

## 受け入れ条件と確認方法

| condition | expected evidence |
| --- | --- |
|  |  |

## 不明点

-
```

briefは短くてよい。
大切なのは、AIが作業を広げすぎないよう、目的と範囲を先に置くことである。

### ai-context-pack.mdに書くこと

`ai-context-pack.md` には、AIに読ませたいfile、既存パターン、workspace状態、実行してよいcommand、渡してはいけない情報、調査依頼案を書く。

```md
# AI Context Pack

## 作業対象

-

## 読ませたいファイル

| file | why | note |
| --- | --- | --- |
| AGENTS.md |  | AI支援方針 |
| CLAUDE.md |  | あれば確認 |
|  |  |  |

## workspace状態

| item | value |
| --- | --- |
| branch |  |
| git status |  |
| 触ってよい既存変更 |  |
| 触ってはいけない既存変更 |  |

## 参考にしたい既存の書き方

| item | where | note |
| --- | --- | --- |
| 絞り込みUI |  |  |
| query parameter |  |  |
| API validation |  |  |
| tests |  |  |

## 実行してよい確認コマンド

-

## 情報の分類

| information | classification | handling |
| --- | --- | --- |
|  |  |  |

## 渡してはいけない情報

- .env
- secrets
- API keys
- 本番データ
- 個人情報
- 実tokenやCookie
- unrelated files

## AI coding agentへの調査依頼案

-
```

context packがあると、AIに毎回長い説明を貼らなくても、今回必要な情報を選べる。
また、読ませない情報を明示できる。

### claude-code-session-plan.mdに書くこと

`claude-code-session-plan.md` には、session目的、利用するAI tool、phase、allowed scope、permission、sandbox、approval、設定確認、verification、stop conditionを書く。

```md
# Claude Code Session Plan

## session目的

-

## tool and environment

| item | value |
| --- | --- |
| AI tool | Claude Code / Codex / other |
| workspace |  |
| branch |  |
| sandbox |  |
| approval policy |  |
| network access | deny / ask / allow |

## phase 1: investigate

Mode:
- plan mode

Expected output:
- related files
- existing pattern
- implementation plan
- tests to run
- risks
- questions

## phase 2: implement

Allowed scope:

| file/area | allowed | note |
| --- | --- | --- |
| UI | yes |  |
| API | yes |  |
| DB schema | no | 今回は変更しない |
| unrelated refactor | no |  |

## project instructions to check

| item | check result | note |
| --- | --- | --- |
| AGENTS.md |  | repository policy |
| CLAUDE.md |  | commands, rules, review focus |
| project settings |  | shared permissions |
| local settings |  | machine-specific |
| hooks / skills |  | 今回使うか |

## permissions

| action | policy | reason |
| --- | --- | --- |
| read files | allow | 調査に必要 |
| edit target files | ask | 変更前に確認 |
| run tests | allow/ask | 結果を記録 |
| network access | deny/ask | 外部へ出る操作を管理 |
| install package | ask | lockfileとsupply chain確認 |
| edit package.json / lockfile | ask | 依存変更は影響が広い |
| read .env | deny | secret保護 |
| delete files | ask | 誤削除防止 |
| git push | deny | 人間が実行 |
| deploy | deny | 扱わない |

## verification evidence

| check | command or manual | expected evidence |
| --- | --- | --- |
| lint |  |  |
| type check |  |  |
| test |  |  |
| manual UI |  |  |

## stop conditions

- 変更範囲が広がった
- DB schema変更が必要になった
- secretや個人情報が必要になった
- 新しい依存追加が必要になった
- network accessやdeployが必要になった
- テストが大量に壊れた
- AIが同じ修正を繰り返した
```

session planは、AIとの作業を安全に区切るための文書である。
AIが作業しやすくなるだけでなく、人間が途中で判断しやすくなる。

### ai-diff-review.mdに書くこと

`ai-diff-review.md` には、変更概要、git確認、changed files、受け入れ条件との対応、review checklist、気になった点、AIに戻した修正依頼、人間が直したことを書く。

```md
# AI Diff Review

## 変更概要

-

## changed files

| file | change | review result |
| --- | --- | --- |
|  |  |  |

## git確認

| check | result | note |
| --- | --- | --- |
| git status |  |  |
| git diff |  |  |
| git diff --staged |  | stagingしている場合 |

## 受け入れ条件との対応

| acceptance criteria | satisfied | evidence |
| --- | --- | --- |
|  |  |  |

## review checklist

- [ ] 仕様を満たしている
- [ ] 変更範囲が適切
- [ ] 既存の書き方に沿っている
- [ ] 不要な抽象化がない
- [ ] エラーハンドリングがある
- [ ] secretや個人情報を扱っていない
- [ ] アクセシビリティを確認した
- [ ] テストがある
- [ ] 実行したcommandと結果を確認した
- [ ] package追加やlockfile変更が妥当
- [ ] 不要なfile変更がない

## 気になった点

| issue | severity | action |
| --- | --- | --- |
|  |  |  |
```

diff reviewは、AIを疑うためではない。
自分のPRとして出せる状態かを確認するためである。

### ai-work-log.mdとai-assisted-pr-description.mdに書くこと

`ai-work-log.md` には、AIとの作業記録を書く。
`ai-assisted-pr-description.md` には、チームへ渡すPR説明を書く。
work logは自分とメンターのための詳細記録、PR descriptionはレビュアーのための要約である。

```md
# AI Work Log

## task

-

## tool and mode

| item | value |
| --- | --- |
| AI tool |  |
| model or version |  |
| mode |  |
| sandbox |  |
| approval policy |  |
| network access |  |

## workspace status

| timing | status |
| --- | --- |
| before |  |
| after |  |

## prompts summary

| step | prompt summary | result |
| --- | --- | --- |
| investigate |  |  |
| plan |  |  |
| implement |  |  |
| fix |  |  |

## accepted plan

-

## changed files

-

## rejected suggestions

| suggestion | reason |
| --- | --- |
|  |  |

## verification

| check | command or manual | result | note |
| --- | --- | --- | --- |
| lint |  |  |  |
| type check |  |  |  |
| test |  |  |  |
| manual UI |  |  |  |

## failures and fixes

| failure | cause | fix |
| --- | --- | --- |
|  |  |  |

## remaining risks

-

## checks not run

| check | reason |
| --- | --- |
|  |  |
```

```md
# PR Description

## Summary

-

## Changes

-

## AI assistance

- Tool:
- Used for:
- Human-verified:

## Verification

- [ ]

## Checks not run

-

## Review focus

-

## Remaining work

-
```

この二つを分けると、記録と共有が混ざりにくい。
work logには細かい失敗や試行錯誤を残す。
PRには、レビュアーが判断するための要点を書く。

### AIコーディングで起きやすい誤解

- AIコーディングを、速くコードを書かせる作業だと考える。仕様化、context設計、計画、レビュー、検証まで含める。
- feature briefを書かずに依頼する。AIが暗黙の前提で範囲を広げる。
- acceptance criteriaを作らず、AIの完了報告で終わる。
- contextを多く渡せばよいと考える。必要なfileと禁止情報を分ける。
- `.env`、secret、本番データ、個人情報を読ませる。
- AGENTS.mdやCLAUDE.mdをsecretの置き場にする。
- plan modeを省略し、調査前に実装させる。
- permissionsを強くしすぎる。読み取り、編集、git操作、deployを分ける。
- sandboxとapprovalを同じものだと考える。技術的な境界と人間の承認は別である。
- allowやautoを広げれば安全に速くなると考える。強い操作には摩擦を残す。
- CLAUDE.mdを一度書いて放置する。古い指示や矛盾がAIの品質を下げる。
- hooksやskillsを最初から作り込みすぎる。手順が固まってから自動化する。
- AIが作ったdiffを説明だけで判断する。diff、test、manual checkを見る。
- `git status`を見ず、unrelated changesや既存の未commit変更に気づかない。
- 小さな機能に不要な抽象化を入れる。
- 新しいpackage追加を、理由やlockfile確認なしに受け入れる。
- securityとaccessibilityをAI任せにする。
- テストが通ったという報告だけを読み、実際のcommand resultを見ない。
- 実行していない確認を、PRで実行済みのように書く。
- sessionが崩れているのに、promptだけを変えて続ける。
- AI利用の記録を残さず、PRで何を確認したか説明できない。

### AI作業ログと差分レビューで確認すること

この章では、`ai-feature-brief.md`、`ai-context-pack.md`、`claude-code-session-plan.md`、`ai-diff-review.md`、`ai-work-log.md`、`ai-assisted-pr-description.md` を作る。

最初に、第9章から第13章の成果物を読み直す。
支援ステータスのドメイン、データ、API、UI、テスト観点を確認する。
次に、第18章の `prompt-context-design.md`、`agent-boundary-note.md`、`ai-evaluation-note.md` を読み、AIに渡すcontext、toolの境界、評価軸を思い出す。

`ai-feature-brief.md` には、支援ステータス一覧の絞り込み機能について、利用者、目的、変更範囲、非対象、受け入れ条件、不明点を書く。

`ai-context-pack.md` には、読ませたいfile、既存パターン、workspace状態、実行してよいcommand、渡してはいけない情報、AI coding agentへの調査依頼案を書く。

`claude-code-session-plan.md` には、plan modeで何を調査させるか、実装で触ってよい範囲、permission、sandbox、approval、CLAUDE.mdやsettingsの確認、verification、stop conditionを書く。

`ai-diff-review.md` には、AI-generated diffを、受け入れ条件、git status、既存パターン、security、accessibility、test、dependency change、unrelated changesの観点で確認した結果を書く。

`ai-work-log.md` には、使ったtool、mode、permission、主要promptの要約、採用した計画、採用しなかった提案、変更file、実行したtest、失敗と修正、manual check、remaining risksを書く。

`ai-assisted-pr-description.md` には、変更概要、AI assistance、verification、実行しなかった確認、review focus、remaining workを書く。
AI利用の書き方は、チームルールに合わせる。

実際にClaude Codeを使わない場合でも、この章の成果物は作れる。
AIに依頼するつもりでbrief、context、plan、review、verificationを書けばよい。
実際にAIを使った場合は、AIが実行したcommandと結果を必ず確認し、実行していない確認を実行済みのように書かない。

### AIコーディングの章で持ち帰ること

第19章で身につけるべきことは、AIコーディングを、コード生成ではなく管理された開発工程として扱うことである。
AIに作らせる前に、feature briefで作るものと作らないものを決める。
context packで、読ませる情報と読ませない情報を分ける。
plan modeで、編集前にAIの理解と変更方針を見る。
permissions、sandbox、approval、settings、CLAUDE.mdやAGENTS.mdで、AIができることとプロジェクトの前提を管理する。

実装は小さなdiffに分ける。
AI-generated diffは、人間のコードと同じように読む。
仕様、設計、security、accessibility、testを確認する。
テストとmanual checkで完了を判断し、AIの完了報告だけで終わらない。

最後に、ai-work-logとPR説明で、何をAIに頼み、何を採用し、何を人間が確認したかを説明可能にする。
AIは作業を速くする。
しかし、採否と説明責任は開発者が持つ。

### テクニカルライティングと知識共有の章へ

次章では、AIや人と行った作業を、後から読める技術文書として残す方法を扱う。
第19章で作ったfeature brief、context pack、diff review、work log、PR説明は、そのまま第20章のREADME、設計メモ、ADR、インシデント報告の材料になる。
AIコーディングを一回の作業で終わらせず、チームの知識へ変える。

### 参考資料

- [Claude Code Docs: Overview](https://code.claude.com/docs/en/overview)
- [Claude Code Docs: Common workflows](https://code.claude.com/docs/en/common-workflows)
- [Claude Code Docs: Configure permissions](https://code.claude.com/docs/en/permissions)
- [Claude Code Docs: Settings](https://code.claude.com/docs/en/settings)
- [Claude Code Docs: Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Docs: Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Docs: Skills](https://code.claude.com/docs/en/skills)
- [OpenAI Codex Docs: Overview](https://developers.openai.com/codex)
- [OpenAI Codex Docs: CLI](https://developers.openai.com/codex/cli)
- [OpenAI Codex Docs: Cloud tasks](https://developers.openai.com/codex/cloud)
- [OpenAI Codex Docs: Agent approvals and security](https://developers.openai.com/codex/agent-approvals-security)
- [OpenAI Codex Docs: Sandboxing](https://developers.openai.com/codex/concepts/sandboxing)
- [OpenAI Codex Docs: Permissions](https://developers.openai.com/codex/permissions)
- [OWASP 2025 Top 10 Risk & Mitigations for LLMs and Gen AI Apps](https://genai.owasp.org/llm-top-10/)
- [GitHub Docs: Collaborating with pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/)
- [Software Engineering at Google](https://abseil.io/resources/swe-book/html/toc.html)

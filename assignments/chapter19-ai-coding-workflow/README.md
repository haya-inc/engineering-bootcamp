# 第19章 AIコーディングの実務ワークフロー ワークブック

このワークブックは、第19章の演習「機能ブリーフを書く」「コンテキストパックを作る」「Claude Codeセッション計画を書く」「AI生成差分をレビューする」「検証ログとPR説明を書く」で使う。

## 使い方

この資料と、第9章から第13章の成果物、第18章で作成した `prompt-context-design.md`、`agent-boundary-note.md`、`ai-evaluation-note.md` を読み、`ai-feature-brief.md`、`ai-context-pack.md`、`claude-code-session-plan.md`、`ai-diff-review.md`、`ai-work-log.md`、`ai-assisted-pr-description.md` を書く。

目的は、Claude CodeやCodexのようなAI coding agentにコードを書かせること自体ではない。AIを使ったコード変更を、仕様、コンテキスト、権限、差分、テスト、レビュー、記録まで含めて管理できるようにすることである。

## 前提

研修用学習ログアプリに、次の機能を追加する想定で考える。

```txt
メンターが支援ステータス一覧を、ステータスと最終更新日で絞り込めるようにする。
```

この章では、AIコーディングツールの中心例をClaude Codeにする。
ただし、Codex、Cursor、GitHub Copilotのagent機能などを使う場合も、同じ型で考える。
tool名が変わっても、読ませる情報、編集範囲、sandbox、approval、検証証跡、PR説明を分ける。

扱うこと:

- 機能ブリーフ
- コンテキストパック
- Claude Codeセッション計画
- plan mode
- permissions、sandbox、approval
- CLAUDE.md、AGENTS.mdなどのproject instructions
- diff review
- test、lint、type check、manual check
- ai-work-log
- PR説明

扱わないこと:

- Claude Codeの全機能網羅
- 各AIコーディングツールの詳細比較
- MCP server構築
- hooksやskillsの高度な自動化
- 本番自動デプロイをAIに任せる運用
- AI coding toolの優劣比較

## 演習1: 機能ブリーフを書く

### 考えること

AIに依頼する前に、作るもの、作らないもの、完了条件を明確にする。

問い:

- 誰のための機能か。
- 何ができるようになるのか。
- どの画面、API、DB、テストが関係するか。
- 認可、入力検証、アクセシビリティ、依存追加で守る条件は何か。
- 今回やらないことは何か。
- 受け入れ条件は何か。
- 受け入れ条件は何で確認できるか。
- 不明点は何か。

### 記録すること

`ai-feature-brief.md` は次の形で書く。

````md
# AI機能ブリーフ

## 機能

-

## 利用者

-

## 目的

-

## 変更範囲

| 領域 | 変更 | メモ |
| --- | --- | --- |
| UI |    |    |
| API |    |    |
| DB |    |    |
| テスト |    |    |
| docs |    |    |

## 非対象

-

## 品質条件

| 観点 | 条件 |
| --- | --- |
| 認可 |    |
| 入力検証 |    |
| アクセシビリティ |    |
| 依存追加 |    |

## 受け入れ条件

- [ ]
- [ ]
- [ ]

## 受け入れ条件と確認方法

| condition | expected evidence |
| --- | --- |
|    |    |

## 不明点

-
````

## 演習2: コンテキストパックを作る

### 考えること

AI coding agentに読ませる情報を選ぶ。全部読ませるのではなく、今回の作業に必要な情報を整理する。

問い:

- 関連する仕様はどれか。
- 既存コードのどのパターンを参考にすべきか。
- 関連するテストはどれか。
- AGENTS.md、CLAUDE.md、READMEなど、AIが先に読むべきproject instructionsはどれか。
- 現在のbranchや未commit変更はどうなっているか。
- 実行すべきコマンドは何か。
- AIに渡してはいけない情報は何か。

### 記録すること

`ai-context-pack.md` は次の形で書く。

````md
# AIコンテキストパック

## 作業対象

-

## 読ませたいファイル

| ファイル | 理由 | メモ |
| --- | --- | --- |
| AGENTS.md |    | AI支援方針 |
| CLAUDE.md |    | あれば確認 |
|    |    |    |

## ワークスペース状態

| 項目 | 値 |
| --- | --- |
| branch |    |
| git status |    |
| 触ってよい既存変更 |    |
| 触ってはいけない既存変更 |    |

## 参考にしたい既存パターン

| パターン | 場所 | メモ |
| --- | --- | --- |
| filter UI |    |    |
| query parameter handling |    |    |
| API validation |    |    |
| テスト |    |    |

## 実行してよい確認コマンド

-

## 情報の分類

| 情報 | 分類 | 扱い |
| --- | --- | --- |
|    |    |    |

## 渡してはいけない情報

- .env
- secrets
- API keys
- production data
- personal data
- tokenやCookieの実値
- unrelated files

## AI coding agentへの調査依頼案

```txt
このリポジトリで、支援ステータス一覧の絞り込み機能を追加する前に、関連する既存実装を調査してください。

確認してほしいこと:
- 一覧画面の実装場所
- APIの実装場所
- query parameterやfilterの既存パターン
- テストの書き方
- 変更すべきファイル候補
- リスク

まだ編集はしないでください。調査結果と実装計画だけ出してください。
```
````

## 演習3: Claude Codeセッション計画を書く

### 考えること

Claude Codeに、調査、計画、実装、検証を分けて依頼する。

問い:

- plan modeで何を調査させるか。
- 計画に何を含めるか。
- 実装で触ってよいファイルは何か。
- permission、sandbox、approvalで注意すべき操作は何か。
- network accessやpackage installをどう扱うか。
- どのテストを実行するか。
- どの条件なら作業を止めるか。

### 記録すること

`claude-code-session-plan.md` は次の形で書く。

```md
# Claude Codeセッション計画

## セッション目的

-

## toolと環境

| 項目 | 値 |
| --- | --- |
| AI tool | Claude Code / Codex / other |
| workspace |    |
| branch |    |
| sandbox |    |
| approval policy |    |
| network access | deny / ask / allow |

## フェーズ1: 調査

モード:

- plan mode

依頼内容:

-

期待する出力:

- related files
- existing patterns
- implementation plan
- tests to run
- risks
- questions

## フェーズ2: 実装

許可する範囲:

| ファイルまたは領域 | 許可 | メモ |
| --- | --- | --- |
| UI | はい |    |
| API | はい |    |
| DB schema | いいえ | 今回は追加しない |
| unrelated refactor | いいえ |    |

## project instructions確認

| 項目 | 確認結果 | メモ |
| --- | --- | --- |
| AGENTS.md |    | repository policy |
| CLAUDE.md |    | あれば確認 |
| project settings |    | shared permissions |
| local settings |    | machine-specific |
| hooks / skills |    | 今回使うか |

## 権限

| 対応 | policy | 理由 |
| --- | --- | --- |
| read files | allow | 調査に必要 |
| edit target files | ask or acceptEdits | 差分レビュー前提 |
| run tests | allow/ask |    |
| network access | deny/ask | 外部へ出る操作を管理 |
| install package | ask | lockfileとsupply chain確認 |
| edit package.json / lockfile | ask | 依存変更は影響が広い |
| read .env | deny | secret保護 |
| delete files | ask | 誤削除防止 |
| git push | deny | 人間が実行する |
| deploy | deny | 本章では扱わない |

## フェーズ3: 検証

コマンド:

-

手動確認:

-

検証証跡:

| 確認 | 期待する証跡 |
| --- | --- |
| lint |    |
| type check |    |
| test |    |
| manual UI |    |

## 停止条件

- 変更範囲が広がった
- DB schema変更が必要になった
- secretや個人情報が必要になった
- 新しい依存追加が必要になった
- network accessやdeployが必要になった
- テストが大量に壊れた
- AIが同じ修正を繰り返した
```

## 演習4: AI生成差分をレビューする

### 考えること

AIの実装を、自分の責任でレビューする。

問い:

- 受け入れ条件を満たしているか。
- 変更範囲が広がりすぎていないか。
- 既存パターンに沿っているか。
- 不要な抽象化が入っていないか。
- セキュリティやアクセシビリティの抜けはないか。
- テストは十分か。
- `git status` とdiffに、AIの報告にない変更が混ざっていないか。
- package追加やlockfile変更は必要な範囲か。
- 実行したcommandと結果を確認したか。

### 記録すること

`ai-diff-review.md` は次の形で書く。

```md
# AI差分レビュー

## 変更概要

-

## 変更ファイル

| file | change | review result |
| --- | --- | --- |
|    |    |    |

## git確認

| check | result | note |
| --- | --- | --- |
| git status |    |    |
| git diff |    |    |
| git diff --staged |    | stagingしている場合 |

## 受け入れ条件との対応

| acceptance criteria | satisfied | エビデンス |
| --- | --- | --- |
|    |    |    |

## レビュー観点チェックリスト

- [ ] 仕様を満たしている
- [ ] 変更範囲が適切
- [ ] 既存パターンに沿っている
- [ ] 不要な抽象化がない
- [ ] エラーハンドリングがある
- [ ] secretや個人情報を扱っていない
- [ ] アクセシビリティを確認した
- [ ] テストがある
- [ ] 実行したcommandと結果を確認した
- [ ] package追加やlockfile変更が妥当
- [ ] 不要なファイル変更がない

## 気になった点

| 課題 | severity | 対応 |
| --- | --- | --- |
|    |    |    |

## AIに戻した修正依頼

-

## 人間が直したこと

-
```

## 演習5: 検証ログとPR説明を書く

### 考えること

AIを使った実装を、チームがレビューできる形にまとめる。

問い:

- 何をAIに依頼したか。
- どのAI tool、mode、permission、sandboxで実施したか。
- どの計画を採用したか。
- 採用しなかったAI提案は何か。
- 何が変わったか。
- どのテストを実行したか。
- 実行しなかった確認は何か。
- 何が失敗し、どう直したか。
- レビュアーにどこを見てほしいか。

### 記録すること

`ai-work-log.md` は次の形で書く。

```md
# AI作業ログ

## タスク

-

## toolとmode

| 項目 | 値 |
| --- | --- |
| AI tool |    |
| model or version |    |
| mode |    |
| sandbox |    |
| approval policy |    |
| network access |    |

## workspace status

| timing | status |
| --- | --- |
| before |    |
| after |    |

## プロンプト要約

| 手順 | プロンプト要約 | 結果 |
| --- | --- | --- |
| investigate |    |    |
| plan |    |    |
| implement |    |    |
| fix |    |    |

## 採用した計画

-

## 変更ファイル

-

## 採用しなかったAI提案

| 提案 | 採用しなかった理由 |
| --- | --- |
|    |    |

## 検証

| 確認 | コマンドまたは手動手順 | 結果 | メモ |
| --- | --- | --- | --- |
| lint |    |    |    |
| type check |    |    |    |
| test |    |    |    |
| manual UI |    |    |    |

## 失敗と修正

| failure | cause | fix |
| --- | --- | --- |
|    |    |    |

## 残っているリスク

-

## 実行しなかった確認

| 確認 | 理由 |
| --- | --- |
|    |    |
```

`ai-assisted-pr-description.md` は次の形で書く。

```md
# PR説明

## 概要

-

## 変更内容

-

## AI支援

- Tool:
- Used for:
- Human-verified:

## 検証

- [ ]

## 実行しなかった確認

-

## レビューしてほしい点

-

## 残作業

-
```

## AIを使う場合

この章自体がAI利用を扱うため、AIに任せてよいことと任せたままにしてはいけないことを明確にする。

AIに頼んでよいこと:

- 既存コードの調査
- 実装計画の作成
- 小さな実装
- テスト追加
- エラー原因の候補出し
- PR説明の下書き
- レビュー観点の洗い出し
- 実行したコマンド結果の整理

AIに任せたままにしてはいけないこと:

- 仕様の最終判断
- 受け入れ条件の変更
- 大きな差分の無確認採用
- 秘密情報、個人情報、本番データの読み取り
- `.env`、token、Cookie実値の読み取り
- 未確認の依存package追加
- git push、deploy、production data変更
- テスト未実行の完了宣言
- レビューなしのPR作成

AIへの依頼例:

```txt
支援ステータス一覧に、ステータスと最終更新日の絞り込みを追加したいです。

まず編集せずに調査してください。

前提:
- 変更は小さくしたい
- DB schema変更は今回はしない
- 既存の一覧画面、API、テストのパターンに合わせたい
- secretや.envは読まないでください
- package追加、lockfile変更、network accessが必要なら、実行前に止めて理由を説明してください
- 既存の未commit変更やunrelated filesは触らないでください

出してほしいこと:
- 関連ファイル
- 既存パターン
- 実装計画
- 変更対象ファイル
- テスト方針
- リスク
- 実装前に確認すべき質問
```

## チェックリスト

提出前に確認する。

- [ ] `ai-feature-brief.md` に目的、利用者、変更範囲、品質条件、非対象、受け入れ条件、確認方法がある
- [ ] `ai-context-pack.md` に読ませる情報、既存パターン、workspace状態、実行コマンド、渡してはいけない情報がある
- [ ] `claude-code-session-plan.md` に調査、計画、実装、検証、permission、sandbox、approval、停止条件がある
- [ ] plan modeまたは編集前の計画レビューを使っている
- [ ] `ai-diff-review.md` に仕様、git確認、既存パターン、セキュリティ、アクセシビリティ、テスト、依存変更の観点がある
- [ ] `ai-work-log.md` にtool/mode、prompt要約、変更概要、採用しなかった提案、検証結果、失敗と修正、残課題がある
- [ ] `ai-assisted-pr-description.md` に変更概要、AI利用、検証、実行しなかった確認、レビューしてほしい箇所がある
- [ ] AI生成差分をそのまま採用していない
- [ ] 実行していない確認を、実行済みのように書いていない
- [ ] `.env`、token、Cookie、個人情報、本番データを提出物やAI入力に含めていない
- [ ] package追加やlockfile変更があれば理由と確認結果を書いた
- [ ] git push、deploy、本番データ変更をAIに任せていない

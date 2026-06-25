# 第18章 LLMと生成AIの基礎 ワークブック

このワークブックは、第18章の演習「AIに任せるタスクを分類する」「プロンプトとコンテキストを設計する」「RAGと根拠付けの設計を書く」「エージェントにするべきか判断する」「AI出力の評価表を作る」で使う。

## 使い方

この資料と、第3章で作成したAI利用ルール、第14章で作成した `secrets-and-dependencies-check.md`、第17章で作成した `observability-goals.md` を読み、`ai-task-fit-note.md`、`prompt-context-design.md`、`rag-grounding-note.md`、`agent-boundary-note.md`、`ai-evaluation-note.md` を書く。

目的は、LLMや生成AIの用語を暗記することではない。AIに何を任せ、何をcontextとして渡し、どの根拠を使い、どこで人間が確認し、どう評価するかを説明できるようにすることである。

## 前提

研修用学習ログアプリに、次のAI支援機能を追加する想定で考える。

```txt
メンターが受講者の学習ログを読み、次の支援コメント案をAIに作らせる。
```

入力候補:

- 受講者の最近の学習ログ
- メンターが書いた過去の支援コメント
- 研修ロードマップ
- 今週の課題

出力候補:

- 支援コメント案
- 根拠になったログ
- 確認すべき不確実な点
- メンターが編集すべき箇所

扱わないこと:

- Transformerの数式
- fine-tuningの詳細
- embeddingの詳細な数理
- vector databaseの本格運用
- エージェントフレームワーク比較
- AI法務の専門論点

## 演習1: AIに任せるタスクを分類する

### 考えること

AI支援機能を、いきなり「AIにコメントを書かせる」とまとめない。作業を分解し、AIに向くもの、人間が確認すべきもの、AIに任せないものを分ける。

問い:

- 支援コメント案を作るには、どんな作業があるか。
- その作業は、生成、要約、抽出、分類、検索、判断、実行のどれか。
- AIに任せると何が速くなるか。
- AIが間違えると何が困るか。
- 人間が確認すべき判断は何か。
- そもそもAIに任せない方がよい作業は何か。
- 承認が必要な操作はどれか。
- 採用判断の根拠として何を記録するか。

### 記録すること

`ai-task-fit-note.md` は次の形で書く。

```md
# AIタスク適性メモ

## タスク分解

| task | 種類 | AI fit | human review | failure impact | 記録する根拠 |
| --- | --- | --- | --- | --- | --- |
| 学習ログを要約する | summarize | high | はい | 重要な文脈を落とす | 対象ログID |
| 困っていそうな点を抽出する | extract | medium | はい | 誤解した支援になる | 該当ログの要約 |
| 支援コメント案を書く | generate | high | はい | 不適切な文面になる | 根拠と確認事項 |
| 支援方針を確定する | decide | low | 必須 | 支援がずれる | メンター判断 |
| コメントを送信する | execute | low | 必須 | 誤送信する | 承認者と送信記録 |

## AIに任せること

-

## 人間が確認すること

-

## AIに任せないこと

-

## 失敗時の影響

-

## 承認が必要な操作

| 操作 | 承認者 | 承認前に見るもの |
| --- | --- | --- |
|  |  |  |
```

## 演習2: プロンプトとコンテキストを設計する

### 考えること

AIに良い出力を出させるために、目的、背景、制約、出力形式、評価基準を明確にする。

問い:

- AIに何をしてほしいか。
- 誰のための出力か。
- どのcontextが必要か。
- contextのsource versionや新しさはどう確認するか。
- 渡してはいけない情報は何か。
- どんな出力形式にするか。
- structured outputを使うなら、どの項目をschemaで必須にし、何をアプリ側でvalidationするか。
- 良い出力と悪い出力は何か。

### 記録すること

`prompt-context-design.md` は次の形で書く。

````md
# プロンプトとコンテキスト設計

## タスク

-

## 利用者

-

## プロンプトに入れる要素

| 要素 | 内容 | メモ |
| --- | --- | --- |
| 目的 |    |    |
| background |    |    |
| 入力 |    |    |
| constraints |    |    |
| output format |    |    |
| evaluation criteria |    |    |
| 悪い出力の例 |    |    |

## 必要なコンテキスト

| コンテキスト | 必要な理由 | 出典/source version | 新しさ | 信頼度 | 含めるか | 注意 |
| --- | --- | --- | --- | --- | --- | --- |
| 最近の学習ログ | 支援内容の根拠 | app DB | high | medium | はい | 必要な範囲に絞る |
| 研修ロードマップ | 次の学習提案 | book content | medium | high | はい | 章と版を確認する |
| 個人情報 | 不要 | app DB | high | high | いいえ | 匿名化する |

## 出力形式とvalidation

- 人間が読む部分:
- 機械処理する部分:
- schemaで必須にする項目:
- 出力を受け取った後のvalidation:
- 承認が必要な出力:

## プロンプト案

```txt
あなたは新人エンジニア研修のメンター支援アシスタントです。

目的:
- 受講者の学習ログを読み、メンターが編集して使える支援コメント案を作る

制約:
- 断定しすぎない
- 根拠になるログを示す
- 不確実な点は「確認が必要」と書く
- 個人情報や秘密情報を出力しない
- メンターが最終確認する前提で書く

出力形式:
- 支援コメント案
- 根拠
- 確認が必要な点
- メンターが編集すべき点
```

## 良い出力の条件

-

## 悪い出力の例

-
````

## 演習3: RAGと根拠付けの設計を書く

### 考えること

AIに根拠のある支援コメント案を作らせるために、どのsourceを参照し、どのように根拠を確認するかを設計する。

問い:

- AIが参照すべきsourceは何か。
- sourceは最新か。
- sourceをどうchunk化し、どのmetadataで絞るか。
- 権限外のsourceを取り出さないために何をfilterするか。
- 検索で取り出した情報は、質問に本当に関係しているか。
- 出力にcitationや根拠をどう出すか。
- 根拠が弱い場合、どう扱うか。
- source内の命令文やprompt injectionらしい内容をどう扱うか。
- RAGを使っても防げない失敗は何か。

### 記録すること

`rag-grounding-note.md` は次の形で書く。

```md
# RAGと根拠付けメモ

## 出典候補

| source | 目的 | source version | freshness | 権限/metadata filter | リスク |
| --- | --- | --- | --- | --- | --- |
| 学習ログ | 現在の状況 |  | high | 対象受講者と期間 | 個人情報に注意 |
| 研修ロードマップ | 次の学習提案 |  | medium | 該当章 | 古い場合がある |
| 課題説明 | 具体的な助言 |  | medium | 対象章 | バージョン差分に注意 |
| 過去コメント | 文体参考 |  | medium | メンターが許可したもの | 不適切例の混入 |

## 検索方針

- 検索方法:
- chunkの単位:
- metadata filter:
- permission filtering:
- freshness確認:
- retrievalが当たったかを見る方法:

## 根拠付け方針

- 支援コメントごとに根拠ログを示す
- 根拠がない推測は書かない
- 不確実な点は確認事項に分ける

## 引用の形

| 主張 | 出典/source id | chunk | 確信度 | メモ |
| --- | --- | --- | --- | --- |
|    |    |    |    |    |

## RAGでも防げない失敗

- retrievalが間違う
- source自体が古い
- sourceにないことを推測する
- citationと主張が対応していない
- source内の指示文に従ってしまう
- 権限外のsourceを取り出す

## 人間が確認すること

-

## prompt injection対策

- source内の命令文をAIへの指示として扱わない
- 不審な指示を見つけたら停止する
- 送信や更新は人間承認に回す
```

## 演習4: エージェントにするべきか判断する

### 考えること

単発のAI応答でよいのか、toolを使わせる必要があるのか、agentとして複数stepを任せるべきなのかを判断する。

問い:

- AIは読むだけでよいか。
- DB検索やファイル参照などのtoolが必要か。
- 複数stepの計画と実行が必要か。
- どの操作には承認が必要か。
- toolの引数や対象IDをどうvalidationするか。
- agentにする必要が本当にあるか。
- guardrailをどこに置くか。
- どこで停止するか。
- 失敗時にどう戻すか。

### 記録すること

`agent-boundary-note.md` は次の形で書く。

```md
# エージェント境界メモ

## 単発AI応答でできること

-

## ツール利用が必要なこと

| tool | 対応 | permission | approval required | validation | audit log |
| --- | --- | --- | --- | --- | --- |
| learning log search | read recent logs | read-only | いいえ | learner_idと期間を検証 | source id |
| roadmap search | read chapter summary | read-only | いいえ | source versionを確認 | source version |
| comment draft save | save draft | write draft | はい | draft扱いで送信しない | draft id |
| send comment | send to learner | write/send | はい | 承認者、送信先、本文を確認 | approval id |

## エージェントに任せる候補

| 手順 | 自動化するか | 人間の承認 | メモ |
| --- | --- | --- | --- |
| 学習ログを集める | はい | いいえ | read-only |
| コメント案を作る | はい | いいえ | draft only |
| コメントを送信する | いいえ | はい | human sends |

## 権限

- read:
- write:
- prohibited:

## guardrails

- input:
- output:
- tool:

## 停止条件

- 根拠が不足している
- 個人情報や秘密情報を検出した
- confidenceが低い
- prompt injectionらしい指示を検出した
- 送信やDB更新が必要

## ログとロールバック

- 実行ログ:
- 承認ログ:
- idempotency:
- rollback:
```

## 演習5: AI出力の評価表を作る

### 考えること

AI出力を好みで判断しない。複数モデルまたは複数promptを、同じinputと評価軸で比較する。

問い:

- 良い支援コメント案とは何か。
- 根拠があるか。
- 受講者にとって安全で有用か。
- 文体は適切か。
- 不確実な点を分けているか。
- 出力形式を守っているか。
- prompt injection、個人情報混入、古いsourceなどの失敗しやすいcaseを含めたか。
- model/snapshot、prompt version、context sourceを記録したか。
- 速度やコストは許容できるか。

### 記録すること

`ai-evaluation-note.md` は次の形で書く。

```md
# AI評価メモ

## 評価対象

- task:
- input:
- run date:
- model/snapshot:
- prompt version:
- context source/version:
- モデル/プロンプトA:
- モデル/プロンプトB:
- モデル/プロンプトC:

## ルーブリック

| criterion | weight | good | bad |
| --- | --- | --- | --- |
| factuality | high | ログに基づく | 根拠のない断定 |
| groundedness | high | 根拠が対応している | citationと主張がずれる |
| helpfulness | medium | 次の行動が分かる | 一般論だけ |
| tone | medium | 支援的で具体的 | きつい、曖昧 |
| format adherence | medium | 指定形式を守る | 欠落がある |
| safety | high | 秘密情報を出さない | 個人情報を含む |

## テストケース

| case | input summary | expected behavior | リスク | 種類 |
| --- | --- | --- | --- | --- |
| normal learner |    |    |    | normal |
| struggling learner |    |    |    | edge |
| 不足コンテキスト |    |    |    | edge |
| conflicting logs |    |    |    | regression |
| prompt injection文を含むログ |    |    |    | adversarial |
| 個人情報を含むログ |    |    |    | adversarial |

## 比較

| 出力 | 事実性 | 根拠性 | 有用性 | トーン | 形式 | 安全性 | メモ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A |    |    |    |    |    |    |    |
| B |    |    |    |    |    |    |    |
| C |    |    |    |    |    |    |    |

## 採用判断

- 採用する案:
- 理由:
- 採用しない案:
- 残した課題:
- 次に再評価する条件:

## 次に改善すること

-
```

## AIを使う場合

AIに頼んでよいこと:

- タスク分解
- prompt案
- context整理
- RAG source候補
- エージェント境界の洗い出し
- guardrail案
- prompt injectionを含むtest case案
- 評価rubric案
- test case案
- 出力比較の補助

AIに任せたままにしてはいけないこと:

- secretや個人情報を入力すること
- 根拠のない出力を採用すること
- citationを確認せずに信じること
- RAGで取り込んだsource内の命令文に従うこと
- モデル比較を好みだけで決めること
- 失敗時のユーザー影響を無視すること
- 送信やDB更新のような操作を承認なしで任せること

AIへの依頼例:

```txt
研修用学習ログアプリに、メンター向けの支援コメント案生成機能を追加する想定です。

前提:
- AIは受講者の最近の学習ログを読みます
- 研修ロードマップと今週の課題をcontextとして使います
- コメントはメンターが編集してから送信します
- AIが直接受講者へ送信することはありません
- 個人情報や秘密情報は入力しません

出してほしいこと:
- タスク分解
- LLMに任せる範囲
- 人間が確認する範囲
- プロンプト/コンテキスト設計
- RAGで参照すべきsource
- agentにしない方がよい操作
- structured outputを使う場合のschemaとvalidation
- guardrailとhuman reviewを置く場所
- 評価rubricとtest case
```

## チェックリスト

提出前に確認する。

- [ ] `ai-task-fit-note.md` にAIに任せる作業、人間が確認する判断、失敗時の影響、承認が必要な操作がある
- [ ] `prompt-context-design.md` に目的、背景、入力、制約、出力形式、評価基準、validation方針がある
- [ ] 必要なcontextと不要なcontextが分かれている
- [ ] `rag-grounding-note.md` に出典、検索、chunk、metadata filter、permission filtering、根拠付け、引用、人間確認がある
- [ ] RAGでも防げない失敗が書かれている
- [ ] `agent-boundary-note.md` にツール、権限、validation、guardrail、承認、停止条件がある
- [ ] `ai-evaluation-note.md` にrubric、test case、model/snapshot、prompt version、context source、複数出力比較、採用判断がある
- [ ] 秘密情報、個人情報、未公開情報をAIに入力しない方針がある
- [ ] prompt injection、個人情報混入、古いsourceなどの失敗caseを評価に入れている
- [ ] 数理説明やモデル比較の詳細に入りすぎていない

# 第10章 データベース ワークブック

このワークブックは、第10章の演習「ドメインモデルからテーブル候補を作る」「カラムと制約を設計する」「スキーマ案を書く」「SQLで設計を確認する」「DB変更メモを書く」で使う。

## 使い方

この資料と、第9章で作成した `glossary.md`、`domain-model.md`、`domain-rules.md`、`acceptance-criteria.md` を読み、`data-model.md`、`constraint-checklist.md`、`schema-draft.sql`、`sql-check-log.md`、`db-change-note.md` を書く。

目的は、DB理論を網羅的に覚えることではない。第9章で整理した用語、関係、状態、ルールを、保存できるデータ構造と確認できるSQLに変換することである。

## 前提

研修用学習ログアプリに、次の機能を追加する。

```txt
メンターが、担当受講者に支援ステータスを付けられるようにしたい。
```

第9章で整理した前提:

- メンターは、担当受講者の学習状況を見て支援する。
- 受講者は、学習ログを提出する。
- 支援ステータスは、メンターが手動で付ける。
- 支援ステータスの例は、`none`、`needs_support`、`in_progress`、`resolved` とする。
- 初回リリースでは、自動アラート、分析ダッシュボード、CSV出力は作らない。

この章では、アプリケーションDB設計に集中する。分析SQLやデータ基盤は扱わない。

## 演習1: ドメインモデルからテーブル候補を作る

### 考えること

第9章の用語集とドメインモデルを読み、保存すべき対象を選ぶ。

問い:

- どの概念は、後から取得、更新、参照する必要があるか。
- どの概念は、状態値やカラムとして持てばよいか。
- どの関係は、外部キーや中間テーブルで表せるか。
- テーブルにしない用語は何か。その理由は何か。

候補:

- 受講者
- メンター
- 担当関係
- 学習ログ
- 支援ステータス
- 支援メモ

### 記録すること

`data-model.md` は次の形で書く。

```md
# データモデル

## テーブル候補

| テーブル候補 | 業務上の意味 | 主な利用場面 |
| --- | --- | --- |
| learners | 受講者 |    |
| mentors | メンター |    |
| mentor_assignments | メンターと受講者の担当関係 |    |
| learning_logs | 学習ログ |    |
| learner_support_statuses | 受講者ごとの支援ステータス |    |

## 関係

- mentors と learners:
- learners と learning_logs:
- learners と learner_support_statuses:

## テーブルにしない用語

| 用語 | 扱い | 理由 |
| --- | --- | --- |
| 未提出 |    |    |
| 要支援 |    |    |

## 迷っていること

- 
```

## 演習2: カラムと制約を設計する

### 考えること

各テーブルについて、カラム、型、必須か任意か、制約を考える。

問い:

- 主キーは何か。
- 外部キーは何か。
- NULLを許してよいカラムは何か。
- 重複してはいけない組み合わせは何か。
- 取りうる値を制限したいカラムは何か。
- DB制約ではなく、アプリケーションコードで守るべきルールは何か。

### 記録すること

`constraint-checklist.md` は次の形で書く。

```md
# 制約チェックリスト

## テーブル別カラム

### learners

| カラム | 意味 | 型 | 必須 | 制約、補足 |
| --- | --- | --- | --- | --- |
| id | 受講者ID |    | はい | 主キー |
| name | 受講者名 |    | はい |    |

### mentors

| カラム | 意味 | 型 | 必須 | 制約、補足 |
| --- | --- | --- | --- | --- |
| id | メンターID |    | はい | 主キー |
| name | メンター名 |    | はい |    |

### mentor_assignments

| カラム | 意味 | 型 | 必須 | 制約、補足 |
| --- | --- | --- | --- | --- |
| mentor_id | メンターID |    | はい | 外部キー |
| learner_id | 受講者ID |    | はい | 外部キー |

### learner_support_statuses

| カラム | 意味 | 型 | 必須 | 制約、補足 |
| --- | --- | --- | --- | --- |
| learner_id | 受講者ID |    | はい | 外部キー |
| status | 支援ステータス |    | はい | 許可値 |
| note | 支援メモ |    | いいえ |    |
| updated_by | 更新したメンター |    | はい | 外部キー |
| updated_at | 更新日時 |    | はい |    |

## DB制約で守ること

- 

## アプリケーションコードで守ること

- 

## 判断が必要なこと

- 
```

## 演習3: スキーマ案を書く

### 考えること

`constraint-checklist.md` をもとに、SQLのたたき台を書く。

この段階では、本番でそのまま使える完璧なSQLでなくてよい。重要なのは、テーブル、カラム、制約、サンプルデータを具体化し、レビューできる状態にすることである。

### 記録すること

`schema-draft.sql` は次の形で書く。

```sql
-- schema-draft.sql

CREATE TABLE learners (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE mentors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE mentor_assignments (
  mentor_id INTEGER NOT NULL,
  learner_id INTEGER NOT NULL,
  PRIMARY KEY (mentor_id, learner_id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(id),
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE TABLE learner_support_statuses (
  learner_id INTEGER PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('none', 'needs_support', 'in_progress', 'resolved')),
  note TEXT,
  updated_by INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id),
  FOREIGN KEY (updated_by) REFERENCES mentors(id)
);

INSERT INTO learners (id, name) VALUES
  (1, 'Learner A'),
  (2, 'Learner B');

INSERT INTO mentors (id, name) VALUES
  (1, 'Mentor A');

INSERT INTO mentor_assignments (mentor_id, learner_id) VALUES
  (1, 1),
  (1, 2);

INSERT INTO learner_support_statuses (
  learner_id,
  status,
  note,
  updated_by,
  updated_at
) VALUES
  (1, 'none', NULL, 1, '2026-05-17T09:00:00+09:00'),
  (2, 'needs_support', '学習ログの提出が遅れている', 1, '2026-05-17T09:00:00+09:00');
```

注意:

- 実際のDBMSによって、型や日時の扱いは変わる。
- ここでは、RDB設計の考え方を確認するためのたたき台として扱う。

## 演習4: SQLで設計を確認する

### 考えること

設計したテーブルが、ユースケースを満たせるかSQLで確認する。

確認すること:

- メンターの担当受講者一覧を取得できるか。
- 受講者ごとの支援ステータスを取得できるか。
- 支援ステータスを更新できるか。
- 制約違反になるデータを入れようとしたとき、失敗するか。
- SQLを書いてみて、設計しづらい点はないか。

### 記録すること

`sql-check-log.md` は次の形で書く。

````md
# SQL確認ログ

## 確認1: メンターの担当受講者一覧

目的:

- 

SQL:

```sql
SELECT
  learners.id,
  learners.name,
  learner_support_statuses.status
FROM learners
JOIN mentor_assignments
  ON mentor_assignments.learner_id = learners.id
LEFT JOIN learner_support_statuses
  ON learner_support_statuses.learner_id = learners.id
WHERE mentor_assignments.mentor_id = 1
ORDER BY learners.id;
```

結果:

- 

気づいたこと:

- 

## 確認2: 支援ステータスの更新

SQL:

```sql
INSERT INTO learner_support_statuses (
  learner_id,
  status,
  note,
  updated_by,
  updated_at
) VALUES (
  1,
  'needs_support',
  '学習ログの提出が遅れている',
  1,
  '2026-05-17T10:00:00+09:00'
)
ON CONFLICT (learner_id) DO UPDATE SET
  status = excluded.status,
  note = excluded.note,
  updated_by = excluded.updated_by,
  updated_at = excluded.updated_at;
```

結果:

- 

## 確認3: 制約違反

試したこと:

- 

結果:

- 

## 設計を見直したい点

- 
````

注意:

- `ON CONFLICT` はDBMSによって書き方が違う。
- 使うDBMSで動かない場合は、同じ意図のSQLに置き換える。

## 演習5: DB変更メモを書く

### 考えること

第6章のPR本文や、第20章の技術文書につながるように、DB変更の理由と影響を書く。

問い:

- なぜこのテーブルやカラムが必要か。
- 既存データに影響するか。
- 初期データや既定値は必要か。
- どのSQLで確認できるか。
- 失敗した場合、どのように戻すか。
- 第11章のAPI実装で注意することは何か。

### 記録すること

`db-change-note.md` は次の形で書く。

```md
# DB変更メモ

## 変更理由

- 

## 追加するテーブル、カラム、制約

- 

## 既存データへの影響

- 

## 初期データ、デフォルト値

- 

## 確認SQL

- 

## アプリケーションコード側で必要な対応

- 

## リスク

- 

## PR本文に書くこと

- 

## 第11章への引き継ぎ

- APIで必要になりそうなendpoint:
- requestとresponseに含める項目:
- 入力検証と認可で注意すること:
```

## AIを使う場合

AIに頼んでよいこと:

- テーブル候補の初稿
- カラム候補の初稿
- 制約候補の洗い出し
- SQL確認例
- 正規化や重複の観点のチェック
- インデックス候補の洗い出し

AIに任せたままにしてはいけないこと:

- 業務上の意味の確定
- 既存データへの影響判断
- DB制約とアプリケーションコードの責任分担
- 履歴を残すかどうかの判断
- 実行していないSQLを確認済みとして扱うこと

AIへの依頼例:

```txt
研修用学習ログアプリに、メンターが担当受講者へ支援ステータスを付けられる機能を追加します。

第9章で決めたこと:
- メンターは担当受講者だけを支援できる
- 支援ステータスはメンターが手動で変更する
- 自動アラートや分析ダッシュボードは今回対象外
- 支援ステータスには none, needs_support, in_progress, resolved がある

目的:
RDBのテーブル案、カラム案、制約案、確認SQLを作りたいです。

制約:
- アプリケーションDB設計に集中する
- 分析SQLは深掘りしない
- 判断が必要な点は、決めつけずに分ける

出してほしいこと:
- テーブル候補と役割
- 主キー、外部キー、UNIQUE、CHECK
- 現在値だけ持つ案と履歴を持つ案の違い
- SELECT, INSERT, UPDATE, JOIN の確認SQL
- 既存データへの影響として確認すべきこと
```

## チェックリスト

提出前に確認する。

- [ ] `data-model.md` にテーブル候補、役割、関係がある
- [ ] テーブルにしない用語と理由が書かれている
- [ ] `constraint-checklist.md` に主キー、外部キー、必須、UNIQUE、CHECKがある
- [ ] DB制約で守ることとアプリケーションコードで守ることが分かれている
- [ ] `schema-draft.sql` に主要テーブル、制約、サンプルデータがある
- [ ] `sql-check-log.md` にSELECT、JOIN、更新、制約確認がある
- [ ] `db-change-note.md` に変更理由、既存データへの影響、確認方法がある
- [ ] 分析SQLやデータ基盤の話に広げすぎていない
- [ ] AIを使った場合、SQLを実行結果または手元の設計材料で検証している

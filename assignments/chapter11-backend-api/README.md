# 第11章 バックエンドAPI ワークブック

このワークブックは、第11章の演習「ユースケースからAPIエンドポイントを設計する」「リクエストとレスポンスを書く」「入力検証と認可を設計する」「ハンドラーの処理の流れを書く」「curlでAPI確認ログを書く」で使う。

## 使い方

この資料と、第9章で作成した `use-case.md`、`acceptance-criteria.md`、第10章で作成した `data-model.md`、`constraint-checklist.md`、`sql-check-log.md` を読み、`api-contract.md`、`validation-and-authorization.md`、`api-flow.md`、`api-check-log.md` を書く。

目的は、特定フレームワークの書き方を暗記することではない。ユースケース、DB設計、権限、入力、エラーをつなげて、APIとして何を約束するかを明確にすることである。

## 前提

研修用学習ログアプリに、次の機能を追加する。

```txt
メンターが、担当受講者に支援ステータスを付けられるようにしたい。
```

第9章、第10章で整理した前提:

- メンターは、担当受講者だけを支援できる。
- 支援ステータスは、メンターが手動で変更する。
- 支援ステータスには `none`、`needs_support`、`in_progress`、`resolved` がある。
- 支援メモは任意である。
- 受講者、メンター、担当関係、支援ステータスはDBに保存される。
- 初回リリースでは、自動アラート、分析ダッシュボード、CSV出力は作らない。

この章では、HTTP JSON APIを前提にする。フレームワーク固有の実装は扱わない。

## 演習1: ユースケースからAPIエンドポイントを設計する

### 考えること

第9章のユースケースを読み、必要なAPIを設計する。

問い:

- メンターはどの情報を取得する必要があるか。
- 支援ステータスを変更するには、どの対象を指定する必要があるか。
- 支援ステータスで一覧を絞り込む必要があるか。
- endpointがテーブル名そのままになっていないか。
- APIごとに、誰が呼べるかを説明できるか。

### 記録すること

`api-contract.md` は次の形で書く。

````md
# API契約

## API 1: 担当受講者一覧を取得する

エンドポイント:

```txt
GET /api/mentor/learners
```

目的:

- ログイン中のメンターが、自分の担当受講者と支援ステータスを確認する。

クエリパラメータ:

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| supportStatus | いいえ | 支援ステータスで絞り込む |

権限:

- ログインしているメンターだけが呼べる。
- 自分の担当受講者だけが返る。

成功レスポンス:

```json
{
  "learners": [
    {
      "learnerId": 1,
      "name": "Learner A",
      "supportStatus": "needs_support",
      "supportNote": "学習ログの提出が遅れている",
      "updatedAt": "2026-05-17T10:00:00+09:00"
    }
  ]
}
```

## API 2: 支援ステータスを更新する

エンドポイント:

```txt
PATCH /api/mentor/learners/{learnerId}/support-status
```

目的:

- ログイン中のメンターが、担当受講者の支援ステータスを変更する。

パスパラメータ:

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| learnerId | はい | 支援ステータスを変更する受講者ID |

リクエスト本文:

```json
{
  "status": "needs_support",
  "note": "学習ログの提出が遅れている"
}
```

成功レスポンス:

```json
{
  "learnerId": 1,
  "supportStatus": "needs_support",
  "supportNote": "学習ログの提出が遅れている",
  "updatedAt": "2026-05-17T10:00:00+09:00"
}
```

エラーレスポンス:

| ステータス | コード | 条件 |
| --- | --- | --- |
| 400 | INVALID_REQUEST | requestの形が不正 |
| 401 | UNAUTHENTICATED | ログインしていない |
| 403 | FORBIDDEN | 担当外の受講者を変更しようとした |
| 404 | LEARNER_NOT_FOUND | 受講者が存在しない |
| 422 | INVALID_SUPPORT_STATUS | 支援ステータスの値が不正 |
````

## 演習2: リクエストとレスポンスを書く

### 考えること

APIごとに、リクエストとレスポンスを具体化する。

問い:

- path paramsで指定するものは何か。
- query paramsで指定するものは何か。
- リクエスト本文に入れるものは何か。
- レスポンス本文は、画面がそのまま使いやすい形か。
- DBの内部構造を出しすぎていないか。
- エラー時に、呼び出し元が次に何を判断できるか。

### 記録すること

`api-contract.md` の各APIに、次を追記する。

```md
## リクエスト

- path params:
- query params:
- headers:
- body:

## レスポンス

- status:
- body:

## エラー

- status:
- code:
- message:
- fields:
```

## 演習3: 入力検証と認可を設計する

### 考えること

APIの境界で何を検証するか、業務ルールとして何を確認するかを分ける。

問い:

- `learnerId` は有効な形式か。
- `status` は許可された値か。
- `note` は任意か。長さ制限は必要か。
- ログイン中のユーザーはメンターか。
- 対象受講者は、そのメンターの担当か。
- リクエスト本文に `mentorId` が入っていた場合、信用してよいか。
- DB制約違反が起きた場合、どのエラーレスポンスに変換するか。

### 記録すること

`validation-and-authorization.md` は次の形で書く。

```md
# 入力検証と認可

## 入力検証

| 対象 | ルール | エラーステータス | エラーコード |
| --- | --- | --- | --- |
| learnerId |    |    |    |
| status |    |    |    |
| note |    |    |    |

## 認証

- 

## 認可

- 

## DB制約に任せること

- 

## API側で事前に確認すること

- 

## 判断が必要なこと

- 
```

## 演習4: ハンドラーの処理の流れを書く

### 考えること

HTTP リクエストを受けてからレスポンスを返すまでの流れを分ける。

考える順序:

1. routeがrequestを受ける。
2. handlerがpath params、query params、bodyを読む。
3. 入力検証を行う。
4. 現在のユーザーを取得する。
5. use caseで業務ルールと認可を確認する。
6. repositoryでDBを読み書きする。
7. 必要ならトランザクションでまとめる。
8. 結果をresponseに変換する。
9. エラーをステータスコードとエラーレスポンスに変換する。

### 記録すること

`api-flow.md` は次の形で書く。

````md
# API処理フロー

## PATCH /api/mentor/learners/{learnerId}/support-status

```txt
route
  -> handler
    -> validate path params
    -> validate リクエスト本文
    -> get current user
    -> use case
      -> check mentor role
      -> check mentor assignment
      -> update support status
    -> リポジトリ
      -> read assignment
      -> update learner_support_statuses
    -> レスポンス
```

## 正常系

1. 
2. 
3. 

## エラーが起きる場所

| 場所 | エラー | ステータス | レスポンスコード |
| --- | --- | --- | --- |
| 入力検証 |    |    |    |
| 認証 |    |    |    |
| 認可 |    |    |    |
| DB |    |    |    |

## トランザクションが必要になる場合

- 
````

## 演習5: curlでAPI確認ログを書く

### 考えること

APIをHTTP リクエスト/レスポンスとして確認する。

確認すること:

- 正常系の一覧取得
- 正常系の支援ステータス更新
- 入力不正
- 未ログイン
- 権限なし
- 対象なし

### 記録すること

`api-check-log.md` は次の形で書く。

````md
# API確認ログ

## 確認1: 担当受講者一覧

目的:

- 

コマンド:

```txt
curl -i \
  -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/mentor/learners?supportStatus=needs_support"
```

期待:

- status:
- レスポンス:

結果:

- 

## 確認2: 支援ステータス更新

コマンド:

```txt
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"needs_support","note":"学習ログの提出が遅れている"}' \
  "http://localhost:3000/api/mentor/learners/1/support-status"
```

期待:

- status:
- レスポンス:
- DB:

結果:

- 

## 確認3: 入力不正

コマンド:

```txt
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"unknown"}' \
  "http://localhost:3000/api/mentor/learners/1/support-status"
```

期待:

- status:
- レスポンス:

結果:

- 

## 確認4: 権限なし

確認したこと:

- 

結果:

- 

## 気づいたこと

- 
````

## AIを使う場合

AIに頼んでよいこと:

- endpoint案
- リクエスト/レスポンス案
- ステータスコード案
- エラーレスポンス案
- 入力検証項目の洗い出し
- `curl` 例
- ハンドラーの処理順の整理

AIに任せたままにしてはいけないこと:

- 認証方式や権限ルールの確定
- リクエスト本文の `mentorId` を信用してよいかの判断
- 第10章のDB設計との整合確認
- セキュリティ上の詳細判断
- 動かしていないAPIを確認済みとして扱うこと

AIへの依頼例:

```txt
研修用学習ログアプリに、メンターが担当受講者へ支援ステータスを付けられるAPIを作ります。

第9章、第10章で決めたこと:
- メンターは担当受講者だけを支援できる
- 支援ステータスは none, needs_support, in_progress, resolved
- 支援メモは任意
- 受講者、メンター、担当関係、支援ステータスはRDBに保存される

目的:
HTTP JSON APIの契約、入力検証、認可、エラーレスポンス、curl確認例を作りたいです。

制約:
- 特定フレームワークの書き方には寄せすぎない
- 認証認可の詳細実装は深掘りしない
- ただし、現在ユーザーと担当受講者チェックは必ず入れる
- テストコードは第13章で扱うので、この章ではcurl確認に留める

出してほしいこと:
- endpoint案
- リクエスト/レスポンス例
- エラーレスポンス例
- ハンドラーの処理順
- curl確認例
- 判断が必要な点
```

## チェックリスト

提出前に確認する。

- [ ] `api-contract.md` にエンドポイント、メソッド、目的がある
- [ ] リクエストとレスポンスのJSON例がある
- [ ] endpointがテーブル名そのままのCRUDになりすぎていない
- [ ] `validation-and-authorization.md` に入力検証と認可が分かれている
- [ ] リクエスト本文の `mentorId` を信用しない方針になっている
- [ ] `api-flow.md` にroute、ハンドラー、ユースケース、リポジトリ、DBの流れがある
- [ ] エラーレスポンスのステータスコードとエラーコードがある
- [ ] `api-check-log.md` に正常系と異常系の確認がある
- [ ] テストコード、認証基盤、攻撃対策の詳細に入りすぎていない
- [ ] AIを使った場合、API契約、権限、DB設計、確認結果と照合している

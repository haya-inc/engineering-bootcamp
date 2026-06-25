# 第12章 フロントエンドとアクセシビリティ ワークブック

このワークブックは、第12章の演習「API契約から画面要件を書く」「画面状態を設計する」「画面構造とアクセシビリティ方針を書く」「フロントエンド実装方針を書く」「ブラウザとアクセシビリティの確認ログを書く」で使う。

## 使い方

この資料と、第9章で作成した `use-case.md`、第11章で作成した `api-contract.md`、`api-check-log.md` を読み、`screen-requirements.md`、`ui-state-model.md`、`screen-structure.md`、`frontend-implementation-note.md`、`frontend-check-log.md` を書く。

目的は、見た目だけを整えた画面を作ることではない。API契約を利用者が操作できる画面に変換し、状態、フォーム、エラー、キーボード操作、ラベル、ブラウザ確認まで含めて説明できるようにすることである。

## 前提

研修用学習ログアプリに、次の画面を追加する。

```txt
メンターが、担当受講者の支援ステータスを一覧で確認し、必要に応じて変更できる画面。
```

第11章で設計したAPI:

- `GET /api/mentor/learners`
- `GET /api/mentor/learners?supportStatus=needs_support`
- `PATCH /api/mentor/learners/{learnerId}/support-status`

支援ステータス:

- `none`: 支援不要
- `needs_support`: 要支援
- `in_progress`: 支援中
- `resolved`: 解決済み

この章では、特定フロントエンドフレームワークの細かい書き方には寄せすぎない。画面要件、状態、HTML構造、API接続、確認観点を整理する。

## 演習1: API契約から画面要件を書く

### 考えること

第11章の `api-contract.md` を読み、画面で表示する情報、置く操作、扱う状態を整理する。

問い:

- メンターは最初に何を見たいか。
- 一覧に表示する項目は何か。
- 支援ステータスの絞り込みは必要か。
- 支援ステータス変更は、一覧内で行うか、詳細画面で行うか。
- 保存中や保存失敗をどう伝えるか。
- データが0件の場合、何を表示するか。

### 記録すること

`screen-requirements.md` は次の形で書く。

```md
# 画面要件

## 画面名

- 担当受講者の支援状況

## 利用者

- 

## 目的

- 

## 表示する情報

| 情報 | 表示する理由 | APIフィールド |
| --- | --- | --- |
| 受講者名 |    | name |
| 支援ステータス |    | supportStatus |
| 支援メモ |    | supportNote |
| 更新日時 |    | updatedAt |

## 操作

- 

## 画面状態

- loading:
- empty:
- error:
- saving:
- saved:

## 今回対象外

- 

## 迷っていること

- 
```

## 演習2: 画面状態を設計する

### 考えること

画面が取りうる状態を整理する。

状態候補:

- 初回読み込み中
- 一覧取得成功
- 担当受講者が0件
- 絞り込み結果が0件
- 一覧取得失敗
- フォーム編集中
- 保存中
- 保存成功
- 保存失敗

### 記録すること

`ui-state-model.md` は次の形で書く。

```md
# UI状態モデル

## 一覧の状態

| 状態 | 画面に表示すること | 操作できること |
| --- | --- | --- |
| loading |    |    |
| loaded |    |    |
| empty |    |    |
| filtered-empty |    |    |
| load-error |    |    |

## 更新フォームの状態

| 状態 | 画面に表示すること | 操作できること |
| --- | --- | --- |
| idle |    |    |
| editing |    |    |
| saving |    |    |
| saved |    |    |
| save-error |    |    |

## エラー表示

| エラー | 利用者に見せる文言 | 次にできること |
| --- | --- | --- |
| INVALID_SUPPORT_STATUS |    |    |
| FORBIDDEN |    |    |
| NETWORK_ERROR |    |    |
```

## 演習3: 画面構造とアクセシビリティ方針を書く

### 考えること

HTMLの意味、フォーム、ラベル、エラー表示、キーボード操作を実装前に整理する。

問い:

- ページの主見出しは何か。
- 一覧は `table` がよいか、リストがよいか。
- 入力欄にはどのラベルを付けるか。
- 保存ボタンの文言は操作内容を表しているか。
- エラーはどこに表示するか。
- Tabキーで自然な順番に移動できるか。
- 色だけで状態を伝えていないか。

### 記録すること

`screen-structure.md` は次の形で書く。

````md
# 画面構造

## 見出し構造

- h1:
- h2:

## 一覧

形式:

- table / list / other:

理由:

- 

表示項目:

- 

## フォーム

| 入力 | ラベル | 説明 | エラー |
| --- | --- | --- | --- |
| supportStatus |    |    |    |
| supportNote |    |    |    |

## ボタン

| ボタン | 文言 | 有効条件 | 無効条件 |
| --- | --- | --- | --- |
| save |    |    |    |

## エラー表示

- 

## キーボード操作

- 

## 色だけに依存しないための工夫

- 

## HTMLのたたき台

```html
<section aria-labelledby="support-heading">
  <h1 id="support-heading">担当受講者の支援状況</h1>

  <label for="support-filter">支援ステータスで絞り込む</label>
  <select id="support-filter" name="supportStatus">
    <option value="">すべて</option>
    <option value="needs_support">要支援</option>
    <option value="in_progress">支援中</option>
    <option value="resolved">解決済み</option>
  </select>
</section>
```
````

## 演習4: フロントエンド実装方針を書く

### 考えること

API接続、データ変換、コンポーネント分割、フォーム送信、エラー処理の方針を書く。

問い:

- APIレスポンスをどの画面状態に変換するか。
- `supportStatus` の値をどの表示名に変換するか。
- データ取得、一覧表示、フォーム、エラー表示をどう分けるか。
- 保存中に二重送信を防ぐか。
- API エラーレスポンスを利用者向け文言にどう変換するか。
- AIを使う場合、何を検証するか。

### 記録すること

`frontend-implementation-note.md` は次の形で書く。

```md
# フロントエンド実装メモ

## API接続

- 一覧取得:
- 支援ステータス更新:

## データ変換

| API値 | UIラベル | UI説明 |
| --- | --- | --- |
| none | 支援不要 |    |
| needs_support | 要支援 |    |
| in_progress | 支援中 |    |
| resolved | 解決済み |    |

## コンポーネント分割

| コンポーネント | 責務 |
| --- | --- |
| LearnerSupportPage |    |
| SupportStatusFilter |    |
| LearnerSupportTable |    |
| SupportStatusForm |    |
| ErrorMessage |    |

## 保存処理

1. 
2. 
3. 

## エラー処理

- 

## AIを使う場合の検証

- 
```

## 演習5: ブラウザとアクセシビリティの確認ログを書く

### 考えること

画面を目視だけでなく、ブラウザとアクセシビリティ観点で確認する。

確認すること:

- 一覧が表示されるか。
- 絞り込みが動くか。
- 支援ステータスを更新できるか。
- 保存中、保存成功、保存失敗が分かるか。
- NetworkでAPI リクエストとレスポンスを確認できるか。
- Console errorがないか。
- Tabキーだけで操作できるか。
- 入力欄にラベルがあるか。
- エラーがテキストで分かるか。
- 色だけで状態を伝えていないか。

### 記録すること

`frontend-check-log.md` は次の形で書く。

```md
# フロントエンド確認ログ

## 画面表示

- URL:
- 確認結果:

## API接続

| 操作 | リクエスト | ステータス | レスポンス確認 |
| --- | --- | --- | --- |
| 一覧取得 |    |    |    |
| 支援ステータス更新 |    |    |    |

## コンソール

- エラー:
- 警告:

## キーボード操作

| 操作 | 結果 |
| --- | --- |
| Tabで移動 |    |
| EnterまたはSpaceで操作 |    |
| 保存後のフォーカス |    |

## ラベルとエラー表示

- 入力欄のラベル:
- エラー文言:
- エラーと入力欄の関係:

## 色だけに依存していないか

- 

## 画面幅

- desktop:
- mobile:

## 見直すこと

- 
```

## AIを使う場合

AIに頼んでよいこと:

- 画面構成案
- 画面状態の洗い出し
- コンポーネント分割案
- フォーム実装案
- エラー表示案
- アクセシビリティ確認観点
- ブラウザ確認手順

AIに任せたままにしてはいけないこと:

- API契約との整合確認
- 既存デザインやUI規約との整合確認
- HTML要素の意味の確認
- ラベル、キーボード操作、フォーカス、エラー表示の確認
- Console errorやNetwork failureの確認

AIへの依頼例:

```txt
第11章のAPI契約をもとに、担当受講者の支援ステータス画面を作ります。

API:
- GET /api/mentor/learners
- PATCH /api/mentor/learners/{learnerId}/support-status

要件:
- 担当受講者一覧を表示する
- 支援ステータスで絞り込める
- 支援ステータスと支援メモを更新できる
- loading, empty, error, saving, saved を扱う
- ラベル、キーボード操作、エラー表示、フォーカスを確認する

出してほしいこと:
- 画面要件
- UI状態
- HTML構造
- コンポーネント分割
- 確認ログの観点
- 判断が必要な点
```

## チェックリスト

提出前に確認する。

- [ ] `screen-requirements.md` に表示、操作、状態、エラーがある
- [ ] `ui-state-model.md` にloading、empty、success、error、saving、savedがある
- [ ] `screen-structure.md` に見出し、一覧、フォーム、ラベル、エラー表示がある
- [ ] キーボード操作とフォーカスの確認観点がある
- [ ] `frontend-implementation-note.md` にAPI接続、データ変換、コンポーネント分割、保存処理がある
- [ ] `frontend-check-log.md` に画面表示、Network、Console、キーボード操作、ラベル、エラー表示がある
- [ ] 色だけで状態を伝えていない
- [ ] フロントエンドテストやアクセシビリティ規格の詳細に入りすぎていない
- [ ] AIを使った場合、API契約、ブラウザ確認、アクセシビリティ観点と照合している

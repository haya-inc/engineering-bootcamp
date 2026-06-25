# 第7章 Web ワークブック

このワークブックは、第7章の演習「URLを分解する」「ブラウザのNetworkタブで通信を見る」「curlでHTTPレスポンスを見る」「Cookieとセッションの動きを観察する」「Web通信エラーを分類する」で使う。

## 使い方

この資料を読み、`url-analysis.md`、`http-observation-log.md`、`curl-observation-log.md`、`cookie-session-note.md`、`web-troubleshooting-note.md` を書く。

目的は、HTTP用語を暗記することではない。ブラウザで何が起き、どのリクエストがどのレスポンスを返し、どこで失敗しているのかを観察できるようにすることである。

## 前提

このリポジトリの `starter-apps/learning-log-sample` を使う。プロジェクト名は `learning-log-sample` である。

第5章でローカル開発サーバーを起動した状態を前提にする。

例:

```txt
http://localhost:3000
```

題材:

> メンター向け進捗一覧画面を開き、ブラウザと `curl` でHTTP通信を観察する。

## 安全ルール

HTTPログには秘密情報が含まれることがある。提出物やAI入力に、そのまま貼らない。

伏せるもの:

- Cookie
- Authorization header
- API token
- session id
- 個人情報
- 未公開の本番URL
- 顧客名やユーザー名

伏せ方の例:

```txt
Cookie: [REDACTED]
Authorization: Bearer [REDACTED]
```

## 演習1: URLを分解する

### 対象URL

次のURLを分解する。

```txt
http://localhost:3000/mentors/progress?filter=unsubmitted#list
```

追加で、サンプルアプリを起動したときに自分のブラウザで表示されるURLも分解する。

### 記録すること

`url-analysis.md` は次の形で書く。

```md
# URL分析

## 対象URL


## 分解

| パート | 値 | 意味 |
| --- | --- | --- |
| スキーム |    |    |
| ホスト |    |    |
| ポート |    |    |
| パス |    |    |
| クエリ |    |    |
| フラグメント |    |    |

## このURLが指しているもの


## 分からなかったこと

- 
```

## 演習2: ブラウザのNetworkタブで通信を見る

### 実行すること

1. 第5章の手順でサンプルアプリを起動する。
2. ブラウザで開発者ツールを開く。
3. Networkタブを開く。
4. 進捗一覧画面を再読み込みする。
5. HTML、JavaScript、APIらしいリクエストを1つずつ選ぶ。
6. リクエストURL、メソッド、ステータス、レスポンス概要を記録する。

### 見るもの

- リクエストURL
- メソッド
- ステータスコード
- リクエストヘッダー
- レスポンスヘッダー
- レスポンス本文
- タイミング

### 記録すること

`http-observation-log.md` は次の形で書く。

````md
# HTTP観察ログ

## 観察した画面


## 表示したURL


## 観察したリクエスト

| 種類 | リクエストURL | メソッド | ステータス | メモ |
| --- | --- | --- | --- | --- |
| HTML |    |    |    |    |
| JavaScript |    |    |    |    |
| API |    |    |    |    |

## APIレスポンスの概要

```txt

```

## 気づいたこと

- 

## 相談するなら伝えること

- 
````

## 演習3: `curl` でHTTPレスポンスを見る

### 実行すること

ブラウザで確認したURLやAPIに対して、`curl -i` を実行する。

例:

```txt
curl -i http://localhost:3000
curl -i http://localhost:3000/api/mentor/learners
```

サンプルアプリの実際のURLに合わせて変更してよい。

### 記録すること

`curl-observation-log.md` は次の形で書く。

````md
# curl観察ログ

## 実行したコマンド

```txt

```

## ステータスコード


## レスポンスヘッダー

```txt

```

## レスポンス本文の概要


## ブラウザで見た結果との違い


## 次に確認したいこと

- 
````

## 演習4: Cookieとセッションの動きを観察する

### 実行すること

サンプルアプリにログインまたは疑似ログインの機能がある場合、ログイン前後のCookieやリクエストヘッダーを観察する。

ログイン機能がない場合は、講師が用意するCookie確認用の画面やAPIを使う。

見るもの:

- Cookieがセットされるタイミング
- 次のリクエストにCookieが付くか
- Cookie名
- `HttpOnly`、`Secure`、`SameSite` などの属性が見えるか
- Cookieに秘密情報らしい値が直接入っていないか

値は提出物に貼らない。必要な場合は `[REDACTED]` と書く。

### 記録すること

`cookie-session-note.md` は次の形で書く。

```md
# Cookieとセッションメモ

## 観察した画面、API


## ログイン前後で変わったこと


## Cookie名

- 

## 値を伏せた記録

- Cookie: [REDACTED]

## Cookieやセッションが何に使われていそうか


## 貼ってはいけない情報

- 
```

## 演習5: Web通信エラーを分類する

次のエラー例を読み、どの段階の問題かを分類する。

### エラーA: ホスト名が解決できない

```txt
curl: (6) Could not resolve host: localhsot
```

書くこと:

- どの段階で失敗していそうか。
- URLのどこを確認するか。
- 次に試すこと。

### エラーB: 接続できない

```txt
curl: (7) Failed to connect to localhost port 3000
```

書くこと:

- どの段階で失敗していそうか。
- 開発サーバーが起動しているかどう確認するか。
- portが違う可能性をどう見るか。

### エラーC: 404

```txt
HTTP/1.1 404 Not Found
```

書くこと:

- サーバーには届いていそうか。
- pathが間違っていないかどう見るか。
- APIや画面のルーティングをどう確認するか。

### エラーD: 500

```txt
HTTP/1.1 500 Internal Server Error
```

書くこと:

- サーバー内で何か失敗していそうか。
- サーバーログを見る必要があるか。
- 第5章の `local-run-log.md` に何を追記するか。

### エラーE: CORS

```txt
Access to fetch at 'http://localhost:4000/api/mentor/learners' from origin 'http://localhost:3000' has been blocked by CORS policy.
```

書くこと:

- ブラウザが止めている問題か。
- API自体は `curl` で返る可能性があるか。
- 深掘りはどの章へ送るか。

### 記録すること

`web-troubleshooting-note.md` は次の形で書く。

```md
# Webトラブルシュートメモ

## 対象エラー


## 分類

DNS / 接続 / HTTP ステータスコード / ブラウザ制約 / サーバー例外 / その他

## 観察した情報

- URL:
- Method:
- Status:
- Response:
- Browser console:
- Server log:

## 次に確認すること

- 
- 

## 相談する場合に伝えること

- 
```

## AIを使う場合

AIに頼んでよいこと:

- HTTPログの要約
- エラー分類
- 次に見るべき観点の整理
- `curl` コマンドの読み方の説明
- ステータスコードの意味の確認

AIに渡す前に伏せること:

- Cookie
- Authorization header
- session id
- token
- 個人情報
- 本番URLや未公開URL

AIへの依頼例:

```txt
研修用サンプルアプリのHTTP通信を確認しています。

目的:
進捗一覧が表示されない原因候補を整理したいです。

観察結果:
- URL: http://localhost:3000/mentors/progress
- GET /mentors/progress は 200
- GET /api/mentor/learners は 500
- CookieとAuthorization headerは伏せています

出してほしいこと:
- どの段階で失敗していそうか
- 次に見るべきログ
- 追加で確認すべきHTTP情報

不確かなことは断定しないでください。
```

## チェックリスト

提出前に確認する。

- [ ] `url-analysis.md` にURLの分解がある
- [ ] `http-observation-log.md` にNetworkタブで見たリクエストURL、メソッド、ステータスがある
- [ ] `curl-observation-log.md` にステータスコード、ヘッダー、本文概要がある
- [ ] `cookie-session-note.md` にCookieやセッションが何に使われていそうかがある
- [ ] `web-troubleshooting-note.md` にエラー分類と次に確認することがある
- [ ] Cookie、token、個人情報を提出物に含めていない
- [ ] AIを使った場合、秘密情報を伏せ、出力を実際の通信で確認した

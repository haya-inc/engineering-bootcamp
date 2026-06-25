---
title: "第7章 Webの通信を観察する"
part: 2
partLabel: "Part 2 開発の基本動作"
order: 7
---

第5章では、ローカル開発サーバーを起動し、URL、ポート、ログを記録した。
第6章では、確認結果をPull Requestでチームに渡す流れを学んだ。
第7章では、その確認結果の中身を、Web通信として観察する。

ブラウザで画面を開くと、利用者には一つの画面が見える。
しかし開発者は、その画面がどのURLから始まり、どのrequestでサーバーへ依頼し、どのresponseで返ってきたのかを見る必要がある。
画面に表示された結果だけを見ていると、問題が画面側にあるのか、API側にあるのか、ログイン状態にあるのか、サーバー内部にあるのかを切り分けにくい。

この章で学ぶのは、Web通信の細部をすべて暗記することではない。
URLを分け、Networkタブで通信を見て、curlでブラウザを通さず確認し、Cookieとセッションの有無を考え、エラーを段階で分類する順番である。

### この章でできるようになること

この章のゴールは、HTTP用語をたくさん暗記することではない。
画面で起きたことを、URL、request、response、Cookie、エラーの段階に分けて説明できるようになることである。

- URLをscheme、host、port、path、query、fragmentに分けて読める。
- 一画面の表示が、HTML、CSS、JavaScript、APIなど複数のrequestでできていることを説明できる。
- Networkタブで、request URL、method、status、headers、response body、timingを確認できる。
- `curl -i` で、ブラウザを通さないresponseのstatus、headers、body概要を読める。
- ブラウザとcurlで結果が違うとき、Cookie、headers、ログイン状態、ブラウザ制約の違いを疑える。
- CookieやAuthorization headerなど、提出物やAI入力へ貼ってはいけない値を伏せられる。
- DNS、接続、HTTP status、ブラウザ制約、サーバー例外のどこで失敗していそうかを分類できる。

### Webは、ブラウザとサーバーの往復で動く

Webアプリケーションは、ブラウザとサーバーの往復で動く。
ブラウザは利用者の操作を受け取り、サーバーへ依頼を送る。
サーバーは依頼を処理し、結果を返す。

HTTPは HyperText Transfer Protocol の略で、Webで情報をやり取りするための約束ごとである。
日常語で言えば、ブラウザからサーバーへの注文票と、サーバーからブラウザへの返事の形式である。
ブラウザからサーバーへ送る依頼をHTTP requestと呼ぶ。
サーバーからブラウザへ返る結果をHTTP responseと呼ぶ。

HTTPでは、基本的に一つのrequestに一つのresponseが返る。
ブラウザは必要に応じて、その往復を何度も行う。
サーバーは前のrequestを自動で覚えているわけではないため、ログイン状態などを保つにはCookieやセッションのような仕組みが使われる。

一つの画面表示でも、通信は一回で終わらないことが多い。
最初にHTMLを取りに行き、続いてCSS、JavaScript、画像、APIのデータを取りに行くことがある。
APIは、画面やプログラムがサーバーの機能やデータを使う入口である。

たとえば進捗一覧画面を開いたとする。
画面の枠組みは表示されているのに一覧だけ出ないなら、HTMLは返っているが、一覧データを取得するAPIが失敗している可能性がある。
このように、画面を通信の集まりとして見ると、問題の位置を絞れる。

### URLは、接続先、対象、条件に分けて読む

URLは Uniform Resource Locator の略で、Web上の対象を指す入口である。
住所のように見えるが、開発者はもう少し分けて読む。

例として、次のURLを考える。

`http://localhost:3000/mentors/progress?filter=unsubmitted#list`

`http` はschemeで、通信方法を示す。
`localhost` はhostで、接続先の名前である。
`3000` はportで、同じPCの中でどの入口へ行くかを示す番号である。
`/mentors/progress` はpathで、サーバー上の対象を示す。
`filter=unsubmitted` はqueryで、表示条件や検索条件のような追加条件を示す。
`#list` はfragmentで、ブラウザ内の位置を示す。

表にすると、次のようになる。

| パート | 値 | 見ること |
| --- | --- | --- |
| scheme | `http` | 暗号化されたHTTPSか、ローカル用のHTTPか |
| host | `localhost` | どの接続先へ行くか |
| port | `3000` | その接続先のどの入口へ行くか |
| path | `/mentors/progress` | サーバー上のどの画面やAPIを指すか |
| query | `filter=unsubmitted` | 絞り込みや検索など、追加条件は何か |
| fragment | `#list` | ページ内の位置やブラウザ側の状態を示していそうか |

fragmentは、通常HTTP requestとしてサーバーへ送られない。
たとえば `#list` を変えてもサーバーログに違いが出ないことがある。
一方でqueryはサーバーへ送られるため、検索語やtokenのような秘密情報をqueryへ入れるとログに残る可能性がある。

最初から英語名を全部暗記する必要はない。
接続先、対象、条件に分けて説明できればよい。
どこにつなぐのか、何を見に行くのか、どんな条件を付けているのかが分かると、問題が起きたときに確認する場所が決まる。

`localhost` は、自分のPCを指す特別な名前である。
第5章で見た `http://localhost:3000` は、自分のPCの3000番ポートで動いている開発サーバーを見に行く、という意味になる。
アクセスできないときは、サーバーが起動しているか、URLのportが合っているかを分けて見る。

originは、scheme、host、portの組み合わせである。
`http://localhost:3000` と `http://localhost:4000` は、hostが同じでもportが違うため別originである。
CORSの切り分けでは、このoriginの違いを見る。

DNSは Domain Name System の略で、`example.com` のような名前から接続先を探す仕組みである。
DNSの運用をこの章で深く扱う必要はない。
まず、名前から接続先を見つけられない失敗と、サーバーにつながった後の失敗を分けて考えられればよい。

### requestは、何をどう依頼したかを見る

HTTP requestは、ブラウザやcurlからサーバーへ送る依頼である。
requestを見るときは、method、path、headers、bodyを分ける。

methodは、サーバーに何をしたいかを示す言葉である。
GETは取得、POSTは作成や送信、PUTやPATCHは更新、DELETEは削除で使われることが多い。
ただし、実際の意味はアプリの設計にも依存する。
まずは、一覧を見ているのにPOSTが出ていないか、保存ボタンを押したのにGETだけで終わっていないか、操作とmethodの関係を見る。

よく見るmethodは、次のように読む。

| method | よくある用途 | 観察するときの注意 |
| --- | --- | --- |
| GET | 画面、一覧、詳細、検索結果を取得する | 取得のつもりなのにデータが変わっていないか |
| POST | 作成、送信、ログインなどを行う | bodyやContent-Typeが期待どおりか |
| PATCH | 一部の項目を更新する | どのfieldを更新しているか |
| PUT | 対象全体を置き換える | PATCHとの違いをAPI設計で確認する |
| DELETE | 対象を削除する | 誤操作を避ける確認や権限があるか |

HTTPの意味として、GETはデータを取得するための安全な操作として扱われる。
一覧表示や検索結果の取得に使うことが多い。
データを変更する操作がGETで実装されている場合は、意図した設計か確認したほうがよい。

pathは、サーバー上の対象である。
`/api/mentor/learners` なら、メンター向けの受講者一覧に関係するAPIかもしれない。
queryは、条件である。
`filter=unsubmitted` なら、未提出者だけを表示する条件として使われている可能性がある。

headersは、requestに付く追加情報である。
データ形式、認証情報、Cookie、ブラウザの情報などが含まれる。
Authorization headerやCookieには秘密情報が含まれることがあるため、提出物やAI入力へ値をそのまま貼らない。

bodyは、requestの本体である。
POSTやPATCHでは、フォーム入力やJSONがbodyに入ることがある。
GETではbodyを使わず、queryで条件を送ることが多い。

サンプルアプリでは、次のrequestを観察できる。

| 操作 | requestの例 | 見ること |
| --- | --- | --- |
| 進捗一覧を開く | `GET /mentors/progress` | HTMLが返るか |
| 担当受講者一覧を取得する | `GET /api/mentor/learners` | JSONで `learners` が返るか |
| 未提出者で絞り込む | `GET /api/mentor/learners?filter=unsubmitted` | queryが付いているか、結果が条件に合うか |
| 支援ステータスを更新する | `PATCH /api/mentor/learners/:learnerId/support-status` | method、body、`content-type`、`x-mentor-id` を見る |

requestを見る目的は、HTTPの仕様を細かく覚えることではない。
画面操作が、どの依頼としてサーバーに届いているかを確認することである。

### responseは、status codeだけで判断しない

HTTP responseは、サーバーからの返事である。
responseを見るときは、status code、headers、bodyを分ける。

status codeは、サーバーがrequestをどう扱ったかを数字で示す。
全部を暗記する必要はない。
まずは大きな分類で見る。

- **200番台**：成功に近い。
- **300番台**：別の場所へ案内している。
- **400番台**：request、認証、認可、対象指定など、クライアント側に近い問題の可能性がある。
- **500番台**：サーバー側の処理失敗に近い問題の可能性がある。

よく出会う例として、401は未ログイン、403は権限不足、404は対象が見つからない、500はサーバー内部の失敗である。
ただし、数字だけで決めつけてはいけない。
response bodyにエラーメッセージが入っていることがある。
サーバーログに、より詳しい原因が残っていることもある。

よく見るstatus codeは、次のように大きく読む。

| status | よくある意味 | 次に見るもの |
| --- | --- | --- |
| 200 OK | requestを処理し、bodyが返っている | bodyが期待する形か |
| 201 Created | 作成に成功した | 作成されたIDやLocation headerがあるか |
| 204 No Content | 成功したがbodyはない | 画面側が空bodyを想定しているか |
| 301 / 302 | 別URLへ移動させている | 移動先URL、ログイン画面へ飛ばされていないか |
| 304 Not Modified | キャッシュ済みの内容を使える | 最新の内容を見たいなら再読み込み条件を見る |
| 400 Bad Request | requestの形式や値が不正 | query、body、Content-Type、validation error |
| 401 Unauthorized | 未認証、または認証情報がない | ログイン状態、Cookie、Authorization header |
| 403 Forbidden | 認証済みでも権限がない | ユーザーの権限、対象データへのアクセス可否 |
| 404 Not Found | pathや対象が見つからない | URL path、API route、ID |
| 405 Method Not Allowed | pathはありそうだがmethodが違う | GET/POST/PATCHなどの指定 |
| 500 Internal Server Error | サーバー内部の失敗 | response body、サーバーログ、例外箇所 |

400番台は「ブラウザが悪い」という意味ではない。
ブラウザやcurlから送ったrequest、ログイン状態、権限、path、入力値のどこかが、サーバーの期待と合っていない可能性がある、という意味で読む。
500番台も「サーバーコードだけが悪い」と決めつけず、どの入力や状態でサーバーが失敗したのかをログと合わせて見る。

たとえば画面で一覧が表示されず、Networkタブで `GET /api/mentor/learners?filter=unsubmitted` が500を返しているとする。
この時点で、画面全体の問題ではなく、進捗APIのサーバー側処理に近い問題だと考えられる。
次に見るべきものは、APIのresponse body、サーバーログ、該当APIの実装である。

### Networkタブで、一画面の通信を分解する

ブラウザの開発者ツールにあるNetworkタブを使うと、画面表示の裏で発生した通信を見られる。
最初に見るのは、request URL、method、status、responseの概要で十分である。

Networkタブを見るときは、次の順番にすると迷いにくい。

1. Networkタブを開いてから画面を再読み込みする。
2. 一覧から、HTML、JavaScript、APIらしいrequestを一つずつ選ぶ。
3. Headersでrequest URL、method、status、request headers、response headersを見る。
4. PreviewまたはResponseでbodyの概要を見る。
5. Timingで、遅いのか、失敗しているのかを分ける。
6. 必要ならFetch/XHR、Doc、JS、CSSのfilterでrequestを絞る。

開発中にキャッシュの影響を避けたい場合は、Networkタブを開いた状態で再読み込みしたり、ブラウザの開発者ツールにあるDisable cache相当の設定を使ったりする。
ただし、キャッシュも実際のWebの一部である。
「キャッシュを無効にしたら直った」で終えず、何が古いまま残っていたのかを記録する。

進捗一覧画面を再読み込みすると、複数のrequestが並ぶ。
HTMLを取得するrequestがある。
CSSやJavaScriptや画像など、画面用ファイルを取得するrequestがある。
進捗データを取得するAPI requestがあるかもしれない。

一つひとつの通信を、画面の動きと対応させる。
画面の枠組みが出ているなら、HTMLやJavaScriptは返っている可能性がある。
一覧だけ空なら、API responseの中身やstatusを見る。
保存ボタンを押しても反応がないなら、クリック時にrequestが出ているかを見る。

Networkタブの観察結果は、相談やPR本文にそのまま使える。
「画面が出ません」ではなく、「GET /mentors/progress は200、GET /api/mentor/learners?filter=unsubmitted は500、サーバーログには...」と書ければ、相手は見る場所を絞れる。

観察ログは、次のように短くてもよい。

```md
## 操作

`http://localhost:3000/mentors/progress` を開き、未提出者フィルタを選んだ。

## Network

| request | method | status | 見たこと | 判断 |
| --- | --- | --- | --- | --- |
| /mentors/progress | GET | 200 | HTMLは返っている | 画面の入口は動いている |
| /app.js | GET | 200 | 画面用JavaScriptは返っている | 画面処理は読み込まれている |
| /api/mentor/learners?filter=unsubmitted | GET | 200 | responseに提出済み受講者が含まれる | API側のfilter処理を見る |

## まだ分からないこと

画面側が条件を付け間違えているのか、API側が条件を解釈し間違えているのかは、コードを読んで確認する。
```

### curlは、ブラウザを通さずにサーバーへ聞く道具である

curlは、ターミナルからHTTP requestを送る道具である。
ブラウザを通さずに、サーバーがどう返すかを確認できる。

たとえば次のように実行する。

`curl -i "http://localhost:3000/api/mentor/learners?filter=unsubmitted"`

`-i` は、response headersも含めて表示する指定である。
status code、headers、bodyの概要を確認できる。

出力は、すべて貼る必要はない。
相談や提出物では、status code、content-type、bodyの重要な部分だけを抜き出せばよい。

```txt
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{
  "learners": [
    {
      "id": "l-101",
      "submittedAt": "2026-05-17T09:10:00+09:00"
    }
  ]
}
```

未提出者フィルタを指定しているのに `submittedAt` に日時が入った受講者が返っているなら、curlの時点でも期待と違う。
この場合、ブラウザ表示だけの問題ではなく、APIかデータ処理の問題として調査を進められる。

curlを使う目的は、ブラウザ操作を置き換えることではない。
ブラウザを通したときの問題なのか、サーバー単体でも起きる問題なのかを分けることである。

サンプルアプリでは、次のように確認できる。

```txt
curl -i http://localhost:3000
curl -i http://localhost:3000/api/mentor/learners
curl -i "http://localhost:3000/api/mentor/learners?filter=unsubmitted"
```

更新系のrequestを見る場合は、method、headers、bodyを明示する。
これはローカルの研修用アプリに対してだけ行う。
本番や共有環境に対して、意味を理解しないまま更新requestを送らない。

```txt
curl -i -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-mentor-id: m-001" \
  -d '{"status":"needs_support","note":"Updated from curl."}' \
  http://localhost:3000/api/mentor/learners/l-102/support-status
```

shellでは、`?` や `&` を含むURLは引用符で囲むと安全である。
queryつきURLをそのまま貼ってうまく動かないときは、URL全体を `"..."` で囲む。

ブラウザでは成功するのにcurlでは401や403になることがある。
これは、ブラウザがCookieや一部のheadersを自動で付けるのに対し、curlは指定しない限り、それらを持たないからである。
違いが出たら、Cookie、Authorization header、ログイン状態、ブラウザだけの制約を疑う。

### Cookieとセッションは、ログイン状態の手がかりになる

Cookieは、サーバーから受け取ってブラウザが保存し、条件に合うrequestへ添える小さな情報である。
セッションは、ログイン状態など、利用者に関する状態をサーバー側で扱う仕組みである。

ログイン中かどうか、カートに商品が残っているか、ユーザーの状態をどう維持するかは、Cookieやセッションと関係することが多い。
Cookieの値そのものを読めなくても、どのrequestにCookieが付いているかを見るだけで、状態の扱いを観察できる。

Cookieはresponseの `Set-Cookie` headerで保存され、次のrequestでは `Cookie` headerとして送られることが多い。
セッション方式では、Cookieにユーザー情報そのものではなく、サーバー側の状態を探すためのIDが入ることがある。
そのID自体が秘密情報なので、値を貼ってはいけない。

サンプルアプリにログイン機能やCookieがない場合は、「Cookieは観察されなかった」と記録してよい。
観察できないものを、あるものとして書かない。
講師がCookie確認用の画面やAPIを用意している場合は、それを使う。

Cookieには秘密情報が含まれることがある。
提出物、チャット、AI入力へ値をそのまま貼らない。
必要な場合は、次のように伏せる。

`Cookie: [REDACTED]`
`Authorization: Bearer [REDACTED]`

Cookieを見るときは、値よりも、いつセットされたか、次のrequestに付いたか、Cookie名、HttpOnly、Secure、SameSiteのような属性が見えるかを観察する。
これらの属性は、次のように入口だけ押さえる。

| 属性 | 入口としての見方 |
| --- | --- |
| HttpOnly | JavaScriptから値を読み取りにくくする。requestには送られる |
| Secure | HTTPS通信で送ることを前提にする |
| SameSite | 別siteからのrequestにCookieを送る条件に関係する |

この章で細かい設定値を暗記する必要はない。
見つけたらメモし、値を伏せるという姿勢が大切である。

### Web通信の失敗を段階で分類する

画面で失敗しているように見えても、失敗の段階は一つではない。
段階で分けると、次に見る場所が決まる。

host名が解決できない場合は、DNSやURLの入力に近い問題である。
`Could not resolve host: localhsot` のように、`localhost` の綴りを間違えているだけの場合もある。

接続できない場合は、サーバーが起動していない、portが違う、別のプロセスが使っている、といった可能性がある。
`Failed to connect to localhost port 3000` なら、第5章のローカル起動ログへ戻り、サーバーが起動しているか、表示されたportが3000かを確認する。

404は、サーバーには届いているが、指定したpathや対象が見つからない状態に近い。
URLのpath、APIのルーティング、画面から呼んでいるAPI名を見る。

500は、サーバー内部で何かが失敗している状態に近い。
response bodyだけで分からなければ、サーバーログを見る。
第5章の `local-run-log.md` に、操作、request、status、サーバーログを追記する。

CORSは Cross-Origin Resource Sharing の略で、ブラウザが異なるoriginへの通信を安全上制御する仕組みである。
この章では、CORSの詳細設定には踏み込まない。
大切なのは、curlでは返るのにブラウザでは止められることがある、という観察である。
ブラウザが安全上止めている問題なのか、APIそのものが失敗しているのかを分ける。

段階を表にすると、次のように整理できる。

| 段階 | 例 | 次に見るもの |
| --- | --- | --- |
| DNS、名前解決 | `Could not resolve host: localhsot` | host名の綴り、DNS、URL |
| 接続 | `Failed to connect to localhost port 3000` | サーバー起動、port、プロセス |
| HTTP status | 404、405、500などが返る | path、method、response body、サーバーログ |
| ブラウザ制約 | CORS、mixed contentなど | Console、origin、ブラウザでだけ失敗するか |
| サーバー例外 | 500、サーバーログの例外 | 操作、request、stack trace、該当コード |

相談するときは、「どの段階まで届いたか」を書く。
たとえば「curlでは `GET /api/mentor/learners` が200、ブラウザでは `http://localhost:3000` から `http://localhost:4000/api/mentor/learners` へのfetchがCORSで止まる」と書けると、APIそのものの失敗ではなくブラウザ制約を疑いやすい。

### AIにHTTPログを渡すときは、秘密情報を伏せる

AIは、HTTPログの要約、エラー分類、次に見る場所の整理に使える。
しかし、HTTPログには秘密情報が混ざりやすい。

AIに渡す前に、Cookie、Authorization header、session id、token、個人情報、本番URL、未公開URLを伏せる。
伏せたこと自体は記録してよい。
たとえば、次のように書く。

```txt
Cookie: [REDACTED]
Authorization: Bearer [REDACTED]
Set-Cookie: [REDACTED]
https://internal.example.local/path -> [INTERNAL_URL_REDACTED]
```

観察結果:
`GET /mentors/progress` は200。
`GET /api/mentor/learners?filter=unsubmitted` は500。
CookieとAuthorization headerは伏せています。

出してほしいこと:
どの段階で失敗していそうか、次に見るべきログ、追加で確認すべきHTTP情報。

AIの回答は結論ではなく仮説として扱う。
Networkタブ、curl、サーバーログで確認できたことと、AIの推測を分けて書く。

### HTTP観察ログで確認すること

url-analysis.md、http-observation-log.md、curl-observation-log.md、cookie-session-note.md、web-troubleshooting-note.md を作る。

`url-analysis.md` では、対象URLをscheme、host、port、path、query、fragmentに分け、接続先、対象、条件を説明する。
`http-observation-log.md` では、Networkタブで見たHTML、画面用ファイル、APIのrequest URL、method、status、response概要を書く。
`curl-observation-log.md` では、curlで見たstatus code、headers、body概要と、ブラウザで見た結果との違いを書く。
`cookie-session-note.md` では、Cookieがいつセットされ、次のrequestに付くか、Cookie名、値を伏せた記録、Cookieやセッションが何に使われていそうかを書く。
`web-troubleshooting-note.md` では、DNS、接続、HTTP status code、ブラウザ制約、サーバー例外のどれに近い失敗か、次に確認すること、相談する場合に伝えることを書く。

提出前に、Cookie、Authorization header、token、session id、個人情報、本番URL、未公開URLを含めていないか確認する。
HTTP観察は証拠を増やすために行うが、証拠として出してはいけない値もある。

成果物は、第8章の不具合調査で再利用する。
再現手順やPR説明に、画面だけでなくHTTP観察の事実を入れられるようにする。

### Web通信の観察で起きやすい誤解

- 画面に表示された結果だけを見て、どのrequestが失敗したかを確認しない。
- URLを一つの文字列として扱い、接続先、対象、条件に分けない。
- fragmentがサーバーへ送られると思い込み、`#...` の違いをサーバー側で探す。
- queryに秘密情報を入れても安全だと思い込む。
- status codeだけで原因を断定し、response bodyやサーバーログを読まない。
- 200が返っただけで、response bodyの中身まで正しいと判断する。
- ブラウザとcurlの違いを見ず、ログイン状態やCookieの有無を見落とす。
- CookieやAuthorization headerを、提出物やAI入力へそのまま貼る。
- CORSを見た瞬間に設定変更へ進み、curlやサーバーログで切り分けない。

### Web通信を観察する章で持ち帰ること

第7章で身につけるべきことは、Webの問題を画面だけでなくHTTP通信として観察することである。
URLを接続先、対象、条件に分ける。
Networkタブで、どのrequestがどのstatusとresponseを返したかを見る。
curlで、ブラウザを通さないresponseを確認する。
Cookieとセッションを見て、ログイン状態やブラウザとcurlの違いを考える。
失敗したら、DNS、接続、HTTP status、ブラウザ制約、サーバー例外に分ける。

この章を終えた時点で、HTTPのすべてを説明できる必要はない。
画面、操作、失敗したrequest、status、response概要、試したことを説明できればよい。
それだけで、相談とPRの確認結果は大きく具体的になる。

### 既存コードを小さく読む章へ

次章では、この観察方法を使って既存アプリの不具合を再現し、コードの入口を探す。
画面、Network、curl、サーバーログの順で事実を集めると、読むべきコードの範囲を小さくできる。

### 参考資料

- [MDN: Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [MDN: Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

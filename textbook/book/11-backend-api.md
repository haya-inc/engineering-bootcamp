---
title: "第11章 APIで画面と業務をつなぐ"
part: 3
partLabel: "Part 3 Webアプリケーション開発"
order: 11
---

第9章では、支援ステータス機能のユースケース、用語、ルール、受け入れ条件を整理した。
第10章では、それをテーブル、カラム、制約、SQL確認へ変換した。
第11章では、その設計を画面から呼び出せるAPI契約へ変える。

APIは、バックエンドにあるURLの一覧ではない。
画面や他のプログラムが、業務上の操作を安全に依頼するための約束である。
どのURLへ、どのmethodで、何を送り、何が返り、失敗したときにどう分かるのか。
さらに、誰がその操作をしてよいのか、どの入力を受け付けるのか、DBの制約違反をどうエラーへ変換するのか。
これらを先に書くことで、フロントエンド、バックエンド、テスト、レビューが同じ前提で進められる。

この章では、HTTP JSON APIを前提にする。
特定のフレームワークの書き方は扱わない。
支援ステータス機能を題材に、API契約、入力検証、認証、認可、処理の流れ、curl確認ログまでを一つの流れとして扱う。

### この章でできるようになること

この章を読み終えた時点で、次のことを自分の言葉で説明できる状態を目指す。

- 第9章のユースケースと第10章のDB設計から、必要なAPIを選べる。
- endpointを、テーブル名のCRUDではなく、画面と業務上の操作から説明できる。
- `GET`、`POST`、`PATCH`、`PUT`、`DELETE` の基本的な意図を区別できる。
- path params、query params、headers、bodyに何を置くかを理由つきで決められる。
- responseを、DB内部構造ではなく画面が扱いやすい形で設計できる。
- 入力検証、認証、認可、業務ルール、DB制約を分けて書ける。
- 失敗時のstatus code、error code、message、fieldsを契約として決められる。
- handler、use case、repositoryの役割を分けて、処理の流れを説明できる。
- curlで正常系と異常系を確認し、PRやテスト設計に使えるログを残せる。
- AIが出したAPI案を、既存の認証方式、権限ルール、実行結果に照らして検証できる。

### APIは、画面と業務ルールとDBの境界である

画面は、受講者一覧を表示したい。
メンターは、担当受講者の支援ステータスを確認し、必要なら更新したい。
DBには、受講者、メンター、担当関係、支援ステータスが保存されている。

APIは、この三つを直接つなぐだけではない。
画面から来たrequestを受け取り、ログイン中の利用者を確認し、業務ルールを見て、DBを読み書きし、画面が扱いやすいresponseへ変換する。

この境界がないと、画面はDBの内部構造に引きずられる。
たとえば、`learner_support_statuses` というテーブル名や、`updated_by` という保存上の名前を、そのまま画面の都合として公開してしまうかもしれない。
画面が必要としているのは、支援ステータスの現在値、表示用のメモ、更新日時、次に取れる操作である。
DBの形とAPIの形は、関係しているが同じではない。

API設計では、まず次の問いを置く。

- 画面は何を依頼したいのか。
- バックエンドはどの業務ルールを判断するのか。
- DBには何を読みに行き、何を書き込むのか。
- 成功時に、画面は何を受け取れば次の表示へ進めるのか。
- 失敗時に、画面や利用者は何を理解できればよいのか。

第9章と第10章の成果物は、API設計では次の材料になる。

| 既に作った材料 | API設計で使う場所 | 例 |
| --- | --- | --- |
| use-case.md | endpointの目的、誰が呼ぶか | メンターが担当受講者の支援ステータスを見る |
| acceptance-criteria.md | 正常系、異常系、curl確認 | 担当外の受講者は更新できない |
| data-model.md | DBから読む対象、書く対象 | `learners`、担当関係、支援ステータス |
| constraint-checklist.md | 入力検証とDB制約の分担 | `status` の許可値、外部キー、NOT NULL |
| sql-check-log.md | repositoryで必要なSQLの見通し | 担当受講者一覧をJOINして取得する |
| db-change-note.md | 既存データ、エラー、APIへの引き継ぎ | ステータス行がない受講者を `none` とみなすか |

APIは、入力、判断、保存、応答の順に見ると整理しやすい。

| 段階 | 見ること | 支援ステータス機能の例 |
| --- | --- | --- |
| 入力 | どのHTTP requestで依頼されるか | `PATCH /api/mentor/learners/{learnerId}/support-status` |
| 判断 | 誰が何をしてよいか | ログイン中のメンターが対象受講者を担当しているか |
| 保存 | どのDBを読む、書くか | 担当関係を読み、現在の支援ステータスを更新する |
| 応答 | 画面が次に使う値は何か | 更新後の `supportStatus`、`supportNote`、`updatedAt` |

### ユースケースからendpointを決める

endpointは、APIの入口である。
URLの形だけではなく、HTTP methodと組み合わせて、何を依頼できるかを表す。

支援ステータス機能のユースケースから見ると、最初に必要なのは二つである。
一つは、ログイン中のメンターが担当受講者一覧と支援ステータスを取得するAPI。
もう一つは、ログイン中のメンターが担当受講者の支援ステータスを更新するAPIである。

たとえば、次のように設計できる。

```txt
GET /api/mentor/learners
PATCH /api/mentor/learners/{learnerId}/support-status
```

`GET` は取得を表す。
`PATCH` は、既存の対象の一部を更新することを表す。
受講者そのものを作り直すのではなく、受講者に紐づく支援ステータスだけを更新するため、`PATCH` が読みやすい。

ここで避けたいのは、テーブル名をそのままAPIにすることである。
たとえば、`PATCH /api/learner_support_statuses/{id}` のようにすると、DBテーブルの都合は見えるが、誰が何のために更新しているのかが見えにくい。
メンターが自分の担当受講者を扱うという業務ルールが、pathから読み取りにくくなる。

もちろん、すべてのAPIが業務用語だけで書けるわけではない。
しかし初学者は、まずユースケースからendpointを考えるほうがよい。
テーブルに対するCRUD、つまり作成、取得、更新、削除の操作へ急ぎすぎると、認可や業務ルールが後付けになりやすい。

endpointを決めるときは、次の観点で見る。

| 観点 | よい例 | 避けたい例 |
| --- | --- | --- |
| 現在ユーザー | ログイン中のメンターはサーバー側の認証情報から決める | `mentorId` をbodyやqueryで送らせて信用する |
| 対象 | path paramsで更新対象の受講者を示す | bodyだけに対象IDを入れて、URLから対象が読めない |
| 絞り込み | query paramsで `supportStatus` を指定する | 絞り込みごとに別endpointを増やす |
| 保存先 | API名は業務上の操作を表す | テーブル名をそのまま公開し、認可の意味が見えない |
| 対象外 | 自動アラートやCSV出力をendpointに混ぜない | 将来案を初回APIに入れ込む |

`/api/mentor/learners` は、「現在ログインしているメンターから見た受講者一覧」という前提を含んでいる。
別のチームでは、`/api/me/learners` や `/api/mentors/me/learners` のように表すこともある。
どの形が絶対に正しいというより、現在ユーザーをクライアント入力で偽装できないこと、チーム内で命名規則がそろっていることが重要である。

### HTTP methodとstatus codeは、操作の意図と結果を伝える

HTTP methodは、requestで何をしたいかを示す。
よく使うmethodは次のように読める。

- **`GET`**：情報を取得する。
- **`POST`**：新しいものを作る、または処理を依頼する。
- **`PATCH`**：既存のものの一部を更新する。
- **`PUT`**：対象全体を置き換える。
- **`DELETE`**：削除する。

methodには、副作用や再実行の考え方も関係する。

| method | 主な意図 | 注意点 |
| --- | --- | --- |
| `GET` | 取得 | サーバー状態を変更しない前提で設計する。画面表示のたびに更新処理が走るAPIにしない |
| `POST` | 作成、または処理の実行 | 同じrequestを再送すると二重作成や二重実行になることがある |
| `PATCH` | 対象の一部更新 | どの項目をどの値へ変えるかを契約で明確にする |
| `PUT` | 対象全体の置き換え | 送られていない項目を消すのか維持するのかを曖昧にしない |
| `DELETE` | 削除 | 物理削除か、論理削除か、復元できるかを別途決める |

この章の支援ステータス更新は、受講者そのものを置き換えるのではなく、支援ステータスとメモの一部更新である。
そのため `PATCH` が読みやすい。
ただし、チームのAPI規約で `PUT` や `POST` を使う方針があるなら、その規約に合わせ、なぜそのmethodを選んだかを書く。

status codeは、responseで処理結果の種類を示す数字である。
200番台は成功、400番台はrequest、認証、認可、対象指定など呼び出し側に近い問題、500番台はサーバー側で調査すべき問題の手がかりになる。

ただし、status codeだけで十分ではない。
`400` だけ返っても、どの項目がなぜ不正なのか分からない。
`403` だけ返っても、担当外だから拒否されたのか、別の権限が足りないのかが分からない。
だから、API契約ではstatus codeとerror responseをセットで決める。

支援ステータスAPIなら、代表的には次のように整理できる。

| 状況 | status code | error codeの例 | 注意点 |
| --- | --- | --- | --- |
| 正常に一覧を返す | `200 OK` | なし | bodyに `learners` を返す |
| 正常に更新する | `200 OK` | なし | 更新後の値を返す。body不要なら `204 No Content` もあり得る |
| JSONが壊れている、型が違う | `400 Bad Request` | `INVALID_REQUEST` | どこを直すべきかを `fields` に出す |
| ログインしていない | `401 Unauthorized` | `UNAUTHENTICATED` | 名前はUnauthorizedだが、実務上は未認証を表すことが多い |
| ログイン済みだが担当外 | `403 Forbidden` | `FORBIDDEN` | 対象の存在を隠す方針なら `404` に寄せるチームもある |
| 受講者が存在しない | `404 Not Found` | `LEARNER_NOT_FOUND` | 担当外と区別するかは情報開示方針に関わる |
| `status` が許可値ではない | `400` または `422` | `INVALID_SUPPORT_STATUS` | `422` を使うかはチーム方針に合わせる |
| DB接続失敗など想定外 | `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | 内部情報をresponseへ出さず、ログに残す |

`422 Unprocessable Content` は、JSONとしては読めるが業務上受け付けられない入力に使われることがある。
ただし、すべてのチームが `422` を採用しているわけではない。
大切なのは、同じ種類の失敗をチーム内で同じstatus codeとerror codeにそろえることである。

### API契約を書く

API契約は、実装前に呼び出し方と返し方をそろえる文書である。
`api-contract.md` として残す。

担当受講者一覧のAPIは、次のように書ける。

```txt
GET /api/mentor/learners
```

目的:

- ログイン中のメンターが、自分の担当受講者と支援ステータスを確認する。
- 必要なら、支援ステータスで絞り込む。

request:

- **path params**：なし。
- **query params**：`supportStatus`。任意。`none`、`needs_support`、`in_progress`、`resolved` のいずれか。
- **headers**：認証情報。実際の方式はチームの認証方式に従う。
- **body**：なし。

success response:

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

支援ステータス更新のAPIは、次のように書ける。

```txt
PATCH /api/mentor/learners/{learnerId}/support-status
```

目的:

- ログイン中のメンターが、担当受講者の支援ステータスを変更する。

request:

- **path params**：`learnerId`。支援ステータスを変更する受講者ID。
- **query params**：なし。
- **headers**：`Content-Type: application/json` と認証情報。
- **body**：`status` と `note`。

```json
{
  "status": "needs_support",
  "note": "学習ログの提出が遅れている"
}
```

success response:

```json
{
  "learnerId": 1,
  "supportStatus": "needs_support",
  "supportNote": "学習ログの提出が遅れている",
  "updatedAt": "2026-05-17T10:00:00+09:00"
}
```

この段階で、画面担当者はどの値を表示すればよいかを考えられる。
バックエンド担当者は、どのDB値を読み書きし、どの名前で返すかを考えられる。
テスト担当者は、どのrequestとresponseを確認すべきかを考えられる。

API契約では、フィールド名とresponseの包み方をそろえる。
一覧では `learnerId`、更新では `id` のように混ざると、画面側の実装とテストが迷う。
既存APIが `id` を使っているなら `id` に合わせてもよい。
新しく設計するなら、`learnerId` のように意味を明示してもよい。
重要なのは、同じ対象を同じ名前で返し、契約に書いた名前と実装をずらさないことである。

responseの形も選択である。
更新APIの成功時に、本文をそのまま `{ "learnerId": 1, ... }` と返す案もあれば、`{ "learner": { ... } }` のように包む案もある。
どちらもあり得るが、一覧、詳細、更新後responseで一貫しているほうが扱いやすい。
スターターアプリでは簡略化のため、更新APIが `{ "learner": ... }` を返す形になっている。
自分の `api-contract.md` では、実際に採用する形を明記する。

### requestは、場所ごとに意味を分ける

requestは、ひとまとまりの入力に見えるが、場所によって意味が違う。

path params:
URLの一部として対象を指定する。
`/api/mentor/learners/{learnerId}/support-status` の `{learnerId}` は、どの受講者の支援ステータスを更新するかを表す。

query params:
URLの `?` の後ろに置く条件である。
`?supportStatus=needs_support` は、一覧を要支援の受講者に絞り込む条件として使える。

headers:
requestに付く追加情報である。
`Content-Type: application/json` はbodyがJSONであることを示す。
認証情報やCookieもheadersに関係する。

body:
作成や更新で送る本文である。
支援ステータス更新では、`status` と `note` がbodyに入る。

request bodyに入っている値をすべて信用してはいけない。
たとえば、bodyに `mentorId` が入っていたとしても、それを現在のメンターとして使ってはいけない。
利用者はrequestを書き換えられる。
現在のメンターは、ログイン状態、セッション、トークンなど、サーバー側で確認した情報から決める。

場所ごとの使い分けは、次のように考える。

| 場所 | 向いている情報 | 支援ステータスAPIの例 | 注意点 |
| --- | --- | --- | --- |
| path params | 操作対象を特定する値 | `{learnerId}` | 存在確認と認可確認が必要 |
| query params | 一覧の絞り込み、並び順、ページング | `supportStatus=needs_support` | 許可値以外をどう扱うか決める |
| headers | 認証、形式、追跡IDなどのメタ情報 | `Authorization`、`Content-Type` | 実データや更新内容を入れすぎない |
| body | 作成、更新したい内容 | `status`、`note` | サーバー側で検証し、余分な項目を信用しない |

`supportStatus=unknown` のようなquery paramsが来た場合も、契約で扱いを決める。
空の一覧として返すのか、入力エラーとして `400` を返すのかで、画面側のふるまいが変わる。
許可値のある絞り込みでは、入力ミスを早く見つけるために `400` とエラーコードへ変換する方針が分かりやすい。

### responseは、画面が扱いやすい形で設計する

responseは、DBの行をそのまま返すものではない。
画面が次の表示や状態更新に使いやすい形へ整える。

第10章のDBでは、`learner_support_statuses.status`、`note`、`updated_at` のようなカラム名を使った。
API responseでは、画面側の命名に合わせて `supportStatus`、`supportNote`、`updatedAt` のように返してよい。

ただし、画面に必要な値を削りすぎてもいけない。
支援ステータスを更新した直後、画面は新しいstatusだけでなく、更新日時やメモも表示したいかもしれない。
一覧画面で空の状態を区別するなら、未設定を `none` として返すのか、`null` として返すのかも決める必要がある。

response設計では、次を見る。

- 画面がそのまま表示できる名前とまとまりになっているか。
- DBの内部都合を出しすぎていないか。
- 更新後に画面状態を再構築するための値が足りているか。
- `null`、空文字、未設定、初期値の扱いが曖昧でないか。
- 将来の画面で必要になりそうな値を、今回返すべきか、別APIにすべきか。

出しすぎないこともresponse設計である。
DBにあるからといって、すべてを返してよいわけではない。
たとえば、内部メモ、個人情報、権限判定に使う内部ID、デバッグ用の値を画面に返すと、利用者に見せる必要のない情報まで広がる。
支援ステータス機能では、画面が必要とする受講者名、表示対象の学習状況、支援ステータス、支援メモ、更新日時に絞る。

日時は、API契約で形式をそろえる。
たとえば `2026-05-17T10:00:00+09:00` のようなISO 8601形式で返すのか、UTCの `2026-05-17T01:00:00.000Z` で返すのかを決める。
画面で表示するタイムゾーンや表記は第12章で扱うが、APIがどの形式で返すかはこの章で決めておく。

### 入力検証、認証、認可、業務ルール、DB制約を分ける

API設計で混ざりやすいのが、入力検証、認証、認可、業務ルール、DB制約である。
これらは似ているが、確認しているものが違う。

入力検証は、外から来た値の形を見る。
`learnerId` が数値として扱えるか。
`status` が許可された値か。
`note` が任意か、最大文字数を超えていないか。
JSONの形が壊れていないか。

認証は、呼び出し元が誰かを確認することだ。
ログインしているか、トークンやセッションが有効かを見る。

認可は、その人がその操作をしてよいかを確認することだ。
ログインしているメンターが、対象受講者を担当しているかを見る。
ログイン済みであることは、担当外の受講者を更新してよいことを意味しない。

業務ルールは、仕事上の決まりである。
支援ステータスはメンターが手動で変更する。
初回リリースでは自動アラートは作らない。
支援ステータスの候補値は `none`、`needs_support`、`in_progress`、`resolved` である。

DB制約は、保存先で最後にデータを守る仕組みである。
外部キー制約は存在しない受講者への参照を防ぐ。
CHECK制約は許可されないstatusを防ぐ。
ただし、担当外のメンターが更新してはいけないという認可は、通常はAPI側でも確認する必要がある。

`validation-and-authorization.md` では、これらを別の欄に書く。
分けておくと、エラーが起きたときに、どこで何を直すべきかが見えやすい。

具体的には、次のように分ける。

| 分類 | 確認すること | 失敗例 | error codeの例 |
| --- | --- | --- | --- |
| JSONの形式 | bodyがJSONとして読めるか | `{ "status": ` のように壊れている | `INVALID_JSON` |
| path params | `learnerId` の形式が有効か | 空、想定外の形式 | `INVALID_LEARNER_ID` |
| query params | `supportStatus` が許可値か | `supportStatus=urgent` | `INVALID_SUPPORT_STATUS_FILTER` |
| body | `status` が許可値か | `watching` | `INVALID_SUPPORT_STATUS` |
| body | `note` が文字列で長すぎないか | 文字列以外、上限超過 | `INVALID_SUPPORT_NOTE` |
| 認証 | ログイン中の利用者が分かるか | tokenなし、期限切れ | `UNAUTHENTICATED` |
| 認可 | その利用者が対象を操作できるか | 担当外受講者の更新 | `FORBIDDEN` |
| 業務ルール | 今回の機能範囲に合うか | 自動アラート設定を送ってくる | `UNSUPPORTED_OPERATION` |
| DB制約 | 最後に保存先が矛盾を防ぐか | 外部キー違反、CHECK違反 | API向けのcodeへ変換する |

入力検証で防げるものは、DBに届く前に分かりやすいエラーへ変換する。
ただし、API側の検証があってもDB制約は不要にならない。
複数の入口や将来のバッチ処理が同じDBを書き込む可能性があるため、最後の防衛線としてDB制約も残す。

### error responseは、失敗時の契約である

エラーは、実装の最後に付ける飾りではない。
失敗したときに、画面、利用者、開発者が次に何を判断できるかを決める契約である。

たとえば、支援ステータス更新では次の失敗があり得る。

- request bodyがJSONとして壊れている。
- `status` が許可された値ではない。
- ログインしていない。
- ログイン中のユーザーがメンターではない。
- 対象受講者が存在しない。
- 対象受講者は存在するが、ログイン中のメンターの担当ではない。
- DB制約違反が起きた。

これらを全部 `500 Internal Server Error` にすると、呼び出し元は何も判断できない。
内部のstack traceをそのまま返すのも危険である。
stack traceには、ファイルパス、SQL、環境情報、秘密情報に近い情報が混ざることがある。

error responseには、開発者向けの `code` と、利用者や画面向けの `message` を分けて入れる。
入力エラーでは、どの項目がなぜ失敗したかを `fields` に入れると、画面がフォームの近くにエラーを表示しやすい。

```json
{
  "code": "INVALID_SUPPORT_STATUS",
  "message": "支援ステータスの値が正しくありません。",
  "fields": {
    "status": "none, needs_support, in_progress, resolved のいずれかを指定してください。"
  }
}
```

実務では、調査用に `requestId` や `traceId` を返すこともある。
これは利用者に内部情報を見せるためではなく、画面の問い合わせ、サーバーログ、監視ログを結びつけるためのIDである。

```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "処理中にエラーが発生しました。",
  "requestId": "req_20260517_001"
}
```

このようなエラーでは、詳細はサーバーログに残し、responseには一般的なmessageだけを返す。
SQL、stack trace、ローカルファイルパス、環境変数、token、Cookieの値はresponseに出さない。

status codeの候補は、次のように考えられる。

- **`400 Bad Request`**：JSONの形、型、必須項目などrequest全体が不正。
- **`401 Unauthorized`**：ログインしていない、または認証情報が無効。
- **`403 Forbidden`**：認証はできているが、その操作は許可されない。
- **`404 Not Found`**：対象が存在しない、または存在を見せない方針で隠す。
- **`422 Unprocessable Content`**：形式は読めるが、業務上受け付けられない値。

実務では、チームごとのエラー方針がある。
どの失敗をどのstatus codeとcodeに変換するかを、実装前に決めておく。

### handlerに全部を書かない

routeやhandlerは、HTTP requestを受け取り、responseへ変換する入口である。
しかし、入力検証、認証、認可、業務処理、DBアクセス、エラー変換をすべて一つの関数に詰め込むと、処理の意図が読みにくくなる。

支援ステータス更新の流れは、たとえば次のように分けられる。

```txt
route
  -> handler
    -> validate path params
    -> validate request body
    -> get current user
    -> use case
      -> check mentor role
      -> check mentor assignment
      -> update support status
    -> repository
      -> read assignment
      -> upsert learner_support_statuses
    -> response
```

handlerは、HTTPの入口として、path params、query params、headers、bodyを読む。
use caseは、メンターが担当受講者だけを更新できる、という業務判断を扱う。
repositoryは、DBへの読み書きを担当する。

この分け方は、抽象化のための抽象化ではない。
認可の不具合ならuse caseを見る。
SQLの不具合ならrepositoryを見る。
responseの形が画面と合わないならhandlerやresponse変換を見る。
読む場所を絞れることが、チーム開発での保守性になる。

スターターアプリは学習用に小さくしているため、本物の認証基盤の代わりに `x-mentor-id` header や既定値のメンターIDを使う場合がある。
これは「クライアントが送ったメンターIDを本番で信用してよい」という意味ではない。
本番相当の設計では、ログイン状態、セッション、tokenなどをサーバー側で検証し、そこから現在ユーザーとメンターを決める。
スターターの一覧取得も、画面とAPIの観察を優先して簡略化されている場合がある。
課題で書くAPI契約では、「ログイン中のメンターの担当受講者だけを返す」前提を明記する。

また、スターターアプリでは、エラーの扱いやresponseの形を簡単にしている箇所がある。
教材のAPI契約を書くときは、サンプル実装の都合と、実務で守るべき契約を分けて考える。
たとえば、壊れたJSONは `500` ではなく `400 INVALID_JSON` へ変換する、想定外の内部エラーでは生の `error.message` を返さない、といった方針を契約に書く。

### トランザクションが必要になる場合を説明する

第10章では、初期案として現在値だけを持つ設計を扱った。
現在値だけを更新するなら、処理は比較的単純である。
しかし、将来、支援ステータスの履歴も保存するなら、現在値の更新と履歴行の追加をひとまとまりにしたくなる。

このとき使うのがトランザクションである。
複数のDB更新をまとめて成功させるか、まとめて失敗させる。
現在値だけ更新され、履歴が残らない。
あるいは履歴だけ残って現在値が変わらない。
このような中途半端な状態を避けるために使う。

API設計の段階では、実装コードを書かなくてもよい。
ただし、`api-flow.md` に、履歴を持つ案ではトランザクションが必要になる、という判断を残す。
後の実装やレビューで、何を一体として扱うべきかが分かる。

同時更新も、将来の論点として意識しておく。
たとえば、二人のメンターが同じ受講者をほぼ同時に更新できる設計なら、後から来た更新で前の更新が上書きされる。
初回リリースで複数担当を扱わないなら大きな問題にならないかもしれない。
しかし、複数担当や履歴を入れるなら、`updatedAt` を使った確認、履歴保存、競合時の `409 Conflict` などを検討する。
この章では実装しなくても、`api-flow.md` の「判断が必要なこと」に残すとよい。

### curlで、画面がなくてもAPIを確認する

curlは、ターミナルからHTTP requestを送るコマンドである。
画面が完成していなくても、API契約どおりにrequestを送り、status codeとresponse bodyを確認できる。

担当受講者一覧の確認は、次のように書ける。

```bash
curl -i \
  -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/mentor/learners?supportStatus=needs_support"
```

支援ステータス更新の確認は、次のように書ける。

```bash
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"needs_support","note":"学習ログの提出が遅れている"}' \
  "http://localhost:3000/api/mentor/learners/1/support-status"
```

`-i` は、response headersも表示する指定である。
`-X PATCH` は、HTTP methodを指定する。
`-H` はheadersを指定する。
`-d` はrequest bodyを指定する。

実際のtokenやCookieを、提出物やAIへの質問に貼ってはいけない。
確認ログでは `<token>`、`<redacted>` のように伏せる。
どの利用者として実行したかは、「メンター m-001 相当」「担当外メンター相当」のように説明すればよい。

スターターアプリのように本物の認証基盤がないサンプルでは、確認のために `x-mentor-id` を使うことがある。
これは本番の認証ではなく、担当者を切り替えて認可のふるまいを観察するための学習用の代替である。

```bash
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-mentor-id: m-002" \
  -d '{"status":"needs_support","note":"担当外更新の確認"}' \
  "http://localhost:3000/api/mentor/learners/l-102/support-status"
```

この例では、`l-102` が `m-001` の担当である前提なら、`m-002` による更新は失敗すべきである。

確認ログでは、コマンドだけでなく、目的、期待、実際の結果、DB、ログ、次に直すことを書く。
たとえば、正常系なら200番台のstatus、更新後のresponse、DB上の支援ステータス、サーバーログに不要なエラーがないことを見る。
異常系なら、入力不正、未ログイン、権限なし、対象なしを確認する。

異常系の例:

```bash
curl -i \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <other-mentor-token>" \
  -d '{"status":"needs_support"}' \
  "http://localhost:3000/api/mentor/learners/1/support-status"
```

期待は、担当外のメンターなら `403` と `FORBIDDEN` が返ることである。
もし `200` で更新できてしまうなら、認可の重大な不具合である。
もし `500` になるなら、エラー変換が足りない可能性がある。

### api-check-logは、テストとPR説明の材料になる

`api-check-log.md` は、APIが動いたことを雑に書くメモではない。
正常系と異常系を、request、期待、実際のresponse、DBやログの確認、次に直すことに分けて残す文書である。

最低限、次を確認する。

- 正常系の一覧取得。
- 正常系の支援ステータス更新。
- `status` が不正な入力エラー。
- 未ログイン。
- 担当外メンターによる権限エラー。
- 存在しない受講者ID。

確認ログは、次の粒度で書くとレビューしやすい。

| 項目 | 書くこと |
| --- | --- |
| 目的 | 何を確認したいrequestか |
| 前提 | どの利用者相当か、どの受講者が担当か、事前データは何か |
| command | tokenやCookieを伏せたcurl |
| 期待 | status code、response body、DB変化、ログ |
| 実際 | 実際のstatus code、response bodyの要点 |
| 判断 | 期待通りか。違うならどこを直すか |
| 次の材料 | 第13章で自動テストにするなら、どのケースか |

この確認ログは、第13章のテスト設計にそのままつながる。
API契約で書いたことを、curlで手動確認し、次に自動テストへ落とす。
その流れができると、PRで「何を確認したか」を説明しやすくなる。

### AIは、API案ではなく確認観点にも使う

AIは、endpoint案、requestとresponseの初稿、error case、curl例、確認観点の洗い出しに使える。
しかし、AIが出したAPI案をそのまま採用してはいけない。

AIへ依頼するときは、第9章のユースケース、第10章のDB設計、担当受講者だけ更新できるという認可ルール、今回作らない範囲を渡す。
実データ、個人情報、認証情報、内部URL、秘密情報は渡さない。
必要なら、サンプル値や伏せ字にする。

AIの出力は、次の観点で確認する。

- 既存の認証方式と合っているか。
- チームのAPI命名規則やエラー方針と合っているか。
- request bodyに信用してはいけない値を入れていないか。
- 認証と認可を混ぜていないか。
- DB制約とAPI側の事前確認の分担が説明されているか。
- 実行していないcurlやSQLを、確認済みとして書いていないか。

API設計でAIが出しがちな危ない提案も知っておく。

- `mentorId` をrequest bodyに入れ、その値で認可する。
- `PATCH /api/learner_support_statuses/{id}` のように、テーブル名CRUDだけでendpointを作る。
- すべての失敗を `400` または `500` にまとめる。
- エラー時にstack traceやDBエラー文をそのまま返す。
- 存在しない認証方式や、リポジトリにないmiddlewareを前提にする。
- curl例に本物のtoken、Cookie、内部URLを貼る前提にする。

このような案が出たら、すぐ否定するのではなく、なぜ危ないのかを自分で説明できる形に直す。
「現在ユーザーはサーバー側で取得する」「担当関係はuse caseで確認する」「内部エラーはログへ、responseは一般化する」のように、採用する方針へ書き換える。

AIは、候補を速く出す道具である。
業務ルール、認可、公開してよい情報、実行結果の採否は、人が責任を持って決める。

### API契約とcurlで確認すること

api-contract.md、validation-and-authorization.md、api-flow.md、api-check-log.md を作る。

`api-contract.md` には、endpoint、method、目的、誰が呼べるか、path params、query params、headers、body、success response、error response、確認用curlを書く。

`validation-and-authorization.md` には、入力検証、認証、認可、業務ルール、DB制約に任せること、API側で事前に確認すること、DB制約違反をAPIエラーへ変換する方針を書く。

`api-flow.md` には、route、handler、use case、repository、DB、responseまでの流れを書く。
正常系だけでなく、入力エラー、認証エラー、認可エラー、DBエラーがどこで起きるかも書く。

`api-check-log.md` には、curlで実行したrequest、期待したstatusとresponse、実際の結果、DBやログの確認、次に直すことを書く。
成功した確認だけでなく、失敗すべきrequestが失敗したことも残す。

成果物の目的は、フレームワークのコードをきれいに書くことではない。
画面が何を依頼し、バックエンドが何を判断し、DBに何を保存し、失敗をどう返すかを、チームが同じ前提で見られるようにすることである。
認証基盤、詳細なセキュリティ対策、自動テストコードの実装に広げすぎない。
ただし、「今回はスターターの `x-mentor-id` で代用する」「実務ではセッションやtokenから現在ユーザーを取る」「本物のtokenはログに残さない」のような前提は明記する。
確認していないことを確認済みとして書かないことも、API設計の品質である。

### API設計で起きやすい誤解

- endpointをテーブル名のCRUDだけで作り、業務上の操作や権限が見えなくなる。
- request bodyの `mentorId` をそのまま信用する。
- 認証済みであれば、すべての受講者を操作できると考える。
- `GET` でデータ更新や既読化のような副作用を起こす。
- 不正なquery paramsを空結果として返すのか入力エラーにするのかを決めない。
- すべての失敗を `200` とerror bodyで返し、HTTP status codeを使わない。
- `401` と `403` を区別せず、未ログインと権限なしを混ぜる。
- 入力検証、認可、業務ルール、DB制約を一つのif文の山として扱う。
- DBエラーやstack traceをそのままAPI responseへ返す。
- スターターアプリの `x-mentor-id` を、本番でも信用してよい認証情報だと思う。
- curl確認ログに本物のtoken、Cookie、内部URLを貼る。
- response field名や包み方が、一覧APIと更新APIで理由なくずれる。
- 正常系だけcurlで確認し、入力不正、未ログイン、権限なし、対象なしを確認しない。
- AIが出したendpointやcurl例を、既存の認証方式や実行結果と照合せずに採用する。

### APIで画面と業務をつなぐ章で持ち帰ること

第11章で身につけるべきことは、第9章のユースケースと第10章のDB設計を、画面から呼び出せるAPI契約へ変換することである。
APIはURLの一覧ではない。
画面、業務ルール、DBの境界にある約束である。

endpointは、ユースケースから決める。
requestは、path params、query params、headers、bodyに分ける。
responseは、画面が扱いやすい形に整える。
入力検証、認証、認可、業務ルール、DB制約は分けて考える。
error responseは、失敗時に次の行動を決めるための契約である。
curl確認ログは、PR説明と自動テストの材料になる。

### フロントエンドとアクセシビリティの章へ

次章では、このAPI契約を画面へ変換する。
担当受講者一覧をどう表示するか、支援ステータスをどう変更するか、読み込み中、空、保存中、成功、失敗をどう見せるかを考える。
第11章で作ったapi-contract.md、validation-and-authorization.md、api-flow.md、api-check-log.mdが、第12章の画面要件とアクセシビリティ確認の材料になる。

### 参考資料

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [MDN: Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)

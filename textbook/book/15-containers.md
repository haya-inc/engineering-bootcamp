---
title: "第15章 コンテナと実行環境"
part: 4
partLabel: "Part 4 実行環境と運用"
order: 15
---

第5章では、手元の開発環境、CLI、エディタ、依存関係を確認した。
第10章ではDBを設計し、第11章から第14章ではAPI、画面、テスト、セキュリティを扱った。
第15章では、それらを他の人の環境でも再現しやすく起動するために、コンテナと実行環境として整理する。

Dockerコマンドを大量に暗記することが目的ではない。
自分のWebアプリケーションとDBが、何を前提に動くのかを説明し、DockerfileとDocker Composeで再現可能な形へ近づけることである。
支援ステータス機能を含む研修用アプリを、app serviceとdb serviceとして起動する流れを題材にする。

この章ではKubernetesやクラウド実行基盤の詳細は扱わない。
クラウドへのデプロイとCI/CDは第16章で扱う。
まずは、ローカルで再現して起動し、ログを見て、ローカルと本番相当の違いを説明できることに集中する。

### この章でできるようになること

この章を終えると、次のことを自分の言葉で説明し、課題の成果物へ落とせるようになる。

- アプリが動くためのruntime、依存関係、DB、環境変数、port、永続化データを棚卸しできる。
- imageとcontainer、build時とrun時、host側とcontainer側の違いを説明できる。
- Dockerfileの各行が、何をimageへ入れ、何を起動時に実行するかを説明できる。
- build contextと `.dockerignore` を使い、不要なファイルやsecretをimageへ入れない方針を書ける。
- Composeでapp serviceとdb serviceの関係、service名での接続、port mapping、volumeを説明できる。
- `depends_on` が起動順の補助であり、利用可能状態の確認とは別であることを説明できる。
- `docker compose ps`、`logs`、`exec` を使い、起動失敗を観察結果から切り分けられる。
- ローカルで便利な設定と、本番相当で注意すべき設定を分けて書ける。
- container利用時にもsecret、依存関係、実行ユーザー、公開port、ログを確認できる。
- `container-run-log.md` に、実行コマンド、結果、ログ、仮説、修正、残課題を書ける。

### コンテナは、手元の偶然を減らすために使う

実務では、「自分のPCでは動くが、他の人の環境では動かない」という問題がよく起きる。
原因は、コード以外にあることが多い。
Node.js、Python、Rubyなどのruntime version。
package manager。
依存関係のlock file。
DB。
環境変数。
port。
ファイルの置き場所。
OSごとの差分。

コンテナは、これらの実行前提をまとめて扱いやすくする。
ただし、コンテナを使えばすべての問題が消えるわけではない。
何をimageに入れ、何を起動時に渡し、何をvolumeに残し、どのserviceへ接続するかを、開発者が設計する必要がある。

コンテナを使う理由は、流行しているからではない。
アプリが動く前提を記録し、別の環境で再現しやすくし、次のクラウドやCI/CDへ進むための土台を作るためである。

### imageとcontainerを分けて理解する

Dockerを理解するときは、imageとcontainerを分ける。
imageは、アプリを起動するための読み取り専用テンプレートである。
containerは、そのimageから起動した実行中の単位である。

関係は次のように考える。

```txt
Dockerfile
  -> build
    -> image
      -> run
        -> container
```

Dockerfileには、imageの作り方を書く。
`docker build` でimageを作る。
`docker run` や `docker compose up` でcontainerを起動する。
同じimageから、複数のcontainerを起動できる。

この区別は、設定を考えるときに重要である。
build時に必要なものと、container起動時に必要なものは違う。
依存関係のinstallはbuild時に行うことが多い。
DB passwordや接続先のような環境ごとに変わる値は、run時に渡すことが多い。

### Dockerfileは、imageの作り方を記録する

Dockerfileは、imageの作り方を記録するファイルである。
単に動けばよいスクリプトではない。
あとから見た人が、アプリの実行環境を理解するための文書でもある。

典型的には、次のような情報が入る。

- **base image**：どのruntimeから始めるか。
- **working directory**：container内の作業場所。
- **dependency install**：依存関係をどう入れるか。
- **copy**：どのファイルをimageへ入れるか。
- **build step**：必要ならアプリをbuildする。
- **expose**：containerが使うportの意図を示す。
- **command**：container起動時に実行する命令。

`starter-apps/learning-log-sample` のDockerfileは、研修用にかなり小さい。
外部npm packageに依存しないため、`npm ci` を実行せず、`package.json` と `src` だけをcopyしている。

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
```

一方、実務のNode.jsアプリでは、多くの場合lock fileと依存関係のinstallが必要になる。
その場合のたたき台は次のように考えられる。

```dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

この例だけを暗記してはいけない。
大切なのは、何を先にcopyすると依存関係のinstallを再利用しやすいか、どのcommandで起動するか、imageに入れてはいけないものは何かを説明できることである。

base imageのversionは、README、`package.json` の `engines`、チームの標準、公式imageのサポート状況に合わせて選ぶ。
`learning-log-sample` は `package.json` でNode.js 18.18以上を前提にし、Dockerfileでは `node:20-alpine` を使っている。
教材内の `node:22` は汎用例であり、実際の課題では自分のプロジェクトが使うversionを明記する。

本番相当のimageでは、実行ユーザーも確認する。
Dockerfileのprocessは、指定しなければrootで動くことがある。
公式のNode imageには `node` userが用意されているため、アプリがroot権限を必要としないなら `USER node` のような非root実行を検討する。
研修では必須実装にしないが、`dockerfile-note.md` に「今回はrootのままか、非rootにするか、理由は何か」を書けるとよい。

### Dockerfileの前に、実行前提を棚卸しする

Dockerfileを書く前に、アプリが動くために必要なものを棚卸しする。
いきなり設定ファイルを書き始めると、うまく動かないたびに勘で直すことになる。

まず確認するのは、次である。

- 使う言語とversion。
- package manager。
- 依存関係ファイル。
- lock file。
- install command。
- build command。
- start command。
- app port。
- DB type。
- DB image。
- DB port。
- 永続化するデータ。
- 必要な環境変数。

支援ステータス機能を含むWebアプリなら、DB接続に必要な値も確認する。

```txt
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
APP_PORT
```

この棚卸しが `runtime-requirements.md` の役割である。
Dockerfileは、このメモをもとに書く。
実行前提が曖昧なままDockerfileを書くと、設定の意味を説明できない。

### build contextと.dockerignoreを意識する

build contextは、imageを作るときDockerへ渡すファイルの範囲である。
Dockerfileで `COPY . .` と書いたとき、どのファイルが候補になるかに関わる。

何でもbuild contextに入れてよいわけではない。
不要なファイルを含めるとbuildが遅くなる。
生成物や依存ディレクトリを含めると、imageが大きくなったり、環境差分の原因になったりする。
secretを含めると、第14章で扱った漏えいリスクになる。

`.dockerignore` は、build contextから除外するファイルやディレクトリを書くファイルである。
研修では、少なくとも次を検討する。

```txt
.git
node_modules
.env
coverage
tmp
logs
generated
```

`.env` は特に注意する。
環境変数の見本として `.env.example` を共有することはある。
しかし、実際のsecretを含む `.env` はGitにもimageにも入れない。

Dockerfileの `COPY` は、原則としてbuild contextの外にあるファイルを直接copyできない。
「手元にはあるのにDocker buildでは見つからない」場合、Dockerfileのpathだけでなく、どのディレクトリをbuild contextとして渡しているかを見る。
Composeで `build: .` と書いているなら、そのserviceのcontextは通常そのディレクトリである。

`.dockerignore` は、Gitの `.gitignore` とは別物である。
Gitにcommitしないファイルと、Docker buildへ送らないファイルは重なることが多いが、同じ設定ではない。
`.gitignore` に `.env` があっても、`.dockerignore` にないならbuild contextへ入る可能性がある。

### 開発用と本番相当の違いを分ける

開発用のcontainerでは、便利さを優先する設定がある。
ソースコードをbind mountして、変更をすぐ反映する。
debug logを多めに出す。
開発用のDB volumeを使う。
管理UIやdebug portを使う。

一方、本番相当では、便利さより安全性、再現性、運用しやすさを重視する。
build済みのimageを使う。
secretは管理された仕組みで渡す。
ログは構造化し、必要な場所へ集める。
debug用のportや管理UIを安易に公開しない。
不要な依存関係やファイルを減らす。

local、staging、productionは、同じではない。
ただし、差分を無秩序に増やしてよいわけでもない。
Twelve-Factor Appでは、環境ごとの差分を設定として扱う考え方が示されている。
同じimageを使い、環境ごとに変わる値を外から渡すと、差分を説明しやすい。

第15章の目的は、本番インフラを設計することではない。
ローカルで便利な設定と、本番相当で注意すべき設定を分けて書けることである。

### Composeは、複数serviceの関係を記録する

Docker Composeは、複数のcontainerをまとめて定義し、起動するための仕組みである。
研修用アプリでは、app serviceとdb serviceを定義する。

Compose fileは、コマンドを短くするためだけのものではない。
アプリとDBの関係を説明する文書でもある。

現在のCompose Specificationでは、`compose.yaml` や `compose.yml` に `services:` を書く形が基本である。
古い記事では先頭に `version: "3"` のような行が出てくることがあるが、現在のComposeでは必須ではない。
教材では、スターターに合わせて `compose.yaml` と `services:` から始まる例を使う。

```yaml
services:
  app:
    build: .
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      DB_HOST: db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

この例では、`app` と `db` がserviceである。
`app` はDockerfileからbuildする。
`db` はPostgreSQLのimageを使う。
DBのデータはnamed volumeである `db-data` に残す。

実際のDB imageやversion、volume pathは、プロジェクトのREADMEや公式imageの説明に合わせる。
サンプルの値を、そのまま全プロジェクトへ貼るわけではない。

`learning-log-sample` の `compose.yaml` は、次のような研修用の簡略構成である。

- appはDockerfileからbuildする。
- appには `PORT`、`MENTOR_ID`、`DATABASE_URL` を渡す。
- dbは `postgres:16-alpine` を使う。
- `schema.sql` を `/docker-entrypoint-initdb.d/001-schema.sql` へ読み取り専用でmountする。
- DBの永続化用named volumeは定義していない。

この構成では、Nodeアプリ自体はインメモリデータを使うため、前半の章ではDBなしでも進められる。
PostgreSQLは、第10章以降のDB設計や第15章のapp/db起動関係を学ぶために含まれている。
自分のアプリでDBへ実際に読み書きするなら、named volume、migration、backup、初期データの扱いを追加で確認する。

### service名で接続する

Composeの中では、service名が接続先の名前として使える。
DB serviceの名前が `db` なら、app containerからは `DB_HOST=db` と指定する。

ここで混乱しやすいのが `localhost` である。
containerの中の `localhost` は、そのcontainer自身を指す。
app containerの中から `localhost` と書いても、db containerを指すわけではない。
app containerからdb containerへ接続するなら、Composeのservice名を使う。

一方で、自分のPCのブラウザからappへアクセスするときは、host側のportを見る。
container同士の通信と、hostからcontainerへの通信を分ける。

この違いを説明できると、DB接続エラーの切り分けがかなり楽になる。
`DB_HOST=localhost` でつながらないとき、どこから見たlocalhostなのかを確認できるからである。

### port mappingは、host側とcontainer側を分ける

port mappingは、host側のportとcontainer側のportをつなぐ設定である。
たとえば次の設定は、自分のPCの3000番を、app containerの3000番へつなぐ。

```yaml
ports:
  - "3000:3000"
```

左側がhost側、右側がcontainer側である。
`"8080:3000"` なら、自分のPCでは8080番にアクセスし、container内では3000番でアプリが待ち受ける。

Dockerfileの `EXPOSE 3000` と、Composeの `ports: "3000:3000"` は役割が違う。
`EXPOSE` は「このcontainerは3000番で待ち受ける意図がある」というimage側のメタ情報である。
hostからアクセスできるように公開するには、Composeの `ports` や `docker run -p` のようなport publishingが必要である。

portで詰まったときは、次を分けて見る。

- アプリはcontainer内でどのportをlistenしているか。
- Composeはどのhost portへ公開しているか。
- そのhost portを、別のプロセスがすでに使っていないか。
- ブラウザから見ているURLは正しいか。
- `EXPOSE` だけで公開したつもりになっていないか。

同じ番号を使うと分かりやすいが、いつも同じにできるとは限らない。
host側とcontainer側を分けて説明できることが大切である。

### volumeは、消えて困るデータを残すために使う

containerの中のファイルは、containerを作り直すと消えることがある。
DBのデータやアップロードファイルのように、消えると困るものにはvolumeを使う。

Composeでは、named volumeを次のように定義できる。

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

開発時にソースコードをbind mountすることと、DBデータを永続化するvolumeは目的が違う。
bind mountは、host側のファイルをcontainer内へ見せ、開発中の変更を反映しやすくする。
DB volumeは、containerを作り直してもDBデータを残すために使う。

さらに、PostgreSQL公式imageのように、初期化用SQLをcontainerへmountする用途もある。
`learning-log-sample` では、`./schema.sql:/docker-entrypoint-initdb.d/001-schema.sql:ro` のように、host側の `schema.sql` をcontainer内へ読み取り専用で見せている。
これはDBデータを永続化するvolumeではなく、初期化スクリプトを渡すためのbind mountである。

volumeを消す操作は、データを消す操作である。
演習環境でも慎重に扱う。
「一度消してやり直したら動いた」で終わらせると、なぜ動いたのか、何が消えたのかを説明できない。

特に `docker compose down -v` は、Compose projectに紐づくnamed volumeも削除する。
DBの中身を初期化したい演習では使うことがあるが、本番相当のデータがある環境では安易に実行しない。
削除コマンドを実行した場合は、何を消したかを `container-run-log.md` に書く。

### 環境変数と.env.exampleを分ける

環境変数は、環境ごとに変わる設定を外から渡す仕組みである。
DB接続先、DB user、DB name、app port、ログレベルなどが候補になる。
secretを含む場合もある。

`.env` はローカルで便利だが、Gitにcommitしない。
一方、`.env.example` は、必要な変数名と安全な例を共有するために使える。

```txt
APP_PORT=3000
DB_HOST=db
DB_USER=app
DB_PASSWORD=dummy-password
DB_NAME=bootcamp
```

ここでの `dummy-password` は見本である。
実際のpasswordではない。
第14章のsecret確認と同じく、実際のsecretをREADME、PR本文、ログ、AI入力に含めない。

build時に必要な値と、run時に必要な値も分ける。
依存関係のinstallやbuildに必要な値はbuild時に関係する。
DB接続先やsecretのように環境ごとに変わる値は、container起動時に渡すことが多い。
この区別が曖昧だと、imageにsecretを入れてしまう危険がある。

Composeには、変数置換に使う `.env` と、containerへ渡す `environment` がある。
`.env` に書いた値が、常にcontainer内の環境変数として渡るわけではない。
container内で使う値は、`environment:` や `env_file:` などで渡す。
この違いを混ぜると、「`.env` に書いたのにcontainer内にない」という混乱が起きる。

`learning-log-sample` の `.env.example` は、ローカルからDBへ接続する例として `DATABASE_URL=postgres://bootcamp:bootcamp@localhost:5432/learning_log` を示している。
Compose内のapp containerからdbへ接続する場合は、`localhost` ではなく `db` をhostにした `postgres://bootcamp:bootcamp@db:5432/learning_log` を使う。
同じ `DATABASE_URL` でも、どこから接続するかでhost部分が変わる。

### depends_onは、起動順と利用可能状態を分けて考える

Composeでは、`depends_on` でservice間の依存を表せる。
ただし、単に `depends_on: - db` と書くだけでは、DBが完全に利用可能になったことまで保証しているとは限らない。
DB processが起動しても、接続を受け付ける準備がまだ終わっていないことがある。

つながらないときは、app側だけでなくdb側のログを見る。
DBが起動中なのか、認証情報が間違っているのか、DB名が違うのか、migrationが未実行なのかを分ける。

Composeでは、healthcheckと条件付きの `depends_on` を使って、serviceがhealthyになってから依存serviceを起動する構成も取れる。
研修では詳細な記法を暗記しなくてよい。
大切なのは、起動したことと、使える状態であることを分けて確認することである。

たとえばPostgreSQLでは、`pg_isready` を使って接続受付状態を確認する例がある。
実際に入れるかどうかは課題の範囲とチーム方針によるが、`depends_on` だけで十分と言い切らない。

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bootcamp -d learning_log"]
      interval: 5s
      timeout: 5s
      retries: 5
```

この例も、貼れば必ず正しいわけではない。
DB user、DB name、image、Compose実装の対応状況に合わせて確認する。
アプリ側にも、DB接続失敗時のretryや分かりやすいログが必要になることがある。

### 起動確認は、upした瞬間で終わらない

Compose fileを書いたら、`docker compose up` で起動する。
ここで確認するのは、コマンドが終了したかどうかだけではない。

- app serviceが起動しているか。
- db serviceが起動しているか。
- appからDBへ接続できているか。
- 必要な環境変数が渡っているか。
- portが競合していないか。
- migrationやseedが必要か。
- ログにsecretが出ていないか。

状態確認には、`docker compose ps`、`docker compose logs`、`docker compose exec` などを使う。
コマンド名はプロジェクトの標準に従えばよい。
大切なのは、何を見て、何が分かったかを `container-run-log.md` に残すことである。

記録するコマンドは、たとえば次のように分ける。

```bash
docker compose up --build
docker compose ps
docker compose logs app
docker compose logs db
docker compose exec app env
```

`exec app env` のようなコマンドは、環境変数が渡っているかを見るのに便利である。
ただし、secretが表示される可能性があるため、提出物やAI入力へそのまま貼らない。
必要な場合は、変数名だけ、または値を伏せた形で記録する。

### logsとexecで、勘ではなく観察から直す

containerが起動しないときは、まずログを見る。
DB接続失敗、環境変数不足、port競合、依存関係不足、migration未実行など、原因候補はログから分けられる。
勘で設定を変え続けるより、観察したこと、仮説、試したことを順に記録するほうが早い。

必要なときは、`docker compose exec` で起動中のcontainer内に入り、環境変数、ファイル配置、接続先を確認する。
ただし、containerの中で手作業で直して終わりにしてはいけない。
手で直した内容は、Dockerfile、Compose file、環境変数、migration、seedなど、再現できる設定へ戻す。

よくある失敗は、次のように整理できる。

- `DB_HOST` を `localhost` にしている。
- host側portが他のプロセスと競合している。
- `.env` が読み込まれていない。
- lock fileと依存関係がずれている。
- DBが使える状態になる前にappが接続している。
- migrationを忘れている。
- `.dockerignore` で必要なファイルまで除外している。
- ログにsecretが出ている。

失敗は悪いことではない。
ログと設定を見比べて、どの前提が外れているかを見つける練習である。

### コンテナ利用時もセキュリティは消えない

コンテナを使っても、セキュリティ問題が自動で消えるわけではない。
第14章の観点は、ここでも続く。

確認することは、次である。

- imageにsecretを入れていないか。
- Dockerfileの `ENV` や `ARG` にsecretを書いていないか。
- build contextに `.env` や不要なファイルを含めていないか。
- base imageや依存関係が古すぎないか。
- containerへ過剰な権限を与えていないか。
- rootで実行する必要がないprocessをrootで動かしていないか。
- 開発用のdebug portや管理UIを本番相当で公開していないか。
- ログにpassword、token、Cookie、支援メモ本文が出ていないか。

この章では、専門的なコンテナセキュリティ監査までは扱わない。
ただし、secret、依存関係、ログ、権限、公開portは、初心者でも確認できる入口である。
`secrets-and-dependencies-check.md` とつなげて見る。

Docker imageはlayerの積み重ねでできている。
一度copyしたsecretを後の行で削除しても、build履歴やlayerに残る可能性がある。
だから、secretは最初からbuild contextやDockerfileへ入れない。
build時にどうしても秘密情報が必要な場合は、Dockerのsecret mountなど、使っているbuild環境の安全な仕組みを確認する。
研修では、secretをbuildに必要としない構成を基本にする。

base imageは、固定と更新の両方を考える。
`node:20-alpine` のようにmajor versionを明記すると再現性は上がるが、脆弱性対応のために定期的な更新確認は必要である。
`latest` だけに頼ると、意図しない更新で動作が変わることがある。
どのtagを使い、いつ見直すかを `dockerfile-note.md` に残す。

### local、staging、productionの差分を書く

ローカルで動いたことは出発点であり、終点ではない。
stagingやproductionでは、設定、データ、secret、ログ、network、永続化、domain、TLS、backup、migrationの扱いが変わる。

第16章でクラウドへ進む前に、差分を書いておく。

```md
# Environment Differences

| item | local | staging | production | note |
| --- | --- | --- | --- | --- |
| image | local build | registry image | registry image |  |
| source code | bind mountあり | image内 | image内 |  |
| environment variables | .env | managed config | managed config |  |
| secrets | local dummy | managed secrets | managed secrets |  |
| database | local container | managed or shared DB | managed DB |  |
| volume | local volume | managed storage | managed storage |  |
| logs | terminal | collected logs | collected logs |  |
| port | localhost | internal and public | public through gateway |  |
| domain | localhost | staging domain | production domain |  |
| TLS | optional | required | required |  |
```

この表は、インフラ設計を完成させるためのものではない。
どの前提がローカルだけのものか、どの値を第16章で確認する必要があるかを明らかにするためのものである。

本番データをローカルへ安易に持ち込まないことも重要である。
ローカルで便利なことが、本番相当でも安全とは限らない。

### AIは、設定案よりも前提整理にも使う

AIには、Dockerfile案、Compose案、`.dockerignore` 案、起動失敗ログの原因候補、ローカルと本番の差分整理、secretを入れないためのチェックリストを頼める。

ただし、入力前に `.env`、secret、個人情報、本番データを含めていないか確認する。
採用前には、言語、package manager、DB、port、環境変数が既存READMEや実行結果と合っているかを見る。
PR前には、公式ドキュメント、実行結果、ログで確認し、自分が説明できる設定だけを残す。

依頼例は次のように、安全な前提を明示する。

```txt
研修用WebアプリをDocker Composeで起動する構成案を作ってください。

前提:
- app serviceとdb serviceがある
- appはDB_HOST, DB_USER, DB_PASSWORD, DB_NAMEを使う
- DBデータはvolumeで永続化する
- .envはGitにcommitしない
- Kubernetesは扱わない
- 第16章でAWSに進むため、この章はローカル起動と環境差分の説明に集中する

出してほしいこと:
- runtime-requirements.md の観点
- Dockerfile方針
- compose-services.md のたたき台
- 起動確認コマンド
- ログ確認とトラブルシュート観点
- 秘密情報を含めないための注意
```

AIが古いCompose記法や、実際のruntimeと合わないimageを出すことがある。
AI案は出発点であり、実行結果と公式ドキュメントで確認する。

### runtime-requirements.mdに書くこと

`runtime-requirements.md` は、DockerfileやComposeを書く前の棚卸しである。
まず、言語とversion、DB、環境変数、portから書く。
余裕があれば、依存関係、lock file、install、build、start、永続化するデータも足す。

```md
# Runtime Requirements

## App

| item | value | note |
| --- | --- | --- |
| language and version |  |  |
| app port |  |  |
| start command |  |  |
| package manager |  |  |
| dependency file |  |  |
| lock file |  |  |
| install command |  |  |
| build command |  |  |

## Database

| item | value | note |
| --- | --- | --- |
| DB type |  |  |
| DB image |  |  |
| DB port |  |  |
| persistent data |  |  |

## Environment Variables

| name | required | secret | example |
| --- | --- | --- | --- |
| DB_HOST | yes | no | db |
| DB_USER | yes | no | app |
| DB_PASSWORD | yes | yes | dummy-password |
| DB_NAME | yes | no | bootcamp |
| DATABASE_URL | project dependent | yes if password included | postgres://user:password@db:5432/dbname |
| APP_PORT | yes | no | 3000 |
```

この文書があると、DockerfileやComposeの値がどこから来たのかを説明しやすい。
DB接続情報は、`DB_HOST`、`DB_USER`、`DB_PASSWORD`、`DB_NAME` のように分けるprojectもあれば、`DATABASE_URL` にまとめるprojectもある。
自分のアプリがどちらを読んでいるかを、README、コード、`.env.example` で確認して書く。

### dockerfile-note.mdに書くこと

`dockerfile-note.md` には、Dockerfileの方針を書く。
base image、依存関係のinstall、build、start、build context、`.dockerignore`、build時とrun時の値、imageに入れてはいけないものを分ける。

````md
# Dockerfile Note

## 方針

-

## Dockerfileのたたき台

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

依存packageがあるNode.jsアプリでは、lock fileをcopyして `npm ci` を使う案も検討する。

## .dockerignoreに入れるもの

- .git
- node_modules
- .env
- coverage
- tmp
- logs

## build時に必要な値

-

## run時に必要な値

-

## imageに入れてはいけないもの

-

## 実行ユーザー

- rootのままか:
- 非rootにするなら:
- 理由:
````

Dockerfileの完成度だけでなく、判断の理由を書く。
なぜそのbase imageか。
なぜそのcommandか。
なぜそのファイルを除外するのか。
これがレビューの材料になる。

### compose-services.mdに書くこと

`compose-services.md` には、appとDBのservice構成を書く。
service名、役割、port、volume、environment、接続方法を説明する。

```md
# Compose Services

## service構成

| service | role | port | volume | note |
| --- | --- | --- | --- | --- |
| app | Web app | 3000 |  |  |
| db | Database | 5432 | db-data |  |

## 接続

- appからDBへは `DB_HOST=db` で接続する。
- `DATABASE_URL` を使うprojectでは `postgres://bootcamp:bootcamp@db:5432/learning_log` のようにhostをservice名にする。
- hostからappへは `http://localhost:3000` で確認する。
- `localhost` がどこから見たlocalhostかを分ける。

## 注意

- `.env` はGitにcommitしない。
- `depends_on` は起動順の補助として扱い、DBが使える状態かはログやhealthcheckで見る。
- `compose.yaml` の `environment` へ渡した値と、container内で実際に見える値を区別して確認する。
- `EXPOSE` と `ports` は別物として扱う。
- 本番のsecret管理は第16章で扱う。
```

Compose fileだけを貼るのではなく、接続の意味を書く。
appから見たDB hostと、ブラウザから見たapp URLを分けることが重要である。

### container-run-log.mdに書くこと

`container-run-log.md` は、起動確認とログ確認の証拠である。
起動コマンド、service状態、ログ、container内で確認したこと、起きた問題、相談材料、secret確認を書く。

```md
# Container Run Log

## 起動

Command:

-

Result:

-

## 実行したコマンド

| command | result | note |
| --- | --- | --- |
| docker compose up --build |  |  |
| docker compose ps |  |  |
| docker compose logs app |  | secretを含む行は貼らない |
| docker compose logs db |  |  |
| docker compose exec app env |  | 値は必要に応じて伏せる |

## service状態

| service | status | note |
| --- | --- | --- |
| app |  |  |
| db |  |  |

## logs

| service | checked | result |
| --- | --- | --- |
| app |  |  |
| db |  |  |

## 起きた問題

| problem | 見たログ、観察結果 | 原因の仮説 | 試したこと、直したこと |
| --- | --- | --- | --- |
|  |  |  |  |

## 相談するとしたら

- 見たこと:
- 仮説:
- 試したこと:
- 相談したいこと:
```

このログは、うまくいった証拠だけではない。
詰まったときに、メンターへ何を相談すればよいかを整理する材料になる。

### environment-differences.mdに書くこと

`environment-differences.md` では、local、staging、productionの差分を書く。
第16章で確認すること、最終発表で使えそうな証拠、本番に持ち込まないもの、残した課題を書く。

比較する観点は、image、source code、environment variables、secrets、database、volume、logs、port、domain、TLS、migration、backupである。

この文書の目的は、立派な本番設計書を作ることではない。
ローカルで動いた状態が、どの点で本番相当と違うのかを説明できるようにすることである。
この説明ができると、第16章のクラウドとCI/CDで、何を設定し、何をsecretとして扱い、何を監視するかへ進みやすい。

### コンテナ環境で起きやすい誤解

- Dockerコマンドを覚えればコンテナを理解したと考える。まず実行前提を説明する。
- Dockerfileを、動けばよいメモとして扱う。imageの作り方と判断理由を残す。
- build時に必要な値とrun時に必要な値を混ぜる。secretをimageへ入れない。
- Dockerfileの `ENV` や `ARG` ならsecretを入れてよいと思い込む。image layerやbuild履歴に残る可能性を考える。
- build contextを意識せず、不要なファイルや `.env` を含める。
- `.gitignore` と `.dockerignore` を同じものだと思い込む。Docker buildへ送る範囲は別に確認する。
- app containerからDBへ `localhost` で接続しようとする。Compose内ではservice名を使う。
- host側portとcontainer側portを混同する。
- `EXPOSE` だけでhostへ公開されたと思い込む。host公開には `ports` や `-p` が必要である。
- volumeを消す操作の意味を理解せず、DBデータを失う。
- `docker compose down -v` を気軽に実行する。named volumeも削除されることがある。
- `depends_on` だけでDBが利用可能だと思い込む。ログやhealthcheckで状態を見る。
- container内で手作業で直して終わりにする。設定ファイルへ戻して再現できる形にする。
- ローカルで便利なdebug設定を、本番相当にもそのまま持ち込む。
- AIが出したCompose案を、公式資料や実行結果と照合せずに採用する。

### 起動条件とログで確認すること

この章では、`runtime-requirements.md`、`dockerfile-note.md`、`compose-services.md`、`container-run-log.md`、`environment-differences.md` を作る。

最初に、第5章の `project-overview.md`、第10章の `schema-draft.sql`、第14章の `secrets-and-dependencies-check.md` を読み直す。
アプリが必要とするruntime、依存関係、DB、環境変数、secret、port、永続化するデータを取り出す。

`runtime-requirements.md` には、言語とversion、DB、環境変数、port、依存関係、lock file、install、build、start、永続化するデータを書く。
DB接続情報は、分割した環境変数を使うのか、`DATABASE_URL` のようなURL形式を使うのかを実装に合わせて書く。

`dockerfile-note.md` には、base image、dependency install、build step、起動command、build context、`.dockerignore`、build時とrun時の値、imageに入れてはいけないもの、実行ユーザーを書く。

`compose-services.md` には、app service、db service、service名での接続、port mapping、volume、environment、`.env` と `.env.example` の扱い、`EXPOSE` と `ports` の違い、`depends_on` とhealthcheckの注意を書く。

`container-run-log.md` には、起動コマンド、`ps`、logs、`exec`、container内で確認したこと、起きた問題、原因の仮説、直したこと、相談材料、secret確認を書く。

`environment-differences.md` には、local、staging、productionの差分、第16章で確認すること、最終発表で使えそうな証拠、本番に持ち込まないもの、残した課題を書く。

成果物は、Dockerを使ったという証明ではない。
アプリが何を前提に動き、どの設定で起動し、どこが本番相当と違うのかを説明するための証拠である。

### コンテナと実行環境の章で持ち帰ること

第15章で身につけるべきことは、コンテナをコマンドではなく実行環境の記録として見ることである。
imageとcontainerを分ける。
Dockerfileでimageの作り方を説明する。
build contextと `.dockerignore` で、何をimageへ渡すかを制御する。
ComposeでappとDBのservice関係を記録する。
service名、port mapping、volume、environment variablesを分けて説明する。
`.env` の変数置換とcontainer内の環境変数、Dockerfileの `EXPOSE` とComposeの `ports` も分けて見る。

起動確認では、`up` したことだけで終わらない。
logs、ps、exec、画面表示、DB接続、migration、secret漏れを確認する。
`depends_on` は起動順の補助であり、利用可能状態はhealthcheck、ログ、アプリ側の接続確認で見る。
imageにsecretを入れないこと、必要以上にrootで実行しないこと、開発用portを本番相当に持ち込まないことも確認する。
local、staging、productionの差分を書けば、第16章のクラウドとCI/CDで何を設定すべきかが見えやすくなる。

### クラウドとCI/CDの章へ

次章では、この実行環境をクラウドとCI/CDへ接続する。
第15章で整理したruntime、Dockerfile、Compose、環境変数、secret、ログ、DB、portは、そのままクラウド構成とCI/CD設計の材料になる。
動かす場所が変わると、権限、secret管理、監視、rollback、cleanupも設計対象になる。

### 参考資料

- [Docker Docs: What is Docker?](https://docs.docker.com/get-started/docker-overview/)
- [Docker Docs: Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Docs: Build context](https://docs.docker.com/build/concepts/context/)
- [Docker Docs: Building best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker Docs: Define services in Docker Compose](https://docs.docker.com/reference/compose-file/services/)
- [The Twelve-Factor App](https://12factor.net/)
- [NIST SP 800-218: Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

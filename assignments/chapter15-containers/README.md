# 第15章 コンテナ ワークブック

このワークブックは、第15章の演習「実行前提を棚卸しする」「Dockerfile方針を書く」「ComposeでアプリとDBを起動する」「起動、ログ、トラブルシュートを記録する」「ローカルと本番の差分を書く」で使う。

## 使い方

この資料と、第5章で作成した `project-overview.md`、第10章で作成した `schema-draft.sql`、第14章で作成した `secrets-and-dependencies-check.md` を読み、`runtime-requirements.md`、`dockerfile-note.md`、`compose-services.md`、`container-run-log.md`、`environment-differences.md` を書く。

目的は、Dockerコマンドを暗記することではない。アプリが何を前提に動くかを整理し、アプリとDBを再現可能に起動し、ログを見て問題を切り分け、ローカルと本番の差分を説明できるようにすることである。

## 前提

研修用学習ログアプリに、次の機能が入っている。

```txt
メンターが、担当受講者の支援ステータスを一覧で確認し、必要に応じて変更できる。
```

この章では、アプリとDBをDocker Composeで起動する。

標準題材として、このリポジトリの `starter-apps/learning-log-sample` に `Dockerfile` と `compose.yaml` を用意している。

扱うこと:

- Dockerfile
- Docker Compose
- appサービス
- dbサービス
- environment variables
- volume
- logs
- localとproductionの差分

扱わないこと:

- Kubernetes
- AWSへのデプロイ
- ECS、EKSなどの実行基盤
- 本番インフラ設計

## 演習1: 実行前提を棚卸しする

### 考えること

DockerfileやComposeを書く前に、アプリが動くために必要なものを整理する。

問い:

- ランタイムは何か。
- package managerは何か。
- 依存関係ファイルとlock fileは何か。
- install、build、start commandは何か。
- DBは何を使うか。
- appとDBはどの環境変数で接続するか。
- 公開するportは何か。
- 永続化するデータは何か。

### 記録すること

`runtime-requirements.md` は次の形で書く。

```md
# 実行要件

## アプリ

| 項目 | 値 | メモ |
| --- | --- | --- |
| ランタイム |    |    |
| package manager |    |    |
| dependency file |    |    |
| lock file |    |    |
| インストールコマンド |    |    |
| ビルドコマンド |    |    |
| 起動コマンド |    |    |
| app port |    |    |

## データベース

| 項目 | 値 | メモ |
| --- | --- | --- |
| DB type |    |    |
| DB image |    |    |
| DB port |    |    |
| persistent data |    |    |

## 環境変数

| 名前 | 必須 | 秘密情報 | 例 |
| --- | --- | --- | --- |
| DB_HOST | はい | いいえ | db |
| DB_USER | はい | いいえ | app |
| DB_PASSWORD | はい | はい | dummy-password |
| DB_NAME | はい | いいえ | bootcamp |
| APP_PORT | はい | いいえ | 3000 |

## 開発用に必要なこと

- 

## 本番相当で確認したいこと

- 
```

## 演習2: Dockerfile方針を書く

### 考えること

Dockerfileの役割と、imageに含めるもの、含めないものを整理する。

問い:

- base imageは何を使うか。
- dependency installはどこで行うか。
- build stepは必要か。
- 起動commandは何か。
- `.dockerignore` に何を入れるか。
- build時に必要な値とrun時に必要な値は何か。
- imageに秘密情報が入らないか。

### 記録すること

`dockerfile-note.md` は次の形で書く。

````md
# Dockerfileメモ

## 方針

- 

## Dockerfileのたたき台

```dockerfile
# 研修用のたたき台。実際の実行環境やコマンドはプロジェクトに合わせて調整する。
FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## .dockerignoreに入れるもの

- .git
- node_modules
- .env
- coverage
- tmp
- logs

## ビルド時に必要な値

- 

## 実行時に必要な値

- 

## イメージに入れてはいけないもの

- 

## 判断が必要なこと

- 
````

## 演習3: ComposeでアプリとDBを起動する

### 考えること

appとDBをserviceとして定義し、接続できるようにする。

問い:

- サービス名は何にするか。
- appはどのportを公開するか。
- appはDBへどのホスト名で接続するか。
- DBのデータはどのvolumeに保存するか。
- `.env` と `.env.example` をどう使うか。
- DBが起動する前にappが接続しようとした場合、どう扱うか。

### 記録すること

`compose-services.md` は次の形で書く。

````md
# Composeサービス

## サービス構成

| サービス | 役割 | ポート | volume | メモ |
| --- | --- | --- | --- | --- |
| app | Web app | 3000 |    |    |
| db | Database | 5432 | db-data |    |

## compose.yamlのたたき台

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

## .env.example

```txt
APP_PORT=3000
DB_USER=app
DB_PASSWORD=dummy-password
DB_NAME=bootcamp
```

## 注意

- `.env` はGitにcommitしない。
- DB passwordは演習用のdummy値にする。
- 本番のsecret管理は第16章で扱う。
- DB imageやversionは、研修用サンプルに合わせて調整する。
````

## 演習4: 起動、ログ、トラブルシュートを記録する

### 考えること

Composeで起動し、状態とログを確認する。問題があれば、勘ではなく観察結果から切り分ける。

確認すること:

- appサービスが起動しているか。
- dbサービスが起動しているか。
- appからDBへ接続できているか。
- portが競合していないか。
- 環境変数が渡っているか。
- migrationやseedが必要か。
- logに秘密情報が出ていないか。

> 共通サンプルアプリ `learning-log-sample` は、アプリ層ではDBに接続せずインメモリデータで動く（Compose に db を含むのは演習用）。「appからDBへ接続できているか」は、自分のプロジェクトでDBを使う場合の観点として確認する。

### 記録すること

`container-run-log.md` は次の形で書く。

```md
# コンテナ実行ログ

## 起動

コマンド:

- 

結果:

- 

## サービス状態

| サービス | ステータス | メモ |
| --- | --- | --- |
| app |    |    |
| db |    |    |

## ログ

| サービス | 確認済み | 結果 |
| --- | --- | --- |
| app |    |    |
| db |    |    |

## コンテナ内の確認

- 環境変数:
- DB接続:
- migration:

## 起きた問題

| 問題 | observation | cause | fix |
| --- | --- | --- | --- |
|    |    |    |    |

## 秘密情報チェック

- 

## 次に直すこと

- 
```

## 演習5: ローカルと本番の差分を書く

### 考えること

ローカルで動いた設定を、そのまま本番に持ち込んでよいとは限らない。第16章でAWSに進む前に、差分を整理する。

比較する観点:

- build
- source code
- environment variables
- secrets
- database
- volume
- logs
- port
- domain
- TLS
- migration
- backup

### 記録すること

`environment-differences.md` は次の形で書く。

```md
# 環境差分

## 比較

| 項目 | local | staging | production | メモ |
| --- | --- | --- | --- | --- |
| image |    |    |    |    |
| source code |    |    |    |    |
| environment variables |    |    |    |    |
| secrets |    |    |    |    |
| database |    |    |    |    |
| volume |    |    |    |    |
| logs |    |    |    |    |
| ポート |    |    |    |    |
| domain |    |    |    |    |
| TLS |    |    |    |    |

## 第16章で確認すること

- 

## 本番に持ち込まないもの

- 

## 残した課題

- 
```

## AIを使う場合

AIに頼んでよいこと:

- 実行前提の棚卸し
- Dockerfile案
- `.dockerignore` 案
- Compose案
- 起動失敗ログの原因候補
- ローカルと本番の差分整理
- 秘密情報を入れないためのチェックリスト

AIに任せたままにしてはいけないこと:

- `.env` やsecretの中身を貼ること
- 実行せずに動いたことにすること
- 古いDocker Compose記法の採用
- ランタイム、パッケージマネージャー、ポート、DBイメージの前提判断
- 本番クラウド設定の確定

AIへの依頼例:

```txt
研修用WebアプリをDocker Composeで起動する構成案を作ってください。

前提:
- appサービスとdbサービスがある
- appはDB_HOST, DB_USER, DB_PASSWORD, DB_NAMEを使う
- DBデータはvolumeで永続化する
- .envはGitにcommitしない
- Kubernetesは扱わない
- 第16章でAWSに進むので、本章ではローカル起動と環境差分の説明に集中する

出してほしいこと:
- runtime-requirements.md の観点
- Dockerfile方針
- compose-services.md のたたき台
- 起動確認コマンド
- ログ確認とトラブルシュート観点
- 秘密情報を含めないための注意
```

## チェックリスト

提出前に確認する。

- [ ] `runtime-requirements.md` にランタイム、依存関係、ビルド、起動、DB、ポート、環境変数がある
- [ ] `dockerfile-note.md` にベースイメージ、インストール、ビルド、起動、`.dockerignore` がある
- [ ] imageに秘密情報を入れない方針がある
- [ ] `compose-services.md` にapp、db、port、volume、environment、service間接続がある
- [ ] `.env` と `.env.example` の扱いが分かれている
- [ ] `container-run-log.md` に起動コマンド、ログ、確認結果、トラブルシュートがある
- [ ] `environment-differences.md` にlocal、staging、productionの差分がある
- [ ] KubernetesやAWSの詳細に入りすぎていない
- [ ] AIを使った場合、実行結果、ログ、公式ドキュメントで検証している

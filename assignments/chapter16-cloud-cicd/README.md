# 第16章 クラウドとCI/CD ワークブック

このワークブックは、第16章の演習「AWS構成を役割で整理する」「CIワークフローを設計する」「CDワークフローを設計する」「環境変数と秘密情報を整理する」「リリース手順書を書く」で使う。

## 使い方

この資料と、第13章で作成したテスト観点、第14章で作成した `secrets-and-dependencies-check.md`、第15章で作成した `runtime-requirements.md`、`dockerfile-note.md`、`compose-services.md`、`container-run-log.md`、`environment-differences.md` を読み、`aws-architecture-note.md`、`ci-workflow-note.md`、`cd-workflow-note.md`、`cloud-config-and-secrets.md`、`release-runbook.md` を書く。

目的は、AWSサービス名やGitHub ActionsのYAMLを暗記することではない。テスト済みの変更をAWSへ届け、確認し、必要なら戻す流れを説明できるようにすることである。

## 前提

研修用学習ログアプリに、次の機能が入っている。

```txt
メンターが、担当受講者の支援ステータスを一覧で確認し、必要に応じて変更できる。
```

第15章までに、アプリとDBをDocker Composeで起動できている。

この章では、AWSを標準クラウド環境にする。

ローカルでCI/CD、health check、スモークテストを練習する場合は、このリポジトリの `starter-apps/ops-observability-sample` を使ってよい。

標準構成:

- GitHub Actions
- AWS IAM OIDC provider
- IAM role
- Amazon ECR
- Amazon ECS（Fargate 起動タイプ）
- Amazon RDS for PostgreSQL
- Secrets Manager または Parameter Store
- CloudWatch Logs

研修標準は Amazon ECS（Fargate 起動タイプ）とする。外部公開は学習用の最小構成として、Fargate タスクに public IP を割り当てて直接公開する（awsvpc ネットワークモード + assignPublicIp=ENABLED + security group で必要 port を許可）。これは学習用であり本番では非推奨で、本番ではタスクの正面に ALB（Application Load Balancer）を置き、HTTPS終端・ヘルスチェック・複数タスクへの分散を担うのが定石である。

扱わないこと:

- Kubernetes
- EKS
- ECS/Fargateの詳細
- Terraform、AWS CDK、CloudFormationの詳細
- VPC設計の深掘り
- 本格的なblue-green デプロイやcanary release

## 演習1: AWS構成を役割で整理する

### 考えること

AWSサービス名から始めるのではなく、自分のアプリに必要な役割から整理する。

問い:

- アプリを実行する場所はどこか。
- コンテナイメージを置く場所はどこか。
- DBはどこに置くか。
- 秘密情報はどこに置くか。
- ログはどこで見るか。
- GitHub Actionsは何を担当するか。
- stagingとproductionで分けるべきものは何か。
- 作成したAWS resourceをどう削除するか。

### 記録すること

`aws-architecture-note.md` は次の形で書く。

```md
# AWS構成メモ

## この章の標準構成

| 役割 | AWS/GitHubサービス | 環境 | メモ |
| --- | --- | --- | --- |
| CI/CD | GitHub Actions | shared |    |
| AWS auth | IAM OIDC provider / IAM role | shared |    |
| image registry | Amazon ECR | shared or per environment |    |
| Webアプリのランタイム | Amazon ECS（Fargate 起動タイプ） | staging / production |    |
| database | Amazon RDS for PostgreSQL | staging / production |    |
| config | ECS task definition の環境変数 | staging / production |    |
| secrets | Secrets Manager / Parameter Store | staging / production |    |
| logs | CloudWatch Logs | staging / production |    |

## 環境ごとの差分

| 項目 | local | staging | production |
| --- | --- | --- | --- |
| アプリのランタイム | Docker Compose | ECS（Fargate） | ECS（Fargate） |
| データベース | localコンテナ | RDS | RDS |
| secrets | .env |    |    |
| domain | localhost |    |    |
| logs | terminal | CloudWatch Logs | CloudWatch Logs |
| deploy trigger | manual |    |    |

## リソース命名

- app:
- ECRリポジトリ:
- ECS cluster / service（Fargate）:
- rds:
- 秘密情報 path:

## コストと後片付け

- 作成前に確認すること:
- 終了後に削除するもの:
- 残してよいもの:

## 判断が必要なこと

- 
```

## 演習2: CIワークフローを設計する

### 考えること

デプロイ前に何を検証するかを決める。

問い:

- PR時に何を実行するか。
- main merge時に何を実行するか。
- lint、type check、test、buildのうち何が必要か。
- Docker image buildはPR時にも行うか。
- workflowが失敗したら何を止めるか。
- テスト結果をどこに記録するか。

### 記録すること

`ci-workflow-note.md` は次の形で書く。

````md
# CIワークフローメモ

## CIの目的

- 

## PR時に実行すること

| 手順 | コマンド | 必須 | メモ |
| --- | --- | --- | --- |
| install |    | はい |    |
| lint |    |    |    |
| type check |    |    |    |
| test |    | はい |    |
| ビルド |    |    |    |
| docker build |    |    |    |

## mainマージ時に実行すること

| 手順 | コマンド | 必須 | メモ |
| --- | --- | --- | --- |
| install |    | はい |    |
| test |    | はい |    |
| ビルド |    | はい |    |
| docker build |    | はい |    |

## GitHub Actionsのたたき台

```yaml
name: ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: ランタイムを設定する
        run: echo "ここでランタイムを設定する"
      - name: Install dependencies
        run: echo "ここでインストールコマンドを実行する"
      - name: Run tests
        run: echo "ここでテストコマンドを実行する"
      - name: Build
        run: echo "ここでビルドコマンドを実行する"
```

## 失敗時に止めること

- 

## AIに確認させたこと

- 

## 公式ドキュメントで確認したこと

- 
````

## 演習3: CDワークフローを設計する

### 考えること

main merge後、または手動実行で、検証済みの変更をAWSへ届ける流れを設計する。

問い:

- AWSへ接続するIAM roleは何か。
- GitHub Actionsが借りるdeploy roleと、ECSタスクに紐づくtask execution roleをどう分けるか。
- deploy roleには、ECR push、ECS更新に加えて、taskにtask execution roleを渡す `iam:PassRole` が要る。これをどう書くか。
- GitHub ActionsのOIDC設定はどうするか。
- イメージタグは何を使うか。
- ECR repositoryは何か。
- ECS service（Fargate）はstagingとproductionで分けるか。
- production deployにmanual approvalを入れるか。
- デプロイ後に何を確認するか。
- 最小公開ではtaskにpublic IPを直接割り当てる。taskが入れ替わるとpublic IPも変わるため、スモークテストの前に現在の接続先（実行中taskのpublic IP / port）をどう確認するか。

### 記録すること

`cd-workflow-note.md` は次の形で書く。

````md
# CDワークフローメモ

## CDの目的

- 

## AWS認証

| 項目 | 値 | メモ |
| --- | --- | --- |
| AWS account |    | account idは公開資料に書かない |
| region |    |    |
| deploy role（GitHub Actionsが借りる） |    | OIDCで借りるrole。task execution roleとは分ける |
| task execution role（ECSタスクに紐づく） |    | ECR pull / CloudWatch Logs出力 |
| OIDC provider | GitHub Actions |    |
| 許可するリポジトリ |    |    |
| 許可するブランチ/環境 |    |    |

## deploy roleに許可する操作（最小権限）

| 操作 | 何のため | メモ |
| --- | --- | --- |
| ECR push |    | imageをECRへ送る |
| ECS更新（task definition登録 + service更新） |    | 新revisionを登録しserviceを更新する（ローリング更新） |
| iam:PassRole |    | taskにtask execution roleを渡すために必要 |
| logs参照 |    | 必要な範囲だけ |

## イメージタグ方針

- コミットSHA:
- release tag:
- latestを使うか:

## CDワークフローのたたき台

```yaml
name: deploy-staging

on:
  push:
    branches:
      - main

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::<AWS_ACCOUNT_ID>:role/<ROLE_NAME>
          aws-region: <AWS_REGION>

      - name: Build image
        run: echo "docker build -t app:${GITHUB_SHA} ."

      - name: Push image to ECR
        run: echo "Login, tag, and push image to ECR"

      - name: Deploy to ECS
        run: echo "新しいtask definitionを登録し、ECS service（Fargate）を更新する（ローリング更新）"

      - name: Smoke test
        run: echo "Call health endpoint"
```

## ステージングデプロイ

- trigger:
- target:
- verification:

## 本番デプロイ

- trigger:
- approval:
- target:
- verification:

## ロールバック方針

- 直前のイメージタグ:
- 戻せない変更:
- 誰に知らせるか:

## 公式ドキュメントで確認したこと

- 
````

## 演習4: 環境変数と秘密情報を整理する

### 考えること

`.env` をそのまま本番に持ち込まない。通常の設定値と秘密情報を分け、環境ごとに管理場所を決める。

問い:

- secretではない設定値は何か。
- 秘密情報は何か。
- GitHub Actionsだけが使う値は何か。
- ECS task（コンテナ）が使う値は何か。
- RDS接続情報をどこに置くか。
- AI、ログ、PR、issueに貼ってはいけない値は何か。

### 記録すること

`cloud-config-and-secrets.md` は次の形で書く。

```md
# クラウド設定と秘密情報

## 通常の環境変数

| 名前 | local | staging | production | 担当者 |
| --- | --- | --- | --- | --- |
| APP_ENV | local | staging | production |    |
| PORT | 4000 |    |    | ops-observability-sample は4000で起動する |
| LOG_LEVEL | debug | info | info |    |

## 秘密情報

| 名前 | local | stagingの場所 | productionの場所 | メモ |
| --- | --- | --- | --- | --- |
| DB_PASSWORD | .env |    |    |    |
| SESSION_SECRET | .env |    |    |    |

## GitHub Actionsで使う値

| 名前 | 場所 | 秘密情報 | メモ |
| --- | --- | --- | --- |
| AWS_ROLE_ARN |    | いいえ | account idは公開資料に書かない |
| AWS_REGION |    | いいえ |    |

## ECS task（コンテナ）で使う値

| 名前 | 出典 | 秘密情報 | メモ |
| --- | --- | --- | --- |
| DB_HOST | task definition の環境変数 | いいえ |    |
| DB_USER | task definition の環境変数 | いいえ |    |
| DB_PASSWORD | Secrets Manager / Parameter Store | はい |    |

## AI、ログ、PR、issueに貼らないもの

- 

## 判断が必要なこと

- 
```

## 演習5: リリース手順書を書く

### 考えること

デプロイはワークフロー実行だけでは終わらない。確認、連絡、ロールバック、後片付けまでを手順化する。

問い:

- デプロイ前に何を確認するか。
- デプロイ中に何を見るか。
- スモークテストの前に、現在の接続先（実行中taskのpublic IP / port）をどう確認するか。
- デプロイ後にどのURLを確認するか。
- health checkは何を確認するか（`/healthz` と `/readyz` の違いを含む）。
- ログはどこで見るか。
- rollbackする場合、どのイメージタグへ戻すか。
- migrationがある場合、戻せるか。
- 研修終了後に何を削除するか。

### 記録すること

`release-runbook.md` は次の形で書く。

```md
# リリース手順書

## 対象

- リポジトリ:
- app:
- environment:
- release version:
- イメージタグ:

## デプロイ前チェック

- [ ] CIが通っている
- [ ] 対象branch / tagが正しい
- [ ] migrationの有無を確認した
- [ ] secret変更の有無を確認した
- [ ] rollback候補を確認した
- [ ] costや作業時間の制約を確認した

## デプロイ手順

1. 
2. 
3. 

## デプロイ後チェック

- [ ] ECS service（Fargate）のタスクがrunning
- [ ] 現在の接続先を確認した（実行中taskのENI → public IP / port）
- [ ] health endpointが成功する
- [ ] 主要画面が表示される
- [ ] DB接続が成功する
- [ ] CloudWatch Logsに重大なerrorがない
- [ ] versionまたはcommit SHAを確認した

## 現在の接続先確認（スモークテストの前段）

最小公開ではtaskにpublic IPを直接割り当てるため、taskが入れ替わるとpublic IPも変わる。スモークテストの前に、ECS serviceの実行中taskからENI（ネットワークインターフェース）をたどり、現在のpublic IPとportを確認する。

| 項目 | 値 | メモ |
| --- | --- | --- |
| 確認時刻 |    |    |
| 実行中task |    | service名やtask IDで特定 |
| public IP / port |    | account idや実URLは公開資料に書かない |

## スモークテスト

実行したURL、時刻、結果を残す。

| 確認 | 期待結果 | 実行時刻 | 対象URL | 結果 | メモ |
| --- | --- | --- | --- | --- | --- |
| `/healthz` | 200 |    |    |    | processが応答できるか |
| `/readyz` | 200 |    |    |    | requestを受ける準備ができているか |
| support status list | displayed |    |    |    |    |
| update status | success |    |    |    |    |

## ロールバック

| 項目 | value |
| --- | --- |
| previous イメージタグ |    |
| ロールバックコマンドまたは手順 |    |
| rollbackできない変更 |    |
| 連絡先 |    |

## 後片付け

- [ ] 不要なECS service / cluster（Fargate）を削除した
- [ ] 不要なRDS instanceを削除した
- [ ] 不要なECR imageを整理した
- [ ] 不要なsecret/parameterを削除した
- [ ] logs保存方針を確認した

## 振り返り

- 良かったこと:
- 詰まったこと:
- 次に改善すること:
```

## AIを使う場合

AIに頼んでよいこと:

- AWS構成案
- CI workflow案
- CD workflow案
- ECS（Fargate）、ECR、RDSの接続観点
- OIDC設定の確認観点
- IAM policyのレビュー観点
- release 手順書の観点
- deploy失敗ログの原因候補
- rollback時の確認観点

AIに任せたままにしてはいけないこと:

- AWSアクセスキー、シークレットアクセスキー、セッショントークンを貼ること
- DB password、API key、session 秘密情報を貼ること
- AWSアカウントIDや内部URLを公開資料に書くこと
- 実行せずにdeployできたことにすること
- 広すぎるIAM権限をそのまま採用すること
- 古いGitHub Actionsや古いAWS CLI例をそのまま採用すること
- costや後片付けを無視すること

AIへの依頼例:

```txt
研修用WebアプリをAWSへデプロイするCI/CD構成案を作ってください。

前提:
- 第15章でDockerfileとDocker Composeを作成済み
- 標準クラウド環境はAWS
- デプロイ先はAmazon ECS（Fargate 起動タイプ）。学習用の最小構成として、タスクに public IP を割り当てて直接公開する（本番非推奨。本番は正面に ALB を置く）
- コンテナイメージはAmazon ECRに置く
- DBはAmazon RDS for PostgreSQLを想定
- GitHub ActionsからAWSへはOIDCで接続する
- Kubernetes、EKS、ECS/Fargateの詳細、Terraform/CDKの詳細は扱わない
- stagingとproductionを分ける

出してほしいこと:
- aws-architecture-note.md の観点
- ci-workflow-note.md のたたき台
- cd-workflow-note.md のたたき台
- cloud-config-and-secrets.md の観点
- release-runbook.md の観点
- 公式ドキュメントで確認すべき箇所
- 権限、秘密情報、cost、ロールバックの注意点
```

## チェックリスト

提出前に確認する。

- [ ] `aws-architecture-note.md` にGitHub Actions、ECR、ECS（Fargate）、RDS、secrets、logsの役割がある
- [ ] stagingとproductionの違いが書かれている
- [ ] `ci-workflow-note.md` にPR時とmain merge時の検証内容がある
- [ ] `cd-workflow-note.md` にOIDC、IAMロール、イメージタグ、ECR push、ECSデプロイ（task definition更新 + service更新）、スモークテストがある
- [ ] 長期アクセスキーを標準にしていない
- [ ] `cloud-config-and-secrets.md` に通常値とsecretの分離がある
- [ ] 秘密情報をGit、ログ、AI、PR、issueに貼らない方針がある
- [ ] `release-runbook.md` にデプロイ前、デプロイ中、デプロイ後、ロールバック、後片付けがある
- [ ] Kubernetes、EKS、ECS/Fargate、Terraform/CDKの詳細に入りすぎていない
- [ ] AIを使った場合、公式ドキュメント、実行結果、ログで検証している

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

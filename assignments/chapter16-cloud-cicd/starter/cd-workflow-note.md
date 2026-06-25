# CDワークフローメモ

## CDの目的

- 

## AWS認証

| 項目 | 値 | メモ |
| --- | --- | --- |
| AWS account |    | account idは公開資料に書かない |
| region |    |    |
| IAM role |    |    |
| OIDC provider | GitHub Actions |    |
| 許可するリポジトリ |    |    |
| 許可するブランチ/環境 |    |    |

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

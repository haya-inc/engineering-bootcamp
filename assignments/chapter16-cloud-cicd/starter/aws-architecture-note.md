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

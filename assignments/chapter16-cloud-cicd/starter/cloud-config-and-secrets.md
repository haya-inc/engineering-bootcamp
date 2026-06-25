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

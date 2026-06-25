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
    image: postgres:18
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

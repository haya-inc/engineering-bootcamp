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

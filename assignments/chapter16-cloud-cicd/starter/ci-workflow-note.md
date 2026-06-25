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
      - uses: actions/checkout@v4
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

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

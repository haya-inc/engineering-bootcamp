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

- [ ] App Runner serviceがrunning
- [ ] health endpointが成功する
- [ ] 主要画面が表示される
- [ ] DB接続が成功する
- [ ] CloudWatch Logsに重大なerrorがない
- [ ] versionまたはcommit SHAを確認した

## スモークテスト

| 確認 | 期待結果 | 結果 | メモ |
| --- | --- | --- | --- |
| health | 200 |    |    |
| support status list | displayed |    |    |
| update status | success |    |    |

## ロールバック

| 項目 | value |
| --- | --- |
| previous イメージタグ |    |
| ロールバックコマンドまたは手順 |    |
| rollbackできない変更 |    |
| 連絡先 |    |

## 後片付け

- [ ] 不要なApp Runner serviceを削除した
- [ ] 不要なRDS instanceを削除した
- [ ] 不要なECR imageを整理した
- [ ] 不要なsecret/parameterを削除した
- [ ] logs保存方針を確認した

## 振り返り

- 良かったこと:
- 詰まったこと:
- 次に改善すること:

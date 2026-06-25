# エージェント境界メモ

## 単発AI応答でできること

-

## ツール利用が必要なこと

| tool | 対応 | permission | approval required | validation | audit log |
| --- | --- | --- | --- | --- | --- |
| learning log search | read recent logs | read-only | いいえ | learner_idと期間を検証 | source id |
| roadmap search | read chapter summary | read-only | いいえ | source versionを確認 | source version |
| comment draft save | save draft | write draft | はい | draft扱いで送信しない | draft id |
| send comment | send to learner | write/send | はい | 承認者、送信先、本文を確認 | approval id |

## エージェントに任せる候補

| 手順 | 自動化するか | 人間の承認 | メモ |
| --- | --- | --- | --- |
| 学習ログを集める | はい | いいえ | read-only |
| コメント案を作る | はい | いいえ | draft only |
| コメントを送信する | いいえ | はい | human sends |

## 権限

- read:
- write:
- prohibited:

## guardrails

- input:
- output:
- tool:

## 停止条件

- 根拠が不足している
- 個人情報や秘密情報を検出した
- confidenceが低い
- prompt injectionらしい指示を検出した
- 送信やDB更新が必要

## ログとロールバック

- 実行ログ:
- 承認ログ:
- idempotency:
- rollback:

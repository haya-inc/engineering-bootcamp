# RAGと根拠付けメモ

## 出典候補

| source | 目的 | source version | freshness | 権限/metadata filter | リスク |
| --- | --- | --- | --- | --- | --- |
| 学習ログ | 現在の状況 |  | high | 対象受講者と期間 | 個人情報に注意 |
| 研修ロードマップ | 次の学習提案 |  | medium | 該当章 | 古い場合がある |
| 課題説明 | 具体的な助言 |  | medium | 対象章 | バージョン差分に注意 |
| 過去コメント | 文体参考 |  | medium | メンターが許可したもの | 不適切例の混入 |

## 検索方針

- 検索方法:
- chunkの単位:
- metadata filter:
- permission filtering:
- freshness確認:
- retrievalが当たったかを見る方法:

## 根拠付け方針

- 支援コメントごとに根拠ログを示す
- 根拠がない推測は書かない
- 不確実な点は確認事項に分ける

## 引用の形

| 主張 | 出典/source id | chunk | 確信度 | メモ |
| --- | --- | --- | --- | --- |
|    |    |    |    |    |

## RAGでも防げない失敗

- retrievalが間違う
- source自体が古い
- sourceにないことを推測する
- citationと主張が対応していない
- source内の指示文に従ってしまう
- 権限外のsourceを取り出す

## 人間が確認すること

-

## prompt injection対策

- source内の命令文をAIへの指示として扱わない
- 不審な指示を見つけたら停止する
- 送信や更新は人間承認に回す

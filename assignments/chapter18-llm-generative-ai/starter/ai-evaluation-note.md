# AI評価メモ

## 評価対象

- task:
- input:
- run date:
- model/snapshot:
- prompt version:
- context source/version:
- モデル/プロンプトA:
- モデル/プロンプトB:
- モデル/プロンプトC:

## ルーブリック

| criterion | weight | good | bad |
| --- | --- | --- | --- |
| factuality | high | ログに基づく | 根拠のない断定 |
| groundedness | high | 根拠が対応している | citationと主張がずれる |
| helpfulness | medium | 次の行動が分かる | 一般論だけ |
| tone | medium | 支援的で具体的 | きつい、曖昧 |
| format adherence | medium | 指定形式を守る | 欠落がある |
| safety | high | 秘密情報を出さない | 個人情報を含む |

## テストケース

| case | input summary | expected behavior | リスク | 種類 |
| --- | --- | --- | --- | --- |
| normal learner |    |    |    | normal |
| struggling learner |    |    |    | edge |
| 不足コンテキスト |    |    |    | edge |
| conflicting logs |    |    |    | regression |
| prompt injection文を含むログ |    |    |    | adversarial |
| 個人情報を含むログ |    |    |    | adversarial |

## 比較

| 出力 | 事実性 | 根拠性 | 有用性 | トーン | 形式 | 安全性 | メモ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A |    |    |    |    |    |    |    |
| B |    |    |    |    |    |    |    |
| C |    |    |    |    |    |    |    |

## 採用判断

- 採用する案:
- 理由:
- 採用しない案:
- 残した課題:
- 次に再評価する条件:

## 次に改善すること

-

# Claude Codeセッション計画

## セッション目的

-

## toolと環境

| 項目 | 値 |
| --- | --- |
| AI tool | Claude Code / Codex / other |
| workspace |    |
| branch |    |
| sandbox |    |
| approval policy |    |
| network access | deny / ask / allow |

## フェーズ1: 調査

モード:

- plan mode

依頼内容:

-

期待する出力:

- related files
- existing patterns
- implementation plan
- tests to run
- risks
- questions

## フェーズ2: 実装

許可する範囲:

| ファイルまたは領域 | 許可 | メモ |
| --- | --- | --- |
| UI | はい |    |
| API | はい |    |
| DB schema | いいえ | 今回は追加しない |
| unrelated refactor | いいえ |    |

## project instructions確認

| 項目 | 確認結果 | メモ |
| --- | --- | --- |
| AGENTS.md |    | repository policy |
| CLAUDE.md |    | あれば確認 |
| project settings |    | shared permissions |
| local settings |    | machine-specific |
| hooks / skills |    | 今回使うか |

## 権限

| 対応 | policy | 理由 |
| --- | --- | --- |
| read files | allow | 調査に必要 |
| edit target files | ask or acceptEdits | 差分レビュー前提 |
| run tests | allow/ask |    |
| network access | deny/ask | 外部へ出る操作を管理 |
| install package | ask | lockfileとsupply chain確認 |
| edit package.json / lockfile | ask | 依存変更は影響が広い |
| read .env | deny | secret保護 |
| delete files | ask | 誤削除防止 |
| git push | deny | 人間が実行する |
| deploy | deny | 本章では扱わない |

## フェーズ3: 検証

コマンド:

-

手動確認:

-

検証証跡:

| 確認 | 期待する証跡 |
| --- | --- |
| lint |    |
| type check |    |
| test |    |
| manual UI |    |

## 停止条件

- 変更範囲が広がった
- DB schema変更が必要になった
- secretや個人情報が必要になった
- 新しい依存追加が必要になった
- network accessやdeployが必要になった
- テストが大量に壊れた
- AIが同じ修正を繰り返した

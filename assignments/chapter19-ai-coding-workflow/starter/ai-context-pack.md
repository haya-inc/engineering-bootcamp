# AIコンテキストパック

## 作業対象

-

## 読ませたいファイル

| ファイル | 理由 | メモ |
| --- | --- | --- |
| AGENTS.md |    | AI支援方針 |
| CLAUDE.md |    | あれば確認 |
|    |    |    |

## ワークスペース状態

| 項目 | 値 |
| --- | --- |
| branch |    |
| git status |    |
| 触ってよい既存変更 |    |
| 触ってはいけない既存変更 |    |

## 参考にしたい既存パターン

| パターン | 場所 | メモ |
| --- | --- | --- |
| filter UI |    |    |
| query parameter handling |    |    |
| API validation |    |    |
| テスト |    |    |

## 実行してよい確認コマンド

-

## 情報の分類

| 情報 | 分類 | 扱い |
| --- | --- | --- |
|    |    |    |

## 渡してはいけない情報

- .env
- secrets
- API keys
- production data
- personal data
- tokenやCookieの実値
- unrelated files

## AI coding agentへの調査依頼案

```txt
このリポジトリで、支援ステータス一覧の絞り込み機能を追加する前に、関連する既存実装を調査してください。

確認してほしいこと:
- 一覧画面の実装場所
- APIの実装場所
- query parameterやfilterの既存パターン
- テストの書き方
- 変更すべきファイル候補
- リスク

まだ編集はしないでください。調査結果と実装計画だけ出してください。
package追加、lockfile変更、network accessが必要なら、実行前に止めて理由を説明してください。
既存の未commit変更やunrelated filesは触らないでください。
```

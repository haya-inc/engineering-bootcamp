# Agent Guide

このリポジトリでAIが受講者を支援するときの方針です。
AIは講師やメンターの補助として使い、課題を丸ごと代筆するためには使いません。

## Canonical Sources

- 研修全体の入口、章構成、受講順、動画リンク: `README.md`
- ライセンス: `LICENSE`
- 貢献ルール: `CONTRIBUTING.md`
- 公開サイト: `site/`（Astro + Vite+ のソース。GitHub Actions でビルドして GitHub Pages に公開）
- テキスト資料入口: `textbook/README.md`
- テキスト資料本文: `textbook/book/` の章ファイル群（`textbook/book/README.md` が索引）
- テキスト資料配布版: `textbook/book.html`, `textbook/book.pdf` があれば `textbook/book/` から作られた派生物として扱う
- 動画台本: `video-scripts/*.md`
- 課題文: `assignments/chapterXX-*/README.md`
- 章別starter: `assignments/chapterXX-*/starter/`
- 共通スターターアプリ: `starter-apps/`

初期調査で読まなくてよいもの:

- `node_modules/`
- `.git/`
- `.DS_Store`
- `assignments/**/submission/<github-account>/` 以外の他人の提出物
- 生成物、ログ、キャッシュ

## Learning Support Policy

- 受講者には日本語で、初学者にも追える言い方で説明する。
- 専門用語は初出時に短く定義し、日常の操作や課題の文脈につなげる。
- 課題では、まず目的、前提、観察結果、確認したことを受講者に整理させる。
- 提出物の最終文面を丸ごと作る前に、受講者が自分で埋めるべき判断、根拠、検証結果を問い返す。
- 答えを示す場合も、なぜそう言えるか、どのファイルや実行結果に基づくかを添える。
- AIの提案は作業仮説として扱い、公式ドキュメント、リポジトリ内のREADME、実行結果、テストで確認する。

## Assignment Workflow

課題支援では、次の順番で確認する。

1. 該当章の `assignments/chapterXX-*/README.md` を読む。
2. 必要なら `video-scripts/chapterXX-*.md` と `textbook/README.md` の該当章を読む。
3. `starter/` や `starter-apps/` が指定されている場合は、そのREADMEを読む。
4. 受講者の提出ディレクトリは `assignments/chapterXX-*/submission/<github-account>/` とする。
5. 提出前に、課題READMEのチェックリスト、秘密情報、検証ログの有無を確認する。

他人の提出物を勝手に参照、編集、削除しない。
受講者の作業ファイルを編集する場合は、対象ファイルを明確にし、既存の記述を不用意に消さない。

## Code and Starter App Policy

- `starter-apps/learning-log-sample` と `starter-apps/ops-observability-sample` は研修用の最小アプリである。
- コード修正を支援する場合は、まず該当アプリの `README.md` と `package.json` を読む。
- 可能なら `npm test` を実行し、実行できない場合は理由を説明する。
- 動作確認、再現手順、期待結果、実際の結果を分けて記録させる。
- 依存関係や設定を変更するときは、課題の目的に必要な範囲に絞る。
- `site/`（公開サイト）は Node 26 / Bun / Vite+（alpha）/ Astro / 先端CSS を使う、最新技術ショーケースを兼ねた構成である。これは「最小・安定」方針の**意図的な例外**であり、starter-apps や本番テンプレートとして模倣しない。受講者が学ぶ判断基準は教材本文（安定・小さく戻れる・公式で検証）であることを崩さない。

## Secret and Privacy Policy

- APIキー、パスワード、トークン、Cookie、秘密鍵、実在の顧客情報、個人情報をコミットしない。
- `.env` は作らせてもよいが、公開リポジトリには含めない。
- `.env.example` には実在の秘密情報（パスワード、APIキー、トークン等）を入れず、変数名・用途と、必要なら非機密のサンプル値（例: `dummy-password`）を書く。
- AIに外部サービスのログや社外秘の仕様を貼るよう促さない。

## Public Repository Policy

- このリポジトリは外部公開を前提にする。
- `LICENSE` はsource-availableだがopen sourceではない方針である。利用許可範囲を広げる提案、再配布、派生物公開、商用利用、本番利用、AI学習利用を促す提案はしない。
- ローカルの絶対パス、社内だけで通じるリンク、未公開の秘密情報を追加しない。
- 動画、台本、テキスト、課題の対応が崩れる変更をした場合は、`README.md` のチャプター一覧も更新する。
- 章を追加、削除、改名した場合は、`video-scripts/README.md` と `assignments/README.md` の導線も確認する。
- 公開サイトを更新した場合は、`site/` のビルド設定と `README.md` のGitHub Pages説明、`CONTRIBUTING.md` の報告ルールと矛盾しないか確認する。

## Review Checklist

公開前や提出支援後は、次を確認する。

- 受講者の成果物に、目的、観察、判断、検証結果が含まれているか。
- 課題READMEで求められたファイルが揃っているか。
- AIを使った場合、採用した提案、採用しなかった提案、検証方法が残っているか。
- コマンドを実行した場合、何を実行し、結果がどうだったかを説明できるか。
- 秘密情報や個人情報が含まれていないか。

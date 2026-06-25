# 学習ログサンプル

研修で使う小さなWebアプリです。第5〜8章ではローカル起動、HTTP観察、GitHub作業、デバッグの題材として使います。第9〜20章では、設計、DB、API、フロントエンド、テスト、セキュリティ、コンテナ、AIコーディング、技術文書の共通題材として使えます。

このサンプルは外部npmパッケージに依存しません。Node.js 18.18 以上があれば起動できます。

## クイックスタート

```bash
cd starter-apps/learning-log-sample
npm run dev
```

ブラウザで開きます。

```txt
http://localhost:3000
```

確認します。

```bash
npm test
curl http://localhost:3000/api/mentor/learners
```

## このアプリに含まれるもの

- メンター向け進捗一覧画面
- `GET /api/mentor/learners`
- `PATCH /api/mentor/learners/:learnerId/support-status`
- 第8章のデバッグ演習で使う未提出者フィルタの不具合
- 第10章のDB設計演習で使う `schema.sql`
- 第13章のテスト演習で拡張できる Node.js組み込みテスト
- 第15章のコンテナ演習で使う `Dockerfile` と `compose.yaml`

## 演習用の既知の不具合

未提出者フィルタには、第8章で調査・修正するための不具合が入っています。先に答えを見るのではなく、画面、Networkタブ、APIレスポンス、関連コード、テスト追加の順に確認してください。

## API

担当受講者一覧:

```bash
curl http://localhost:3000/api/mentor/learners
curl "http://localhost:3000/api/mentor/learners?filter=unsubmitted"
curl "http://localhost:3000/api/mentor/learners?supportStatus=needs_support"
```

支援ステータス更新:

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "x-mentor-id: m-001" \
  -d '{"status":"needs_support","note":"次回のメンタリング枠で確認する。"}' \
  http://localhost:3000/api/mentor/learners/l-102/support-status
```

## Docker

```bash
docker compose up --build
```

アプリ:

```txt
http://localhost:3000
```

DBとコンテナの演習用にPostgreSQLを含めています。Nodeアプリはインメモリデータを使うため、前半の章ではDBセットアップなしで進められます。

## 章ごとの使い方

| 章 | 使い方 |
| --- | --- |
| 05 | 起動、ログ、プロジェクト構成の確認 |
| 06 | ブランチ、コミット、PRの練習 |
| 07 | URL、Networkタブ、curl、Cookie観察 |
| 08 | 未提出者フィルタの不具合調査と修正 |
| 09-13 | 支援ステータス機能の設計、API、UI、テスト |
| 14 | 認可、入力検証、秘密情報、依存関係確認 |
| 15 | Dockerfile、Compose、app/db起動 |
| 19-20 | AIコーディングワークフローと技術文書化 |

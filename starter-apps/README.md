# スターターアプリ

複数章で使う演習用アプリを置きます。

## 含まれるアプリ

| アプリ | 用途 | 起動 |
| --- | --- | --- |
| [`learning-log-sample`](learning-log-sample/README.md) | Web、DB、API、フロントエンド、テスト、セキュリティ、コンテナ、AIコーディング、文書化章で使うサンプルアプリ | `npm run dev` |
| [`ops-observability-sample`](ops-observability-sample/README.md) | クラウド、CI/CD、オブザーバビリティ、本番準備章で使う運用確認用アプリ | `npm run dev` |

## 簡易確認

```bash
cd starter-apps/learning-log-sample
npm test
```

```bash
cd starter-apps/ops-observability-sample
npm test
```

どちらも外部npmパッケージに依存しないため、Node.js 18.18 以上があれば起動できます。

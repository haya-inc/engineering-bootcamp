# 画面構造

## 見出し構造

- h1:
- h2:

## 一覧

形式:

- table / list / other:

理由:

- 

表示項目:

- 

## フォーム

| 入力 | ラベル | 説明 | エラー |
| --- | --- | --- | --- |
| supportStatus |    |    |    |
| supportNote |    |    |    |

## ボタン

| ボタン | 文言 | 有効条件 | 無効条件 |
| --- | --- | --- | --- |
| save |    |    |    |

## エラー表示

- 

## キーボード操作

- 

## 色だけに依存しないための工夫

- 

## HTMLのたたき台

```html
<section aria-labelledby="support-heading">
  <h1 id="support-heading">担当受講者の支援状況</h1>

  <label for="support-filter">支援ステータスで絞り込む</label>
  <select id="support-filter" name="supportStatus">
    <option value="">すべて</option>
    <option value="needs_support">要支援</option>
    <option value="in_progress">支援中</option>
    <option value="resolved">解決済み</option>
  </select>
</section>
```

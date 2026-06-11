# 株式会社公雅建設 ホームページ デザイン案（全10バリエーション）

`index.html` が一覧ページです。`v01/`〜`v10/` が各デザイン案で、すべて以下を搭載しています。

- レスポンシブ対応（スマホ／タブレット／PC）
- 施工実績（`vNN/js/works-data.js` を編集するだけで追加可能）
- お問い合わせフォーム（デモ動作。実送信は下記参照）
- 簡単見積もりツール（概算レンジを即時表示）
- Googleマップ埋め込み（府中本社・八王子拠点）

## 施工実績の追加方法
1. 写真を `vNN/images/` に入れる（例: `work7.jpg`）
2. `vNN/js/works-data.js` の配列に1件追加する:
   ```js
   { title: "○○工事", category: "足場仮設", place: "東京都○○市", date: "2026年6月", description: "説明文", image: "work7.jpg" },
   ```
   `image: ""` のままなら自動でプレースホルダー画像が表示されます。

## お問い合わせフォームの実送信化
静的サイトのためサーバーがありません。[Formspree](https://formspree.io/)（無料枠あり）等でフォームURLを取得し、
`vNN/js/main.js` 冒頭の `const CONTACT_ENDPOINT = "";` にそのURLを設定してください。

## GitHub Pages 公開手順
```powershell
gh auth login          # 初回のみ（ブラウザでGitHubにログイン）
.\publish.ps1          # リポジトリ作成 → push → Pages有効化まで自動
```
公開URL: `https://<GitHubユーザー名>.github.io/koga-kensetsu-hp/`

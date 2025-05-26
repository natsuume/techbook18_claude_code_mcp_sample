# Narou MCP Server

「小説家になろう」のAPIを利用して、Web小説を検索するMCP Serverの実装例です。

## 機能

- `search_novels`: キーワードやジャンルで小説を検索
- `get_ranking`: 日間・週間・月間などのランキングを取得

## セットアップ

### インストール

```bash
npm install
```

APIキーは不要です（公開APIを使用）。

## 実行方法

### 開発モード
```bash
npm run dev
```

### ビルドして実行
```bash
npm run build
npm start
```

### テスト実行（モック使用）
```bash
npm test
```

## Claude for Desktop設定例

`config.json`に以下のように追加：

```json
{
  "mcpServers": {
    "narou-server": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"]
    }
  }
}
```

## 使用例

Claudeで以下のような質問ができます：

- 「異世界転生の小説を検索して」
- 「ファンタジージャンルの人気作品を20件表示」
- 「今日のデイリーランキングTOP10を教えて」
- 「恋愛ジャンルの月間ランキングを見せて」

## ジャンル一覧

- 恋愛、異世界恋愛
- ファンタジー、ハイファンタジー、ローファンタジー
- 文芸、純文学、ヒューマンドラマ
- SF、VRゲーム
- ミステリー、ホラー

## ソート順

- `new`: 新着順
- `favnovelcnt`: ブックマーク数順（デフォルト）
- `reviewcnt`: レビュー数順
- `hyoka`: 総合評価順
- `impressioncnt`: 感想数順
- `daily`: 日間ポイント順
- `weekly`: 週間ポイント順
- `monthly`: 月間ポイント順

## API仕様

このサーバーは「小説家になろう」の公式APIを使用しています。
詳細は [公式APIドキュメント](https://dev.syosetu.com/man/api/) を参照してください。

## 注意事項

- APIへの過度なアクセスは避けてください
- 取得したデータの二次利用には注意してください
- サイトの利用規約を遵守してください
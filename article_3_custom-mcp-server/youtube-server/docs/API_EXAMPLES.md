# YouTube MCP Server API使用例

このドキュメントでは、YouTube MCP Serverの各機能の詳細な使用例とレスポンス形式を説明します。

## search_videos - 動画検索

### 基本的な使用例

```bash
claude -p "YouTubeで「TypeScript tutorial」を検索してください。" --allowedTools "youtube-server"
```

### パラメータ詳細

- **query** (必須): 検索キーワード
  - 例: "TypeScript tutorial", "React hooks", "Node.js入門"
- **maxResults** (オプション): 結果の最大数
  - 範囲: 1-50
  - デフォルト: 10

### レスポンス例

```json
[
  {
    "videoId": "BwuLxPH8IDs",
    "title": "TypeScript - The Basics",
    "description": "Learn the basics of TypeScript in this beginner tutorial...",
    "channelTitle": "Fireship",
    "publishedAt": "2022-05-12T16:00:10Z",
    "thumbnailUrl": "https://i.ytimg.com/vi/BwuLxPH8IDs/mqdefault.jpg",
    "videoUrl": "https://www.youtube.com/watch?v=BwuLxPH8IDs"
  },
  {
    "videoId": "d56mG7DezGs",
    "title": "TypeScript Tutorial for Beginners",
    "description": "This TypeScript tutorial for beginners covers basic concepts...",
    "channelTitle": "Programming with Mosh",
    "publishedAt": "2022-06-01T15:00:00Z",
    "thumbnailUrl": "https://i.ytimg.com/vi/d56mG7DezGs/mqdefault.jpg",
    "videoUrl": "https://www.youtube.com/watch?v=d56mG7DezGs"
  }
]
```

### 使用例バリエーション

1. **日本語での検索**
   ```bash
   claude -p "YouTubeで「React フック 入門」を5件検索してください。" --allowedTools "youtube-server"
   ```

2. **特定のトピックの検索**
   ```bash
   claude -p "Next.js 13のApp Routerについての動画を検索してください。" --allowedTools "youtube-server"
   ```

3. **プログラミング言語の比較動画**
   ```bash
   claude -p "Python vs JavaScript の比較動画を探してください。" --allowedTools "youtube-server"
   ```

## get_channel_videos - チャンネル動画取得

### 基本的な使用例

```bash
claude -p "チャンネルID UCXuqSBlHAE6Xw-yeJA0Tunwの最新動画を取得してください。" --allowedTools "youtube-server"
```

### パラメータ詳細

- **channelId** (必須): YouTubeチャンネルID
  - 形式: UC で始まる24文字の文字列
  - 例: "UCXuqSBlHAE6Xw-yeJA0Tunw" (Linus Tech Tips)
- **maxResults** (オプション): 結果の最大数
  - 範囲: 1-50
  - デフォルト: 10

### チャンネルIDの取得方法

1. YouTubeでチャンネルページにアクセス
2. URLを確認:
   - `https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw` → チャンネルID: `UCXuqSBlHAE6Xw-yeJA0Tunw`
   - カスタムURL (`@username`) の場合は、チャンネルページのソースコードから取得

### レスポンス例

```json
[
  {
    "videoId": "abc123def456",
    "title": "最新のテック製品レビュー",
    "description": "今週リリースされた新製品をレビューします...",
    "publishedAt": "2024-01-15T18:00:00Z",
    "thumbnailUrl": "https://i.ytimg.com/vi/abc123def456/mqdefault.jpg",
    "videoUrl": "https://www.youtube.com/watch?v=abc123def456"
  },
  {
    "videoId": "ghi789jkl012",
    "title": "新しいGPUのベンチマーク",
    "description": "最新のGPUパフォーマンステスト結果...",
    "publishedAt": "2024-01-14T17:00:00Z",
    "thumbnailUrl": "https://i.ytimg.com/vi/ghi789jkl012/mqdefault.jpg",
    "videoUrl": "https://www.youtube.com/watch?v=ghi789jkl012"
  }
]
```

### 人気チャンネルの例

| チャンネル名 | チャンネルID | 説明 |
|------------|-------------|------|
| Fireship | UCsBjURrPoezykLs9EqgamOA | Web開発の短い解説動画 |
| freeCodeCamp | UC8butISFwT-Wl7EV0hUK0BQ | プログラミングの長編チュートリアル |
| The Net Ninja | UCW5YeuERMmlnqo4oq8vwUpg | Web開発チュートリアル |
| Traversy Media | UC29ju8bIPH5as8OGnQzwJyA | プログラミング全般 |

### 使用例バリエーション

1. **特定数の動画取得**
   ```bash
   claude -p "Fireshipチャンネル（UCsBjURrPoezykLs9EqgamOA）の最新動画を3件だけ取得してください。" --allowedTools "youtube-server"
   ```

2. **チャンネル分析**
   ```bash
   claude -p "チャンネルID UC29ju8bIPH5as8OGnQzwJyAの最新20件の動画を取得して、どんなトピックを扱っているか分析してください。" --allowedTools "youtube-server"
   ```

## エラーレスポンス

### APIキーが無効な場合

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error searching videos: YouTube API error: Forbidden"
    }
  ],
  "isError": true
}
```

### チャンネルIDが無効な場合

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error fetching channel videos: YouTube API error: Not Found"
    }
  ],
  "isError": true
}
```

### API制限に達した場合

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error searching videos: YouTube API error: quotaExceeded"
    }
  ],
  "isError": true
}
```

## 実践的な使用シナリオ

### 1. 学習リソースの収集

```bash
# Next.js学習用の動画を集める
claude -p "以下のトピックについてYouTubeで動画を検索してください：
1. Next.js 14 tutorial
2. Next.js App Router
3. Next.js Server Components
それぞれ3件ずつ取得して、初心者向けの学習順序を提案してください。" --allowedTools "youtube-server"
```

### 2. トレンド分析

```bash
# 特定チャンネルの最近の投稿傾向を分析
claude -p "FireshipチャンネルのID UCsBjURrPoezykLs9EqgamOAの最新動画20件を取得して、
最近どんな技術トレンドを取り上げているか分析してください。" --allowedTools "youtube-server"
```

### 3. コンテンツキュレーション

```bash
# 特定言語の学習動画を収集
claude -p "以下の検索を行ってください：
1. 「Python初心者」で検索（5件）
2. 「Python Django tutorial」で検索（5件）
3. 「Python データ分析」で検索（5件）
結果をレベル別に整理してください。" --allowedTools "youtube-server"
```

## 注意事項

1. **API制限**: YouTube Data API v3には日次クォータがあります（デフォルト: 10,000ユニット/日）
2. **検索の精度**: 検索結果はYouTubeのアルゴリズムに依存します
3. **チャンネルID**: カスタムURL（@username）はチャンネルIDではありません
4. **レート制限**: 短時間に大量のリクエストを送信しないでください

## デバッグのヒント

1. **ログの確認**: エラー時は`console.error`出力を確認
2. **APIキーの検証**: Google Cloud Consoleで使用状況を確認
3. **レスポンス形式**: 常にJSON形式で返されることを期待してください
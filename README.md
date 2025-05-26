# Claude Code × MCP Server サンプルコード集

技術書典18出展書籍「Claude Code × MCP Server の手引き」のサンプルコードです。

## 📋 目次

- [概要](#概要)
- [プロジェクト構成](#プロジェクト構成)
- [第3章: カスタムMCPサーバー](#第3章-カスタムmcpサーバー)
- [第4章: 自律的活用事例](#第4章-自律的活用事例)
- [必要条件](#必要条件)
- [クイックスタート](#クイックスタート)
- [ライセンス](#ライセンス)

## 🎯 概要

このリポジトリには、Claude CodeとMCP (Model Context Protocol) Serverを活用した実践的なサンプルコードが含まれています。基本的なMCPサーバーの実装から、GitHub Actionsを使った自動化まで、幅広い用途をカバーしています。

## 📁 プロジェクト構成

```
techbook18_claude_code_mcp_sample/
├── article_3_custom-mcp-server/     # 第3章: カスタムMCPサーバー
│   ├── basic-implementation/        # 基本実装（文字列繰り返し）
│   ├── narou-server/               # 小説家になろうAPI連携
│   ├── recipe-server/              # レシピ検索（白ごはん.com）
│   └── youtube-server/             # YouTube Data API v3連携
└── article_4_autonomous-use-case/   # 第4章: 自律的活用事例
    ├── sample1-test-fixer/         # テスト自動修正アクション
    ├── sample2-discussion-bot/     # Discussion対話ボット
    └── sample3-doc-updater/        # ドキュメント自動更新
```

## 🔧 第3章: カスタムMCPサーバー

### basic-implementation
最小限のMCP Serverの実装例。文字列を指定回数繰り返すシンプルなツールを提供します。

**提供機能:**
- `repeat_string`: 文字列を指定回数繰り返す

**特徴:**
- MCPプロトコルの基本概念を理解するのに最適
- 完全なテストスイート付き
- TypeScript + Zodによる型安全な実装

### narou-server
「小説家になろう」のAPIを利用したMCP Server実装例。

**提供機能:**
- `search_novels`: キーワードやジャンルで小説を検索
- `get_ranking`: 日間・週間・月間ランキングを取得

**特徴:**
- 外部APIとの連携方法を学べる
- 豊富な検索オプション（ジャンル、ソート順など）
- APIキー不要（公開API使用）

### recipe-server
白ごはん.comからレシピ情報を取得するMCP Server実装例。

**提供機能:**
- `search_recipes`: キーワードでレシピを検索
- `get_recipe_details`: レシピの詳細情報を取得

**特徴:**
- Webスクレイピングの実装例
- キャッシュ機能付き（1時間）
- 教育目的のサンプル実装

### youtube-server
YouTube Data API v3を利用した動画検索MCP Server。

**提供機能:**
- `search_videos`: YouTube動画を検索
- `get_channel_videos`: 特定チャンネルの最新動画を取得

**特徴:**
- Google Cloud Platform連携
- 詳細なセットアップガイド付き
- 自動テストスクリプト完備

## 第4章: Claude Codeを自律的に動作させる


## ⚙️ 必要条件

- **Node.js**: 18以降
- **npm**: または yarn
- **Claude Code**: MCP Serverのテストに使用
- **TypeScript**: 開発環境

### 追加要件（プロジェクトによる）
- **Google Cloud Platform**: YouTube API使用時
- **Anthropic API Key**: GitHub Actions使用時

## 🚀 クイックスタート

### 1. リポジトリのクローン
```bash
git clone https://github.com/natsuume/techbook18_claude_code_mcp_sample.git
cd techbook18_claude_code_mcp_sample
```

### 2. 基本実装の試行
```bash
cd article_3_custom-mcp-server/basic-implementation
npm install
npm run build
npm test
```

### 3. Claude Codeでのテスト
```bash
# MCP Serverの追加
claude mcp add-json basic-server '{"type": "stdio", "command": "node", "args": ["dist/index.js"]}'

# テスト実行
claude -p "「Hello」を3回繰り返してください" --allowedTools "basic-server"

# クリーンアップ
claude mcp remove basic-server
```

## 📖 各プロジェクトの詳細

各サブディレクトリには独自のREADME.mdがあり、以下の情報が含まれています：

- 📋 **セットアップ手順**: 依存関係のインストールから実行まで
- 🔧 **開発コマンド**: ビルド、テスト、リントなど
- 📝 **使用例**: 実際の使用方法とサンプルクエリ
- ⚠️ **注意事項**: API制限、利用規約、セキュリティ考慮事項
- 🐛 **トラブルシューティング**: よくある問題と解決方法

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'Add amazing feature'`
4. ブランチにプッシュ: `git push origin feature/amazing-feature`
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはサンプル実装として提供されています。各サブプロジェクトの利用規約については、対応するREADME.mdを参照してください。

## 🔗 関連リンク

- [Claude Code ドキュメント](https://docs.anthropic.com/claude/docs/claude-code)
- [MCP (Model Context Protocol)](https://spec.modelcontextprotocol.io/)
- [技術書典18](https://techbookfest.org/event/tbf18)

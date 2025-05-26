# YouTube MCP Server

YouTube Data API v3を利用して動画検索を行うMCP (Model Context Protocol) Serverの実装例です。

## 目次

- [必要条件](#必要条件)
- [YouTube API Keyの取得](#youtube-api-keyの取得)
- [プロジェクトのセットアップ](#プロジェクトのセットアップ)
- [実行とテスト](#実行とテスト)
- [Claude Codeでのテスト](#claude-codeでのテスト)
- [Claude for Desktopでの設定](#claude-for-desktopでの設定)
- [トラブルシューティング](#トラブルシューティング)
- [プロジェクト構成](#プロジェクト構成)

## 必要条件

- Node.js 18以降
- npm または yarn
- Googleアカウント
- Claude Code (MCP Serverのテストに使用)

## YouTube API Keyの取得

### 1. Google Cloud Consoleへのアクセス

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセスし、Googleアカウントでログインします。

### 2. プロジェクトの作成

1. 画面上部のプロジェクトセレクタをクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を入力（例：`youtube-mcp-server`）
4. 「作成」をクリック

### 3. YouTube Data API v3の有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 検索バーに「YouTube Data API v3」と入力
3. 検索結果から「YouTube Data API v3」をクリック
4. 「有効にする」ボタンをクリック

### 4. APIキーの作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 「+ 認証情報を作成」→「APIキー」をクリック
3. 作成されたAPIキーが表示されます（後で使用するのでコピーしておく）

### 5. APIキーの制限（推奨）

1. 作成したAPIキーの右側の編集アイコンをクリック
2. 「アプリケーションの制限」で以下を設定:
   - **開発/テスト時**: 「なし」を選択
   - **本番環境**: 「IPアドレス」を選択（HTTPリファラーは使用不可）
3. 「API制限」で以下を設定:
   - **初回テスト時**: 「キーを制限しない」を選択
   - **動作確認後**: 「キーを制限」を選択し、「YouTube Data API v3」を追加
4. 「保存」をクリック

⚠️ **重要**: HTTPリファラー制限はサーバーサイドアプリケーションでは動作しません

## プロジェクトのセットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd youtube-server
```

### 2. 自動セットアップ（推奨）

#### Linux/Mac
```bash
./scripts/setup.sh
```

#### Windows (PowerShell)
```powershell
.\scripts\setup.ps1
```

このスクリプトは以下を自動的に実行します：
- Node.jsバージョンの確認
- 依存関係のインストール
- .envファイルの作成
- TypeScriptのビルド
- ESLintチェック
- テストの実行

### 3. 手動セットアップ

依存関係のインストール：
```bash
npm install
```

### 4. 環境変数の設定

#### 方法1: .envファイルを使用（推奨）

1. `.env.sample`をコピーして`.env`を作成:
   ```bash
   cp .env.sample .env
   ```

2. `.env`ファイルを編集してAPIキーを設定:
   ```
   YOUTUBE_API_KEY=your-actual-api-key-here
   ```

#### 方法2: 環境変数を直接設定

```bash
# Linux/Mac
export YOUTUBE_API_KEY="your-actual-api-key-here"

# Windows (PowerShell)
$env:YOUTUBE_API_KEY="your-actual-api-key-here"

# Windows (Command Prompt)
set YOUTUBE_API_KEY=your-actual-api-key-here
```

### 5. TypeScriptのビルド

```bash
npm run build
```

## 実行とテスト

### 開発モードでの実行

TypeScriptファイルを直接実行（ホットリロード対応）:
```bash
npm run dev
```

### プロダクションモードでの実行

ビルド済みのJavaScriptファイルを実行:
```bash
npm start
```

### ユニットテストの実行

モックデータを使用したテスト:
```bash
npm test
```

### ESLintの実行

コード品質チェック:
```bash
npm run lint

# 自動修正を行う場合
npm run lint:fix
```

## Claude Codeでのテスト

### 自動テストコマンド

プロジェクトには、Claude Codeで簡単にテストできるコマンドが用意されています:

```bash
npm run test:claude-code
```

このコマンドは以下を自動的に実行します:
1. MCP ServerをClaude Codeに追加
2. YouTubeで「TypeScript tutorial」を検索
3. 結果を表示
4. MCP Serverを削除

### 手動でのテスト

1. MCP Serverの追加:
   ```bash
   claude mcp add-json youtube-server '{"type": "stdio", "command": "tsx", "args": ["src/index.ts"]}'
   ```

2. 動画検索のテスト:
   ```bash
   claude -p "YouTubeで「React tutorial」を検索してください。" --allowedTools "youtube-server"
   ```

3. チャンネル動画の取得テスト:
   ```bash
   claude -p "チャンネルID UCXuqSBlHAE6Xw-yeJA0Tunwの最新動画を5件取得してください。" --allowedTools "youtube-server"
   ```

4. テスト後のクリーンアップ:
   ```bash
   claude mcp remove youtube-server
   ```

## Claude for Desktopでの設定

`claude_desktop_config.json`に以下を追加:

```json
{
  "mcpServers": {
    "youtube-server": {
      "command": "node",
      "args": ["<絶対パス>/dist/index.js"],
      "env": {
        "YOUTUBE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 提供される機能

### search_videos
YouTube動画を検索します。

パラメータ:
- `query` (string): 検索クエリ
- `maxResults` (number): 最大結果数（1-50、デフォルト: 10）

### get_channel_videos
特定のチャンネルの最新動画を取得します。

パラメータ:
- `channelId` (string): YouTubeチャンネルID
- `maxResults` (number): 最大結果数（1-50、デフォルト: 10）

## トラブルシューティング

### APIキーエラー

```
Error: YOUTUBE_API_KEY environment variable is required
```

**解決方法**: 
- `.env`ファイルが正しく設定されているか確認
- 環境変数が正しくエクスポートされているか確認

### API制限エラー

```
YouTube API error: Forbidden
```

**解決方法**:
- APIキーが有効化されているか確認
- APIキーの制限設定を確認
- Google Cloud Consoleで割り当て制限を確認

### TypeScriptビルドエラー

```
Cannot find module '@modelcontextprotocol/sdk'
```

**解決方法**:
```bash
npm install
npm run build
```

### ESLintエラー

テストファイルでESLintエラーが発生する場合:
- `eslint.config.mjs`の`ignores`セクションにテストファイルが含まれているか確認

## プロジェクト構成

```
youtube-server/
├── src/
│   └── index.ts          # メインサーバー実装
├── test/
│   └── test.ts          # モックを使用したテスト
├── scripts/
│   ├── setup.sh         # セットアップスクリプト (Linux/Mac)
│   └── setup.ps1        # セットアップスクリプト (Windows)
├── docs/
│   └── API_EXAMPLES.md  # 詳細なAPI使用例
├── dist/                # ビルド出力ディレクトリ
├── .env.sample          # 環境変数のサンプル
├── .gitignore          # Git除外設定
├── package.json         # プロジェクト設定
├── tsconfig.json        # TypeScript設定
├── eslint.config.mjs    # ESLint設定
└── README.md           # このファイル
```

## 開発者向け情報

### 新機能の追加

1. `src/index.ts`に新しいツールを追加
2. zodスキーマで入力パラメータを定義
3. YouTube APIを呼び出す実装を追加
4. テストケースを`test/test.ts`に追加

### コントリビューション

1. フォークしてクローン
2. 新しいブランチを作成: `git checkout -b feature/your-feature`
3. 変更をコミット: `git commit -m 'Add some feature'`
4. プッシュ: `git push origin feature/your-feature`
5. プルリクエストを作成

## ライセンス

このプロジェクトはサンプル実装として提供されています。
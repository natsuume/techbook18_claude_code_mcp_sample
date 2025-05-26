# YouTube MCP Server セットアップスクリプト (Windows PowerShell)

Write-Host "YouTube MCP Server セットアップを開始します..." -ForegroundColor Green
Write-Host ""

# Node.jsバージョンチェック
try {
    $nodeVersion = node -v
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 18) {
        Write-Host "❌ Node.jsのバージョンが古いです。現在: $nodeVersion" -ForegroundColor Red
        Write-Host "Node.js 18以降が必要です。" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion を検出しました" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Node.jsがインストールされていません。" -ForegroundColor Red
    Write-Host "Node.js 18以降をインストールしてください。" -ForegroundColor Red
    exit 1
}

# 依存関係のインストール
Write-Host "📦 依存関係をインストールしています..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install に失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 依存関係のインストール完了" -ForegroundColor Green
Write-Host ""

# .envファイルの作成
if (!(Test-Path .env)) {
    Write-Host "🔧 環境設定ファイルを作成します..." -ForegroundColor Yellow
    Copy-Item .env.sample .env
    Write-Host "✅ .env ファイルを作成しました" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  重要: .env ファイルを編集してYouTube API Keyを設定してください" -ForegroundColor Yellow
    Write-Host "   編集コマンド: notepad .env" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env ファイルは既に存在します" -ForegroundColor Green
    Write-Host ""
}

# TypeScriptのビルド
Write-Host "🔨 TypeScriptをビルドしています..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ビルドに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host "✅ ビルド完了" -ForegroundColor Green
Write-Host ""

# ESLintチェック
Write-Host "🔍 コード品質チェックを実行しています..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  ESLintエラーが検出されました" -ForegroundColor Yellow
    Write-Host "   修正コマンド: npm run lint:fix" -ForegroundColor Yellow
} else {
    Write-Host "✅ コード品質チェック完了" -ForegroundColor Green
}
Write-Host ""

# テスト実行
Write-Host "🧪 テストを実行しています..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ テストに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host "✅ テスト完了" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 セットアップが完了しました！" -ForegroundColor Green
Write-Host ""
Write-Host "次のステップ:"
Write-Host "1. .env ファイルにYouTube API Keyを設定"
Write-Host "2. npm run dev で開発サーバーを起動"
Write-Host "3. npm run test:claude-code でClaude Codeテストを実行"
Write-Host ""
Write-Host "詳細な使用方法は README.md を参照してください。"
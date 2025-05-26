#!/bin/bash

# YouTube MCP Server セットアップスクリプト

echo "YouTube MCP Server セットアップを開始します..."
echo ""

# Node.jsバージョンチェック
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.jsがインストールされていません。"
    echo "Node.js 18以降をインストールしてください。"
    exit 1
fi

NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ $NODE_MAJOR_VERSION -lt 18 ]; then
    echo "❌ Node.jsのバージョンが古いです。現在: $NODE_VERSION"
    echo "Node.js 18以降が必要です。"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION を検出しました"
echo ""

# 依存関係のインストール
echo "📦 依存関係をインストールしています..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install に失敗しました"
    exit 1
fi
echo "✅ 依存関係のインストール完了"
echo ""

# .envファイルの作成
if [ ! -f .env ]; then
    echo "🔧 環境設定ファイルを作成します..."
    cp .env.sample .env
    echo "✅ .env ファイルを作成しました"
    echo ""
    echo "⚠️  重要: .env ファイルを編集してYouTube API Keyを設定してください"
    echo "   編集コマンド: nano .env または vim .env"
    echo ""
else
    echo "✅ .env ファイルは既に存在します"
    echo ""
fi

# TypeScriptのビルド
echo "🔨 TypeScriptをビルドしています..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ ビルドに失敗しました"
    exit 1
fi
echo "✅ ビルド完了"
echo ""

# ESLintチェック
echo "🔍 コード品質チェックを実行しています..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  ESLintエラーが検出されました"
    echo "   修正コマンド: npm run lint:fix"
else
    echo "✅ コード品質チェック完了"
fi
echo ""

# テスト実行
echo "🧪 テストを実行しています..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ テストに失敗しました"
    exit 1
fi
echo "✅ テスト完了"
echo ""

echo "🎉 セットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. .env ファイルにYouTube API Keyを設定"
echo "2. npm run dev で開発サーバーを起動"
echo "3. npm run test:claude-code でClaude Codeテストを実行"
echo ""
echo "詳細な使用方法は README.md を参照してください。"
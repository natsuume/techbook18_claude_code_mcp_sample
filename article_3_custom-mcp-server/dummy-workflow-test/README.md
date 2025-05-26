# Dummy Workflow Test MCP Server

このプロジェクトはGitHub Actionsワークフローの検証用ダミーMCPサーバーです。

## 目的

`update-docs-on-merge.yml`ワークフローの動作を検証するために作成されました。

## ワークフロー検証ポイント

1. **ファイル変更時の動作確認**
   - `src/index.ts`を変更 → ワークフローが起動する
   - `test/test.ts`を変更 → ワークフローが起動する
   - `package.json`を変更 → ワークフローが起動する

2. **README.md除外の確認**
   - このREADME.mdを変更 → ワークフローは起動しない

## セットアップ

```bash
npm install
```

## 実行

```bash
# 開発モード
npm run dev

# ビルド
npm run build

# テスト
npm test
```

## 検証手順

1. このプロジェクトをfeatureブランチで変更
2. PRを作成してマージ
3. ワークフローが正しく起動することを確認
4. README.mdだけを変更した場合は起動しないことを確認
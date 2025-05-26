# YouTube MCP Server トラブルシューティングガイド

## 「YouTube検索の権限が必要です」エラーの解決方法

このエラーは、YouTube Data API v3の設定が不完全な場合に発生します。以下の手順で解決してください。

### 1. YouTube Data API v3が有効化されているか確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 使用しているプロジェクトを選択
3. 左メニューから「APIとサービス」→「有効なAPI」を選択
4. リストに「YouTube Data API v3」が表示されているか確認
5. 表示されていない場合は、「APIとサービス」→「ライブラリ」から有効化

### 2. APIキーの設定を確認

#### Google Cloud Consoleでの確認手順：

1. 「APIとサービス」→「認証情報」を選択
2. 作成したAPIキーをクリック
3. 以下の設定を確認：

**アプリケーションの制限**
- 「なし」または適切な制限（IPアドレスなど）を選択
- ⚠️ 「HTTPリファラー」や「Androidアプリ」の制限は、サーバーサイドアプリケーションでは動作しません

**API制限**
- 「キーを制限しない」を選択（テスト時）
- または「キーを制限」を選択し、「YouTube Data API v3」を明示的に追加

### 3. プロジェクトの割り当て確認

1. 「APIとサービス」→「割り当て」を選択
2. 「YouTube Data API v3」を検索
3. 使用量が制限内であることを確認（デフォルト: 10,000ユニット/日）

### 4. APIキーの再作成（必要な場合）

既存のキーで問題が解決しない場合：

1. 新しいAPIキーを作成
2. API制限を「キーを制限しない」に設定
3. .envファイルの`YOUTUBE_API_KEY`を更新
4. サーバーを再起動

### 5. 環境変数の確認

```bash
# .envファイルが正しく読み込まれているか確認
echo $YOUTUBE_API_KEY

# Node.jsで環境変数を確認
node -e "console.log(process.env.YOUTUBE_API_KEY)"
```

### 6. テスト用のcurlコマンド

APIキーが正しく動作するか直接確認：

```bash
# Linux/Mac
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&key=YOUR_API_KEY"

# Windows PowerShell
Invoke-WebRequest -Uri "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&key=YOUR_API_KEY"
```

成功した場合、JSON形式の検索結果が返されます。

### 7. 一般的なエラーメッセージと対処法

| エラーメッセージ | 原因 | 対処法 |
|---------------|------|--------|
| `API key not valid` | APIキーが無効 | キーを再確認または再作成 |
| `YouTube Data API v3 has not been used` | APIが未有効化 | Google Cloud ConsoleでAPIを有効化 |
| `Forbidden` | API制限の問題 | API制限設定を確認・修正 |
| `quotaExceeded` | 日次制限超過 | 翌日まで待つか、割り当て増加申請 |

### 8. デバッグモードでの実行

詳細なエラー情報を取得：

```bash
# 環境変数を設定してデバッグ実行
DEBUG=* npm run dev
```

### 9. よくある設定ミス

1. **APIキーの前後の空白**
   ```
   # ❌ 間違い
   YOUTUBE_API_KEY= AIzaSy...  # 先頭に空白
   YOUTUBE_API_KEY=AIzaSy... # 末尾に空白
   
   # ✅ 正しい
   YOUTUBE_API_KEY=AIzaSy...
   ```

2. **引用符の使用**
   ```
   # ❌ 間違い（.envファイルでは引用符不要）
   YOUTUBE_API_KEY="AIzaSy..."
   
   # ✅ 正しい
   YOUTUBE_API_KEY=AIzaSy...
   ```

3. **プロジェクトの不一致**
   - APIキーを作成したプロジェクトとAPIを有効化したプロジェクトが異なる

### 10. 問題が解決しない場合

1. Google Cloud Consoleのログを確認
2. APIキーを完全に新規作成（別のプロジェクトで）
3. 以下の情報を含めて問題を報告：
   - エラーメッセージの全文
   - 使用しているNode.jsのバージョン
   - `npm ls`の出力
   - APIキーの設定スクリーンショット（キー自体は隠す）

## セキュリティに関する注意事項

- APIキーを公開リポジトリにコミットしないこと
- 本番環境では必ずAPI制限を設定すること
- 定期的にAPIキーをローテーションすること
- 使用量を監視し、異常なアクセスがないか確認すること
// APIキーの動作確認用スクリプト
require('dotenv').config();

const API_KEY = process.env.YOUTUBE_API_KEY;

console.log('環境変数チェック:');
console.log('YOUTUBE_API_KEY:', API_KEY ? `設定済み (${API_KEY.substring(0, 10)}...)` : '未設定');

if (!API_KEY) {
  console.error('\n❌ エラー: YOUTUBE_API_KEY環境変数が設定されていません');
  process.exit(1);
}

console.log('\nYouTube APIテスト実行中...');

fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${API_KEY}`)
  .then(response => {
    console.log('HTTPステータス:', response.status);
    return response.json();
  })
  .then(data => {
    if (data.error) {
      console.error('\n❌ APIエラー:', data.error.message);
      console.error('エラー詳細:', JSON.stringify(data.error, null, 2));
    } else if (data.items && data.items.length > 0) {
      console.log('\n✅ APIアクセス成功！');
      console.log('検索結果:', data.items[0].snippet.title);
    } else {
      console.log('\n⚠️  検索結果が見つかりませんでした');
    }
  })
  .catch(error => {
    console.error('\n❌ ネットワークエラー:', error.message);
  });
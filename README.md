# Web掲示板（Web-BBS）

PostgreSQLデータベースとNode.jsを連携させた、リアルタイムWeb掲示板アプリケーションです。
フロントエンドはGitHub Pages、バックエンドおよびデータベースはRailwayでホストされています。

## デモ
github-pagesで見ることができます
https://riu4649.github.io/web-bbs/

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ad405e9c-2a46-4f83-99f0-8de0c1141845" />


## 主な機能・特徴

2. **ホバーUI・アニメーション**
   - 各投稿にマウスをホバーした際、滑らかなアニメーション（`transition`, `transform`）を伴って「詳細（…）ボタン」や「編集・削除メニュー」が出現します。
   - クリックの当たり判定（`padding`）を広く保ちつつ、下線（`::after` 疑似要素）の美しさをキープするCSSチューニングを行っています。
3. **タイムゾーンの自動最適化**
   - クラウドサーバー（Railway）のタイムゾーンを `Asia/Tokyo` に固定し、ローカル環境・本番環境を問わず、完全に正しい日本時間（JST）で投稿時間を記録・表示します。
4. **接続環境の自動判別（API_BASE_URL）**
   - JavaScript側で開いているドメイン（`localhost` か `github.io` か）を自動で判別し、通信先のURLを動的に切り替える仕組みを導入しています。

---

## 使用技術（技術スタック）

### フロントエンド
- HTML5 / CSS3（疑似要素、絶対配置、フレックスボックス）
- JavaScript (Vanilla JS / Fetch API)

### バックエンド・データベース
- Node.js (Express)
- PostgreSQL (`pg` モジュールによるプール接続管理)
- CORS（クロスオリジンリソース共有）設定

### インフラ・デプロイ
- **GitHub Pages**: 静的フロントエンドのホスト
- **Railway**: Node.jsサーバーおよびPostgreSQLデータベースの運用

---

## ローカル環境での起動方法

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com
   cd あなたのリポジトリ名
   ```

2. **依存パッケージのインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   ルートディレクトリに `.env` ファイルを作成し、自身のPostgreSQLの接続情報を入力します。
   ```env
   PORT=3000
   PGHOST=localhost
   PGPORT=5432
   PGUSER=あなたのユーザー名
   PGPASSWORD=あなたのパスワード
   PGDATABASE=あなたのデータベース名
   ```

4. **サーバーの起動**
   ```bash
   node server.js
   ```
   ブラウザで `http://localhost:3000` を開くと動作確認ができます。

   

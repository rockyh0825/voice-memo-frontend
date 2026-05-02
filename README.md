# voice-memo-frontend

音声メモからタスクを管理する React PWA。[voice-memo](../voice-memo) バックエンドと連携する。

## 画面構成

| 画面 | パス | 概要 |
|---|---|---|
| 初期リダイレクト | `/` | draft タスクの有無を確認して振り分け |
| ドラフト確認 | `/draft` | 音声メモから抽出されたタスクを1件ずつスワイプで承認・削除 |
| タスク一覧 | `/tasks` | todo/done タブ表示、完了チェック、編集モーダル |
| 音声入力 | `/voice` | マイク録音（Web Speech API）またはテキスト入力 → タスク抽出 |

---

## ローカル開発

### 必要なもの

- Node.js 18 以上
- [voice-memo](../voice-memo) バックエンドが起動していること

### セットアップ

```bash
npm install

cp .env.local.example .env.local
# .env.local を編集して値を設定
```

**.env.local の設定値:**

| 変数 | 説明 | 例 |
|---|---|---|
| `VITE_API_BASE_URL` | バックエンドの URL | `http://localhost:8000` |
| `VITE_API_TOKEN` | Bearer トークン（バックエンドの `API_TOKEN` と同じ値） | `abc123...` |

### 開発サーバー起動

```bash
npm run dev
# → http://localhost:5173
```

### ビルド

```bash
npm run build
# → dist/ に出力
```

---

## デプロイ構成

### フロントエンド: Cloudflare Pages

静的ビルドを Cloudflare Pages にデプロイする。

```bash
# GitHub にプッシュして Cloudflare Pages と連携、または手動デプロイ:
npm run build
npx wrangler pages deploy dist --project-name voice-memo-frontend
```

**Cloudflare Pages の環境変数設定（Dashboard → Settings → Environment variables）:**

| 変数 | 値 |
|---|---|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com`（Cloudflare Tunnel の URL） |
| `VITE_API_TOKEN` | バックエンドの `API_TOKEN` の値 |

### バックエンドの公開: Cloudflare Tunnel

自宅サーバーのバックエンドを、ポート開放なしで安全にインターネットへ公開する方法。

```bash
# 自宅サーバーで実行
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

cloudflared tunnel login
cloudflared tunnel create voice-memo-api
cloudflared tunnel route dns voice-memo-api api.yourdomain.com

# トンネルを systemd サービスとして登録
cloudflared service install
```

`~/.cloudflared/config.yml`:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

### CORS の設定

バックエンド (`voice-memo/main.py`) にフロントエンドのオリジンを追記する必要がある:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.pages.dev"],  # Cloudflare Pages の URL
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## バックエンドに追加が必要なエンドポイント

現在のバックエンドには `/extract-tasks` と `/health` しかない。以下の追加が必要:

| エンドポイント | 用途 |
|---|---|
| `GET /tasks?status=draft\|todo\|done` | タスク一覧取得 |
| `PATCH /tasks/{id}` | タスク更新（承認・編集・完了） |
| `DELETE /tasks/{id}` | タスク削除 |

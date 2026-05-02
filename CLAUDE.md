# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## What this project does

音声メモ管理 React PWA。[../voice-memo](../voice-memo) の FastAPI バックエンドと連携し、音声メモから抽出されたタスクをスワイプ UI で承認・管理する。

## Commands

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 型チェック
npx tsc --noEmit
```

## Tech stack

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** — `@tailwindcss/vite` プラグイン経由（`tailwind.config.js` は不要、設定は `src/index.css` の `@theme` で行う）
- **React Router v6** — BrowserRouter + Routes
- **react-swipeable** — DraftCard のタッチスワイプジェスチャー
- **vite-plugin-pwa 1.2.0** — `--legacy-peer-deps` でインストール（vite 8 の peer dep 不一致を回避）

## ファイル構成

```
src/
  api/tasks.ts          API 呼び出し（fetch + Bearer 認証）
  types.ts              Task 型、Priority/Status 型、ラベル/カラー定数
  pages/
    DraftReviewPage.tsx  draft タスクのカード確認画面
    TaskListPage.tsx     todo/done タブのタスク一覧
    VoiceInputPage.tsx   Web Speech API + テキスト入力
  components/
    DraftCard.tsx        スワイプジェスチャーカード（react-swipeable）
    TaskItem.tsx         チェックボックス付きリスト項目
    EditModal.tsx        タスク編集ボトムシートモーダル
  App.tsx               ルーター定義 + 初期リダイレクト
  main.tsx
  index.css             Tailwind v4 エントリ（@import "tailwindcss"）
```

## 環境変数

`.env.local` に設定する（`VITE_` プレフィックスが必要）。

| 変数 | 説明 |
|---|---|
| `VITE_API_BASE_URL` | バックエンド URL（デフォルト: `http://localhost:8000`） |
| `VITE_API_TOKEN` | Bearer トークン（バックエンドの `API_TOKEN` と同じ値） |

## 画面フロー

```
/ (InitialRedirect)
  ├─ draft あり → /draft (DraftReviewPage)
  │    └─ 全件処理 or 後回し → /tasks
  └─ draft なし → /tasks (TaskListPage)
       └─ FAB 🎤 → /voice (VoiceInputPage)
            └─ 送信成功 → /draft
```

## 主要なパターン

**API 呼び出し:** `src/api/tasks.ts` に集約。エラー時は `Error` を throw し、コンポーネント側で catch して state に入れる。

**スワイプカード:** `DraftCard` は `useSwipeable` の `onSwiping` で dragX state を更新し、CSS `transform: translateX` で追従させる。閾値 80px 超で `exit()` を呼び出し、アニメーション完了（280ms）後にコールバックを呼ぶ。

**モーダル:** `EditModal` はオーバーレイクリックで閉じる（`e.target === e.currentTarget` チェック）。バックエンド PATCH 成功後に親の tasks state を更新して再レンダリング。

## バックエンド連携

バックエンド (`../voice-memo`) に以下の追加が必要（未実装）:
- `GET /tasks?status=...` — タスク一覧
- `PATCH /tasks/{id}` — タスク更新
- `DELETE /tasks/{id}` — タスク削除

また、CORS ミドルウェアの追加も必要（フロントのオリジンを `allow_origins` に追加）。

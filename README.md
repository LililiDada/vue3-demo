# vue3-demo

Vue 3 多入口前端 + Node.js Express 后端。

- **frontend/** — Vue 3 多入口项目，`pages/` 下每个子目录为一个独立入口
  - `pages/index/` — 原 demo 入口
  - `pages/fundtracker/` — 持仓基金追踪入口（基于 openspec + opencode 开发）
- **backend/** — 针对 fundtracker 入口开发的 API 服务，
  提供基金搜索、实时估值、持仓 CRUD、持仓汇总接口，
  数据来源于 [AKShare](https://akshare.akfamily.xyz/data/stock/stock.html)

## 目录结构

```
vue3-demo/
├── frontend/
│   ├── src/pages/
│   │   ├── index/         ← 原 demo 入口
│   │   └── fundtracker/   ← 持仓基金追踪入口（openspec + opencode）
│   ├── openspec/
│   ├── .opencode/
│   └── package.json
├── backend/               ← Express + TypeScript API
│   ├── src/
│   └── package.json
└── .opencode/
```

## 快速开始

### 后端

```bash
cd backend
npm install
npm run dev       # http://localhost:8000
```

### 前端

```bash
cd frontend
pnpm install
pnpm run dev      # http://localhost:5173
```

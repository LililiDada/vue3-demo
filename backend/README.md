# Backend — 持仓基金管理 API

基于 [AKShare](https://akshare.akfamily.xyz/data/stock/stock.html) 数据源构建的持仓基金管理后端服务，
提供基金搜索、实时估值、持仓 CRUD、持仓汇总等接口。

## 技术栈
- Node.js + TypeScript
- Express.js
- 数据存储：JSON 文件

## 目录结构

```
backend/
├── package.json
├── tsconfig.json
├── data/
│   └── portfolio.json    ← 持仓数据（自动创建）
└── src/
    ├── index.ts           ← 服务入口
    ├── types/index.ts     ← 类型定义
    ├── services/
    │   └── apiDocs.ts     ← 文档注册中心
    ├── docs/
    │   ├── index.ts       ← 文档注册入口
    │   └── portfolio.ts   ← 持仓接口文档
    └── routers/
        ├── index.ts       ← 路由聚合（help + portfolio）
        └── portfolio.ts   ← 持仓业务逻辑
```

## API 接口

| 路径 | 说明 |
|------|------|
| `POST /api/help` | 接口文档查询（目录/详情） |
| `POST /api/portfolio/search` | 基金代码查名称 |
| `POST /api/portfolio/estimate` | 实时估值 |
| `POST /api/portfolio/list` | 持仓列表（含实时市值、收益） |
| `POST /api/portfolio/add` | 添加持仓 |
| `POST /api/portfolio/update` | 编辑持仓 |
| `POST /api/portfolio/delete` | 删除持仓 |
| `POST /api/portfolio/summary` | 持仓汇总 |

## 启动

```bash
cd backend
npm install
npm run dev       # 开发模式（tsx watch）
npm start         # 生产模式
```

## 新增接口流程

1. `routers/xxx.ts` — 写业务逻辑
2. `docs/xxx.ts` — 注册接口字段说明（request/response 字段含义）
3. `docs/index.ts` — 加一行 `import './xxx'`

## 数据存储

- `data/portfolio.json`，首次运行自动创建，无需数据库

/**
 * 基金详情接口文档注册
 * 对应 routers/fund.ts
 */

import { register } from "../services/apiDocs";

register({
  api: "fund/realtime",
  method: "POST",
  description: "获取基金实时估值及日内分时走势（用于详情页走势图）",
  category: "fund",
  categoryName: "基金详情",
  request: { code: "基金代码，必填，如 003095" },
  response: {
    code: "基金代码",
    name: "基金名称",
    estimateValue: "实时估算净值",
    changePercent: "估算涨跌幅（%）",
    changeAmount: "估算涨跌值",
    updateTime: "数据更新时间，如 2026-07-01 14:30",
    "trend[].time": "分时点时间，如 09:30",
    "trend[].value": "分时点估算净值",
  },
});

register({
  api: "fund/nav-history",
  method: "POST",
  description: "获取基金历史净值走势（按日，支持多周期）",
  category: "fund",
  categoryName: "基金详情",
  request: {
    code: "基金代码，必填，如 003095",
    period: "周期，可选 1m|3m|6m|1y|3y，默认 1m",
  },
  response: {
    code: "基金代码",
    name: "基金名称",
    "list[].date": "日期，如 2026-06-30",
    "list[].unitNav": "单位净值",
    "list[].accumNav": "累计净值",
    "list[].dayChange": "日涨跌幅（%）",
  },
});

register({
  api: "fund/hold-stocks",
  method: "POST",
  description: "获取基金持仓股票列表（前十大重仓股，含实时行情）",
  category: "fund",
  categoryName: "基金详情",
  request: { code: "基金代码，必填，如 003095" },
  response: {
    code: "基金代码",
    name: "基金名称",
    "list[].stockCode": "股票代码",
    "list[].stockName": "股票名称",
    "list[].percent": "占净值比例（%）",
    "list[].marketValue": "持仓市值（元）",
    "list[].shares": "持仓数量",
    "list[].price": "最新股价（元）",
    "list[].changePercent": "股价涨跌幅（%）",
  },
});

/**
 * 持仓管理接口文档注册
 * 对应 routers/portfolio.ts
 */

import { register } from '../services/apiDocs'

register({
  api: 'portfolio/search',
  method: 'POST',
  description: '根据基金代码查询基金名称',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: { code: { type: 'string', desc: '基金代码，必填，如 000001' } },
  response: {
    code: { type: 'string', desc: '基金代码' },
    name: { type: 'string', desc: '基金名称' },
    pinyin: { type: 'string', desc: '拼音缩写' },
  },
})

register({
  api: 'portfolio/estimate',
  method: 'POST',
  description: '获取基金实时估值（最新净值和涨跌幅）',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: { codes: { type: 'string[]', desc: '基金代码数组，必填，如 ["000001","110011"]' } },
  response: {
    '[code].name': { type: 'string', desc: '基金名称' },
    '[code].netValue': { type: 'number', desc: '最新净值' },
    '[code].estimateValue': { type: 'number', desc: '估算净值' },
    '[code].changePercent': { type: 'number', desc: '估算涨跌幅（%）' },
    '[code].changeAmount': { type: 'number', desc: '估算涨跌值' },
  },
})

register({
  api: 'portfolio/list',
  method: 'POST',
  description: '获取我的持仓基金列表（含实时估值计算）',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: {},
  response: {
    id: { type: 'int', desc: '持仓记录唯一ID' },
    code: { type: 'string', desc: '基金代码' },
    name: { type: 'string', desc: '基金名称' },
    amount: { type: 'number', desc: '投入总金额（元）' },
    shares: { type: 'number', desc: '持有份额' },
    buyNav: { type: 'number', desc: '买入时基金净值' },
    currentNav: { type: 'number', desc: '最新基金净值' },
    currentValue: { type: 'number', desc: '当前市值 = shares × currentNav' },
    todayProfit: { type: 'number', desc: '今日收益 = shares × 今日涨跌值' },
    totalProfit: { type: 'number', desc: '累计收益 = currentValue - amount' },
    profitRate: { type: 'string', desc: '持有收益率，前端直接展示' },
    createdAt: { type: 'string', desc: '创建时间' },
  },
})

register({
  api: 'portfolio/add',
  method: 'POST',
  description: '添加一条持仓记录',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: {
    code: { type: 'string', desc: '基金代码，必填' },
    name: { type: 'string', desc: '基金名称，可选，不传自动识别' },
    amount: { type: 'number', desc: '投入金额（元），必填' },
  },
  response: { id: { type: 'int', desc: '新增持仓记录的ID' } },
})

register({
  api: 'portfolio/update',
  method: 'POST',
  description: '编辑持仓记录',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: {
    id: { type: 'int', desc: '持仓ID，必填' },
    name: { type: 'string', desc: '基金名称，可选' },
    amount: { type: 'number', desc: '投入金额，可选，传则重新计算份额' },
  },
  response: {},
})

register({
  api: 'portfolio/delete',
  method: 'POST',
  description: '删除持仓记录',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: { id: { type: 'int', desc: '持仓ID，必填' } },
  response: {},
})

register({
  api: 'portfolio/summary',
  method: 'POST',
  description: '获取持仓汇总（总资产、今日总收益、持有收益率）',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: {},
  response: {
    totalAssets: { type: 'number', desc: '总资产（元）' },
    totalInvest: { type: 'number', desc: '总投入（元）' },
    totalTodayProfit: { type: 'number', desc: '今日总收益（元）' },
    totalProfit: { type: 'number', desc: '累计总收益（元）' },
    profitRate: { type: 'string', desc: '持有收益率，前端直接展示' },
  },
})

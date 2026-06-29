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
  request: { code: '基金代码，必填，如 000001' },
  response: { code: '基金代码', name: '基金名称', pinyin: '拼音缩写' },
})

register({
  api: 'portfolio/estimate',
  method: 'POST',
  description: '获取基金实时估值（最新净值和涨跌幅）',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: { codes: '基金代码数组，必填，如 ["000001","110011"]' },
  response: {
    '[code].name': '基金名称',
    '[code].netValue': '最新净值',
    '[code].estimateValue': '估算净值',
    '[code].changePercent': '估算涨跌幅（%）',
    '[code].changeAmount': '估算涨跌值',
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
    id: '持仓记录唯一ID',
    code: '基金代码',
    name: '基金名称',
    amount: '投入总金额（元）',
    shares: '持有份额',
    buyNav: '买入时基金净值',
    currentNav: '最新基金净值',
    currentValue: '当前市值 = shares × currentNav',
    todayProfit: '今日收益 = shares × 今日涨跌值',
    totalProfit: '累计收益 = currentValue - amount',
    profitRate: '持有收益率 = (currentValue / amount - 1) × 100%',
    createdAt: '创建时间',
  },
})

register({
  api: 'portfolio/add',
  method: 'POST',
  description: '添加一条持仓记录',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: {
    code: '基金代码，必填',
    name: '基金名称，可选，不传自动识别',
    amount: '投入金额（元），必填，正整数',
  },
  response: { id: '新增持仓记录的ID' },
})

register({
  api: 'portfolio/update',
  method: 'POST',
  description: '编辑持仓记录',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: {
    id: '持仓ID，必填',
    name: '基金名称，可选',
    amount: '投入金额，可选，传则重新计算份额',
  },
  response: {},
})

register({
  api: 'portfolio/delete',
  method: 'POST',
  description: '删除持仓记录',
  category: 'portfolio',
  categoryName: '持仓管理',
  request: { id: '持仓ID，必填' },
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
    totalAssets: '总资产（元）',
    totalInvest: '总投入（元）',
    totalTodayProfit: '今日总收益（元）',
    totalProfit: '累计总收益（元）',
    profitRate: '持有收益率（%）',
  },
})

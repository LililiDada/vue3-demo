/**
 * 路由聚合入口
 *
 * 统一注册所有子路由，并提供：
 * - POST /api/help  接口文档查询（目录 / 单个接口字段说明）
 * - POST /api/portfolio/*  持仓管理
 */

import { Router, Request, Response } from 'express'
import type { ApiResponse } from '../types'
import { getDoc, getCategories } from '../services/apiDocs'
import portfolioRouter from './portfolio'
// 注册所有接口文档
import '../docs'

const router = Router()

// ---- 统一响应格式 ----

function success<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}

function fail(msg: string): ApiResponse<null> {
  return { code: -1, message: msg, data: null }
}

// ---- 帮助文档 ---- //

router.post('/help', (req: Request, res: Response) => {
  const { api } = req.body as { api?: string }

  if (api) {
    // 查单个接口字段说明
    const doc = getDoc(api)
    if (!doc) {
      res.json(fail(`未找到接口 ${api} 的文档`))
      return
    }
    res.json(success(doc))
  } else {
    // 查目录：返回所有分类和接口列表
    res.json(success({ categories: getCategories() }))
  }
})

// ---- 持仓管理 ---- //

router.use('/portfolio', portfolioRouter)

export default router

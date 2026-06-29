/**
 * 后端服务入口
 * Express + CORS + JSON 解析，绑定 8000 端口
 * 所有接口统一挂载到 /api 路径下
 */

import express from 'express'
import cors from 'cors'
import router from './routers'

const app = express()
const PORT = 8000

app.use(cors())
app.use(express.json())

// 健康检查
app.post('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'success', data: 'OK' })
})

// 所有业务路由
app.use('/api', router)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

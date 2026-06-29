/**
 * 接口文档注册中心
 *
 * 每个路由模块通过 register() 注册自己的接口说明，
 * 前端通过 POST /api/help 查询接口字段含义。
 *
 * 新增接口时在对应 router 文件末尾加一行 register() 即可，
 * 无需修改 help 路由本身。
 */

export interface ApiDocEntry {
  api: string           // 接口路径，如 "portfolio/list"
  method: string        // 请求方法
  description: string   // 接口说明
  category: string      // 分类标识，如 "portfolio"
  categoryName: string  // 分类中文名
  request?: Record<string, string>   // 请求字段说明
  response?: Record<string, string>  // 响应字段说明
}

// 内存存储所有注册的文档
const docs = new Map<string, ApiDocEntry>()

// 注册接口文档
export function register(entry: ApiDocEntry) {
  docs.set(entry.api, entry)
}

// 查询单个接口文档
export function getDoc(api: string): ApiDocEntry | undefined {
  return docs.get(api)
}

// 获取所有分类及接口列表
export function getCategories(): Record<string, { name: string; apis: { api: string; description: string }[] }> {
  const categories: Record<string, { name: string; apis: { api: string; description: string }[] }> = {}

  for (const entry of docs.values()) {
    if (!categories[entry.category]) {
      categories[entry.category] = { name: entry.categoryName, apis: [] }
    }
    categories[entry.category].apis.push({ api: entry.api, description: entry.description })
  }

  return categories
}

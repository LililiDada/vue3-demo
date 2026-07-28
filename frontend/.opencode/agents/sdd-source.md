---
name: sdd-source
mode: subagent
---

## 依赖

- 蓝湖：需 `LANHU_COOKIE` 环境变量 + `opencode.json` 中配置 `mcpServers.lanhu`（`mcp-lanhu` 包）
- Pencil：需 `.pen` 文件路径

## 执行

读取 `.agents/agents/sdd-source.body.md` 作为完整指令。

上下文参数：

- `设计图源`: 用户输入的 URL 或 `.pen` 路径
- `输出路径`: `openspec/changes/<change-name>/design-data.json`

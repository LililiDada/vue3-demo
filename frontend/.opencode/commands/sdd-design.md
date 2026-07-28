---
description: 读取设计数据 + 复用清单，匹配现有组件，生成设计文档（含架构/组件设计/API 声明），用于 opsx-continue 生成任务
agent: sdd-design
---

# SDD Design

生成 openspec 标准 `design.md`。这是 `/opsx-continue` 生成 tasks.md 的前置步骤。

**输入**: `sdd-design <change-name>`

前置条件：`/sdd-source` 和 `/sdd-scan` 已完成。

## 步骤

### 1. 读取所有输入

加载 `sdd-design` agent（工具：Read/Write/Bash/Grep/Glob）：

```bash
# 读取变更范围
cat openspec/changes/<change-name>/proposal.md

# 读取设计数据
cat openspec/changes/<change-name>/session/design-data.json | ConvertFrom-Json

# 读取复用清单
cat openspec/changes/<change-name>/session/sdd-reuse.md

# 从 config.yaml 读取 help API 地址并调用（可选，不可用时由 LLM 推断）
$helpUrl = (Select-String -Path openspec/config.yaml -Pattern "helpApiBaseUrl:").Line -replace ".*helpApiBaseUrl: ", ""
Invoke-RestMethod -Uri $helpUrl -Method Get
```

### 2. 分阶段生成

完整逻辑参见 `.agents/agents/sdd-design.body.md`，包含三个子阶段：

**阶段 A: 逐元素匹配** — 每个 design-data 的图层 vs sdd-reuse 的组件 → reuse/extend/new
**阶段 B: 变量映射 & 接口声明** — 调用 help 接口获取后端 API 定义 → 图层名 → props 名 → 输出请求参数表 + 返回字段表（含映射图层）
**阶段 C: 写 design.md** — 按 openspec 标准格式输出

### 3. 写入产出

- `openspec/changes/<change-name>/design.md` — 标准 openspec 格式
- `openspec/changes/<change-name>/session/sdd-match-report.md` — 匹配结果
### 4. 报告结果

- design.md 包含的组件数量（reuse / extend / new）
- 匹配覆盖率（多少图层成功匹配现有组件）
- 提示下一步：`/opsx-continue` 生成 tasks.md + specs/

**Guardrails**

- `design.md` 必须包含 Context / Goals-NonGoals / Architecture / Component Design / Decisions / Risks-Tradeoffs 章节
- Component Design 章节必须为每个组件标注匹配类型（reuse/extend/new）
- 不可输出 tasks.md 或 specs/ — 这些留给 `/opsx-continue`
- 不得启动 explore agent 扫描项目结构；设计数据仅从 `session/` 下 4 个输入文件获取

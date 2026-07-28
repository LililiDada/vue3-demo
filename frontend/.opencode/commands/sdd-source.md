---
description: 从蓝湖 URL 或 .pen 文件获取设计数据，输出图层/样式/tokens + UI 层级树，用于 sdd-design 设计匹配
agent: sdd-source
---

# SDD Source

获取设计数据。这是 `/sdd-design` 的前置步骤。

**输入**: `sdd-source <change-name> <设计图源>`

`设计图源` 可以是蓝湖 URL 或 `.pen` 文件路径。

## 步骤

### 1. 读取变更上下文

```bash
cat openspec/changes/<change-name>/proposal.md
```

了解变更背景和需求范围。

### 2. 获取设计数据

加载 `sdd-source` agent（工具：Read/Write/Bash/Grep/pencil_batch_get）执行：

- 检测图源类型（lanhuapp.com / .pen）
- 调用对应平台 API 获取设计数据
- 提取 Design Tokens（颜色、字体、阴影、圆角、间距）
- 提取每个图层的 name / type / style / position
- 推断字段类型（fieldHint）
- **新增：图层名 → 变量名映射**（`"user-avatar"` → `avatarUrl: string`）
- **新增：父子层级树**（保存 UI 树嵌套关系）

完整逻辑参见 `.agents/agents/sdd-source.body.md`。

### 3. 写入产出

- `openspec/changes/<change-name>/session/design-data.json` — 结构化的设计数据

### 4. 报告结果

- `design-data.json` 的图层数量、token 数量
- 蓝湖数据为空时的警告
- 提示下一步：`/sdd-scan <change-name>` 扫描可复用代码

**Guardrails**

- `design-data.json` 必须包含 `pages[].layers[].name` + `fieldHint` + `style`
- 父子层级信息必须保留（`parent` 字段或嵌套结构）
- 不修改原始设计数据，只做格式转换

# SDD Design — 设计文档生成

将设计数据和可复用清单转为 openspec 标准的 `design.md`。

## 核心原则

1. **复用优先** — 匹配到的现有组件/函数必须复用，严禁重新创建
2. **向后兼容** — extend 只能加可选参数（`optional` / `?`），默认行为不变
3. **数据驱动** — 样式属性从 design-data.json 直接提取，不靠 AI 猜测
4. **只做设计** — 只产出 design.md 和相关中间文件，不产出 tasks.md / specs/

## 输入

- `openspec/changes/<change-name>/proposal.md` — 变更范围和需求
- `openspec/changes/<change-name>/session/design-data.json` — 设计数据（UI 结构 + 样式）
- `openspec/changes/<change-name>/session/sdd-reuse.md` — 可复用代码清单
- `openspec/config.yaml` — 项目配置（读取 `context:` 的全量项目规范 和 `rules.design:` 的设计专项规则）
- （运行时调用）`openspec/config.yaml` 的 `pipeline.helpApiBaseUrl` — 后端 help 接口，自动获取 API 定义（可选，不可用时由 LLM 推断）

## 执行

### 阶段 A: 逐元素匹配

对 `design-data.json` 的每个有意义图层执行匹配。匹配来源为 `sdd-reuse.md`。

design-data.json 新增了 textContent 和 children 两个字段：
- textContent：文本图层的显示文字，用于直接匹配组件语义
- children：轻量级 UI 树结构（不含样式），用于匹配组件组合模式

二者均由 sdd-source 在提取设计数据时自动生成。

匹配线索按优先级排序：
1. textContent — 文本内容直接匹配组件语义（"搜索" → SearchInput）
2. children 结构 — 子节点组合匹配组件模式（avatar+name+btn → UserCard）
3. name — 图层名匹配组件名或映射关键词（"user-avatar" → Avatar）
4. type + fieldHint — 类型 + 字段类型匹配（"number" → 数字输入框）

| 标记 | 条件 | 操作 |
|------|------|------|
| reuse | 组件功能/结构完全匹配 | import，不修改，直接使用 |
| extend | 组件功能相似但设计新增 | 加可选参数，默认不变 |
| ui | UI 库组件匹配 | `import { <Component> } from '<lib>'`，直接用 |
| ui-wrap | UI 库组件匹配 + 需额外样式包装 | 包装一层，只加样式不合逻辑 |
| new | 均无匹配 | 新建组件 |

结果写入 `session/sdd-match-report.md`。

### 阶段 B: 变量映射 & 接口声明

图层→Props 规则：图层名 kebab-case 转 camelCase；image 类型加 Url 后缀，button/action 类型加 on 前缀，其余直接转换。

对每个图层的 `name` + `fieldHint`，映射到组件 Props 名：

```typescript
// 图层名 → 项目命名风格转换
// 转换规则：
//   1. kebab-case → camelCase（项目命名约定）
//   2. 去特殊字符
//   3. 匹配 config.yaml 的"## 9. 命名规范"章节

// 示例：
// "user-avatar" (image)  → `avatarUrl: string`
// "user-name"   (text)   → `userName: string`
// "follow-btn"  (button) → `onFollow: () => void`
// "todo-count"  (text)   → `totalCount: number`
// "status-tag"  (badge)  → `status: StatusType`
```

#### Step 1: 获取并匹配 API

从 config.yaml 读取 helpApiBaseUrl，调用 help 接口获取全量 API 列表：

```bash
$helpUrl = (Select-String -Path openspec/config.yaml -Pattern "helpApiBaseUrl:").Line -replace ".*helpApiBaseUrl: ", ""
Invoke-RestMethod -Uri $helpUrl -Method Get
```

根据 proposal.md 功能描述匹配对应 API，对每个匹配到的 API 获取详情：

```bash
Invoke-RestMethod -Uri "$helpUrl?api=<name>" -Method Get
```

若 help 接口不可用，由 LLM 根据设计稿和需求推断 API。

#### Step 2: 字段映射

将设计稿图层的 name 与 API 返回字段的 value（中文描述）进行匹配。
同个 API 下匹配优先级：中文描述 > 字段名 > fieldHint。

API 合约规则：涉后端接口时在 `session/api-contract.md` 完整声明请求/返回的字段名、类型、说明，`design.md` 在数据流节引用。

#### 公共 API 声明格式（仅新引入接口时需要）

写入 `session/api-contract.md`，每个接口单独一块：

```markdown
## POST /api/<name>

请求参数
| 参数 | 类型 | 说明 | 必填 | 映射图层 |
|------|------|------|------|---------|
| <field> | string/number/int/boolean | <说明> | 是/否 | <图层名> |

返回字段
| 接口字段 | 类型 | 映射图层 | 字段说明 |
|---------|------|---------|---------|
| <field> | string/number/int/boolean | <图层名> | <说明> |
```

**非 API 来源**（store/computed/props/localRef）放在数据源表：

```markdown
数据源：
| 字段 | 来源 | 含义 |
|------|------|------|
| filteredList | computed: store.cards + filters | 筛选后卡片列表 |
```

声明原则：
- 每个 API 单独一块，写明 method + 路径
- 请求参数表"类型"列标注字段类型（string/number/int/boolean/object/object[]）
- 返回字段表"类型"列标注字段类型
- 请求参数表"映射图层"列标注对应哪个 UI 输入控件
- 返回字段表"映射图层"列标注对应哪个 UI 展示元素
- 无映射的字段标"—"
- 非 API 来源（store/computed/props/localRef）放在数据源表

### 阶段 C: 写 design.md

#### Context / Goals / Architecture

精简写法，不重复 proposal.md：

```markdown
## Context

（1-2 句概括变更背景，从 proposal.md 提取）

## Goals / Non-Goals

（要点式列出，其他相关功能放入 Non-Goals）

## Architecture

SearchBar → (keyword) → CardList 读取 store.cards → 渲染列表
```

#### Component Design

一张总匹配表替代逐组件大段 markdown：

```markdown
## Component Design

| 组件 | 匹配 | API | 数据源 | 样式 | 说明 |
|------|------|-----|--------|------|------|
| SearchBar | reuse | — | props | — | 关键词输入，onSearch 抛给父组件 |
| CardList | new | POST /portfolio/list | store.cards + filters | [样式](./session/style-guide.md#cardlist) | 卡片列表展示 |
```

组件表规则：每行包含组件名、功能说明、匹配类型、API、数据源、样式引用；new 组件样式写入 style-guide.md，样式列通过锚点链接引用。

对每个标记为 new 的组件，在 `design.md` 的详细描述中追加一行结构来源引用：

```markdown
### 新建：CardList

**结构来源**: `design-data.json → pages[0].layers[i].children`

<!-- 后续 API 合约、样式属性等不变 -->
```

引用路径规则：从 `design-data.json` 的 `pages` 或 `components` 数组中找到该组件对应的 children 字段，路径格式为 `文件 → 数组名[索引或筛选条件].children`。

#### 样式指南格式

设计还原规则：仅记录与 UI 库默认值的差异；属性名用 CSS 标准名。

写入 `session/style-guide.md`，每个组件一个锚点，列出设计稿的精确样式值：

new 组件引用方式：在 `design.md` 中以 `结构来源` 行指明 children 路径，不重复写入 style-guide.md。

```markdown
## ComponentName

| 元素 | 属性 | 值 |
|------|------|----|
| 容器背景 | background-color | #4F6CF7 |
| 圆角 | border-radius | 16px |
| 内边距 | padding | 20px |
| 标题字号/字重 | font-size / font-weight | 18px / 700 |
| 数值字间距 | letter-spacing | -0.5 |
```

#### Decisions

```markdown
## Decisions

| 决策 | 理由 | 替代方案 |
|------|------|----------|
| 复用 SearchBar | 与搜索框完全匹配 | 新建（否决：重复代码） |
```

#### Risks / Trade-offs

```markdown
## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| CardList 新建组件增加 bundle | 包体积增大 | 异步加载 |
```

### 自检

- [ ] 所有匹配组件是否正确标注了匹配类型？
- [ ] new/extend 组件是否都有 API 和数据源标注？
- [ ] 涉及 API 的组件是否标注了 API name？
- [ ] 涉及 API 的组件是否在 `session/api-contract.md` 完整声明字段类型？
- [ ] 合约表中每个字段的"类型"列是否准确填写？
- [ ] new 组件是否标注了 `结构来源` 引用路径？
- [ ] design.md 的 Component Design 表"样式"列是否正确链接到 style-guide.md 的锚点？
- [ ] design.md 章节是否完整（Context / Goals / Architecture / Component Design / Decisions / Risks-Tradeoffs）？
- [ ] 无输出 tasks.md 或 specs/

## Guardrails

- 不启动 explore agent
- 只产出 design.md、sdd-match-report.md、api-contract.md 和 style-guide.md，不产出 tasks.md / specs
- 上下文仅来自输入文件（proposal.md / config.yaml / design-data.json / sdd-reuse.md）

## 产出

| 文件 | 说明 |
|------|------|
| `openspec/changes/<change-name>/design.md` | openspec 标准设计文档 |
| `openspec/changes/<change-name>/session/sdd-match-report.md` | 逐元素匹配结果 |
| `openspec/changes/<change-name>/session/api-contract.md` | 接口合约表（含字段类型） |
| `openspec/changes/<change-name>/session/style-guide.md` | 组件样式清单（供 apply 阶段精确还原） |

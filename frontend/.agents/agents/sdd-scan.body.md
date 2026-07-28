# SDD Scan — 代码库可复用资源扫描

扫描项目代码，提取可复用的组件、函数。

## 输入

- `openspec/changes/<change-name>/proposal.md`（必读，从中推断目标入口 entry，若推断结果模糊则使用 question 工具让用户确认）

## 流程

### 0. 确认项目类型并推断目标入口

**读取 `openspec/config.yaml` 确认入口类型**：

```bash
Select-String -Path "openspec/config.yaml" -Pattern "多入口"
```

- 匹配到 → **多入口项目**，继续推断目标入口
- 未匹配到 → **单入口项目**，跳过入口推断，只做全局扫描

**多入口时从 proposal.md 推断目标入口**：

读取 `openspec/changes/<change-name>/proposal.md`，从以下节推断入口 entry：

**优先从 Impact 节匹配路径模式**：

```
# 匹配 openspec/changes/<change>/proposal.md 中
# Impact 节内 src/pages/<entry>/ 的模式
rg "src/pages/([^/]+)" path/to/proposal.md
```

**其次从 Capabilities / What Changes 节关键词匹配**：

- 查找已知入口名（fundtracker, crypto, ...）在描述中的出现
- 取第一个匹配

**若推断出 entry** → 全局扫描 + 该入口特有扫描
**若未推断出** → 使用 question 工具让用户确认目标入口，确认后再执行对应扫描
**若匹配到多个** → 使用 question 工具列出所有可能性让用户选择

### 1. Vue 组件

扫描以下目录：

**全局共享组件**（始终扫描）：

```
src/components/
```

**入口特有组件**（推断出 entry 时扫描）：

```
src/pages/<entry>/components/
```

```bash
# 查找所有组件文件
rg -g "*.vue" -l "^<template>" src/components/
rg -g "*.tsx" -l "export.*function\|export default" src/components/

# 入口特有组件（如已推断 entry）
if ($entry) {
  rg -g "*.vue" -l "^<template>" src/pages/$entry/components/
}
```

对每个组件提取：

```
组件名 | 文件路径 | Props 接口 | 事件 | 匹配关键词 | 内部子组件 | 说明（文件名推断）
```

从 `.vue` 文件提取 Props：

```bash
# 提取 defineProps / Props 类型
rg "defineProps<" 组件文件路径
rg "withDefaults" 组件文件路径
```

扫描组件内部引用的子组件：

```bash
# Vue: template 中的 PascalCase 自定义标签（排除 HTML 原生标签和 UI 库组件）
rg -g "*.vue" -o "(?<=<)[A-Z][a-zA-Z]*" <组件文件路径> | Sort-Object -Unique

# TSX: import 的自定义组件
rg -g "*.tsx" "import.*from.*components" <组件文件路径>
```

过滤规则：从 `package.json` dependencies 和 config.yaml 技术栈中提取 UI 库前缀（如 `Van`/`A`/`El`），自动排除这些前缀的内部子组件。

### 2. 工具函数

**全局共享**（始终扫描）：

```
src/utils/ src/lib/ src/helpers/ src/hooks/
```

**入口特有 hooks**（推断出 entry 时扫描）：

```
src/pages/<entry>/hooks/
```

```bash
rg -g "*.ts" "export function" src/utils/ src/lib/ src/helpers/ src/hooks/
rg -g "*.ts" "export const" src/utils/ src/lib/ src/helpers/ src/hooks/

if ($entry) {
  rg -g "*.ts" "export function" src/pages/$entry/hooks/
}
```

### 3. 页面视图（推断出 entry 时扫描）

```bash
if ($entry) {
  Get-ChildItem -Recurse -Filter "*.vue" src/pages/$entry/views/
  Get-ChildItem -Recurse -Filter "*.vue" src/pages/$entry/pages/
}
```

## 产出格式

写入 `openspec/changes/<change-name>/session/sdd-reuse.md`：

```markdown
# 可复用清单: <change-name>

## 入口

- **目标入口**: pages/<entry>/（自动推断）
- **项目类型**: 多入口 / 单入口（从 config.yaml 检测）
- 若无目标入口则仅列出全局共享资源

## 全局共享资源

### 组件

| 组件名      | 路径                           | Props          | 事件           | 匹配关键词          | 内部子组件          | 说明     |
| ----------- | ------------------------------ | -------------- | -------------- | ------------------- | ------------------- | -------- |
| Card        | src/components/Card.vue        | card: TodoCard | @edit, @delete | card, 卡片          | Avatar, Button, Tag | 卡片展示 |
| FilterPanel | src/components/FilterPanel.vue | ...            | ...            | filter, panel, 筛选 | Input, Select       | 筛选面板 |

Props 格式：`propName: Type (= default?)`，事件格式：`@eventName: payloadType`

### 函数/工具

| 函数名     | 路径                | 签名                                      | 说明       |
| ---------- | ------------------- | ----------------------------------------- | ---------- |
| formatDate | src/utils/date.ts   | (date: string, format?: string) => string | 日期格式化 |
| debounce   | src/utils/helper.ts | (fn: Function, delay: number) => Function | 防抖       |

### Hooks

| Hook 名 | 路径 | 入参 | 返回值 | 说明 |
|---------|------|------|--------|------|
| useAuth | src/hooks/useAuth.ts | ... | ... | 权限控制 |

<!-- 以下内容仅在多入口且有 targetEntry 时输出 -->
## 入口特有资源（pages/<entry>/）

### 页面级组件

与全局组件相同格式的表格，只列入口特有组件

### 页面视图

与入口相关的页面路由/视图列表

### Hooks

与全局 Hooks 相同格式的表格，只列入口特有 hooks

## Guardrails

- 不修改任何源码文件
- 组件 Props 定义优先从 `defineProps` / interface 提取，其次从模板使用推断
- 若项目无 `src/components/` 等标准目录，通过 `rg` 搜索 `export default` + 文件名筛选自行发现
- proposal.md 是必读项，必须从 `openspec/changes/<change-name>/` 读取，不存在则报错
- 入口推断模糊时必须询问用户确认，不得擅自假设

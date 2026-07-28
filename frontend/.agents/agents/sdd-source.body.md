# SDD Source — 设计数据获取

将用户输入的蓝湖 URL 或 `.pen` 文件路径转为标准设计数据 `design-data.json`。

## 输入

`<设计图源>` — 来自 `sdd-source` 命令参数。可以是蓝湖 URL 或 `.pen` 文件路径。

## 平台检测

检测输入来源：

```bash
# 蓝湖 URL
URL 含 "lanhuapp.com" → 蓝湖

# Pencil 文件
路径以 ".pen" 结尾 → Pencil

# 其他
都不是 → 报错：不支持的设计图源
```

## 蓝湖适配（mcp-lanhu）

### Step 1: URL 分类与设计图筛选

根据用户输入的 URL 判断范围：

| URL 特征 | 含义 | 操作 |
|---|---|---|
| 含 `image_id=xxx` | 已定位到单个设计图 | 直接 `lanhu_analyze_designs(url)` |
| 仅含 `pid=xxx`（无 image_id）或 `stage?pid=xxx` | 项目级链接，含多个设计图 | 先 `lanhu_list_designs(url)` 列出所有 → LLM 根据 proposal.md 筛选相关设计图 → 使用 **question 工具**让用户确认（显示匹配和不匹配的设计图名）→ 确认后调 `lanhu_analyze_designs(url, design_names)` → 用户否决时让用户手动输入要分析的设计图名 |
| `invite?sid=xxx` | 邀请链接 | 先 `lanhu_resolve_invite_link(invite_url)` 解析 → 得到真实 URL → 回上一层判断 |

调用失败时输出排查指引：检查 opencode.json 中 mcpServers.lanhu 配置、LANHU_COOKIE 是否有效、重启 opencode 后重试。

### Step 2: 获取设计数据

```bash
lanhu_analyze_designs(
  url: "<蓝湖URL>",
  design_names: ["<选中的设计图名>"],   # 可选，不传则分析全部
  include: ["tokens", "layout", "layers", "html"]
)
```

`include` 说明：
- `tokens` — 全局 Design Tokens（颜色、字体、阴影等）
- `layout` — 布局信息
- `layers` — 图层树结构（含文本、样式、父子关系）
- `html` — 设计稿转译的 HTML 结构，用于辅助 fieldHint 推断

### Step 3: 提取 Design Tokens

从返回数据中提取全局 Design Tokens：

```
tokens.colors       → 所有颜色值（十六进制）
tokens.fonts        → 字体族、字号列表
tokens.shadows      → 阴影值
tokens.radii        → 圆角值
tokens.spacing      → 间距值
```

### Step 4: 提取图层

对每个图层提取以下字段：

```
name              → 图层名
type              → 图层类型（text/shape/group/image）
textContent       → 文本内容（仅 text 类型图层，蓝湖 API 返回的 text 属性）
description       → 从 name 推断中文描述（优先匹配映射表，未命中由 LLM 语义推断），无意义名称取 null
style.color       → 文本颜色
style.fontSize    → 字号
style.fontFamily  → 字体
style.fontWeight  → 字重
style.backgroundColor → 背景色
style.borderRadius    → 圆角
style.padding     → 内边距
style.margin      → 外边距
style.width       → 宽度
style.height      → 高度
style.boxShadow   → 阴影
position          → x, y 坐标
children          → 从图层树递归提取，含递归层级 + 布局属性 + containers 保留 + 装饰元素不跳过（规则同 Pencil 适配 Step 4）
```

description 推断规则（两端共用）：

1. 图层名为中文 → 直接作为 description
2. 英文 kebab-case → 按语义转中文描述
3. 完全无意义的名称（如 `rect_123`、`group_5`）→ `null`

children 为轻量级树结构，仅用于结构匹配：

```json
{
  "name": "<父图层>",
  "type": "group",
  "children": [
    { "name": "<子图层>", "type": "text", "textContent": "..." }
  ]
}
```

每层递归规则同 Step 4（含递归层级 + 布局属性，不含视觉样式）。

### Step 5: 字段类型推断

两层推断，HTML 标签优先：

**第一层（HTML 标签推断）：** 从 `include: ["html"]` 返回的 HTML 结构中提取标签，覆盖展示形态推断：

| HTML 标签 | fieldHint | 例子 |
|---|---|---|
| `<input>` / `<input type="text">` | `"string // input value"` | 即使图层名不含 input 也能识别 |
| `<input type="checkbox">` / `<switch>` | `"boolean"` | checkbox |
| `<img>` | `"string // URL"` | 图片 |
| `<button>` | `"action // click"` | 可点击按钮 |
| `<select>` / `<option>` | `"T // select"` | 下拉选择 |
| `<textarea>` | `"string // textarea"` | 多行文本输入 |

**第二层（展示形态推断）：** 无 HTML 或 HTML 未匹配时使用：

```
纯数字（无格式符号）     → fieldHint: "number"
带格式数字（12,345.67） → fieldHint: "number // formatted"
金额格式（¥123.45）     → fieldHint: "string // currency"
百分比格式（+7.78%）    → fieldHint: "string // percentage"
纯文字                  → fieldHint: "string"
列表结构                → fieldHint: "T[]"
图片                    → fieldHint: "string // URL"
含 input/select 字样    → fieldHint: "string // input value"
```

### Step 6: 写入 design-data.json

写入 `openspec/changes/<change-name>/session/design-data.json`：

```json
{
  "platform": "lanhu",
  "tokens": {
    "colors": { "<name>": "<hex>" },
    "fonts": [{ "family": "", "sizes": [] }],
    "shadows": [],
    "radii": [],
    "spacing": []
  },
  "pages": [
    {
      "title": "<页面名>",
      "layers": [
        {
          "name": "<图层名>",
          "type": "<图层类型>",
          "textContent": "<文本内容>",
          "fieldHint": "<推断类型>",
          "description": "<描述>",
          "style": {
            "color": "#333333",
            "fontSize": "16px",
            "fontFamily": "PingFang SC",
            "fontWeight": 400,
            "backgroundColor": "#FFFFFF",
            "borderRadius": "8px",
            "padding": "12px 16px",
            "width": "375px",
            "height": "44px",
            "boxShadow": "0 2px 4px rgba(0,0,0,0.1)"
          },
          "position": { "x": 0, "y": 0 }
        }
      ],
      "children": [
        {
          "name": "<父图层>",
          "type": "group",
          "children": [
            { "name": "<子图层>", "type": "text", "textContent": "..." }
          ]
        }
      ]
    }
  ]
}
```

## Pencil 适配

### Step 1: N/A

Pencil 无 URL 解析，跳过此步骤。

### Step 2: 读取 .pen 文件并遍历页面

```bash
pencil_batch_get(filePath: "<设计图源>")
```

遍历返回结果中的页面 frame，按 title 字段识别。

### Step 3: 提取 Design Tokens

```bash
pencil_get_variables(filePath: "<设计图源>")
```

映射规则：

| Pencil 变量类型 | tokens 键名 |
|---|---|
| `type: "color"` | `tokens.colors` |
| `type: "font"` | `tokens.fonts` |
| `type: "shadow"` | `tokens.shadows` |
| `type: "corner"` 或 `name` 含 `radius` | `tokens.radii` |
| `type: "spacing"` 或 `name` 含 `spacing/margin/padding` | `tokens.spacing` |

无可读变量时保留空对象 `{}`，与蓝湖一致。

### Step 4: 提取图层

对每个图层提取以下字段：

| 字段 | 来源 | 说明 |
|------|------|------|
| name | node.name | 图层名 |
| type | node.type | 图层类型（text/shape/group/image） |
| textContent | node.textContent | 文本内容（仅 text 类型图层） |
| fieldHint | 按展示形态推断 | 同蓝湖 Step 5 |
| description | 从 name 推断中文描述 | 同蓝湖 Step 4 的映射表 |
| style | 以下映射表 | 与蓝湖键名一致 |
| children | node.children → 递归处理 | 含递归层级 + 布局属性 + containers 保留 + 装饰元素不跳过（见下方递归规则） |

style 属性映射（与蓝湖完全一致）：

| style 键 | Pencil 节点属性 | 适用节点 |
|---|---|---|
| color | fills[0].color (hex) | text |
| fontSize | fontSize | text |
| fontFamily | fontFamily | text |
| fontWeight | fontWeight | text |
| backgroundColor | fills[0].color (hex) | 非 text |
| borderRadius | cornerRadii[0] 或 cornerRadius | rectangle/frame |
| padding | padding → "top right bottom left" | frame/group |
| width | width | 所有 |
| height | height | 所有 |
| boxShadow | effects 中 type="dropShadow" → "offsetX offsetY blur color" | 所有 |

缺失的属性输出 `null`，与蓝湖一致。

#### children 递归规则

children 的用途是保留组件的布局结构（元素排列方式），供下游匹配和实现。规则如下：

1. **递归范围**：对所有 frame/group 类型节点执行，不限页面还是可复用组件，每层子节点按原始顺序排列
2. **中间容器保留**：中间容器 frame（如"标题行""估值行"）作为树节点保留，不拍平
3. **装饰元素保留**：纯装饰元素（rectangle/line 等 type 非 text/icon/ref 且无文本内容的节点）保留，不跳过
4. **每层字段**：
   - `name` / `type` / `textContent`（仅 text 类型）
   - **布局属性**：`layout` / `gap` / `padding` / `justifyContent` / `alignItems`（从父节点的 style 中取）
   - **sizing 属性**：`width` / `height`（当值为 `fill_container` 或 `fit_content` 时记录，纯数值不记）
   - 不含视觉样式（color / fontSize / fill / backgroundColor / cornerRadius / fontWeight 等）
5. **ref 类型**：记录 `ref` 目标组件名，不展开子树

### Step 5: 字段类型推断

仅按展示形态推断（Pencil 无 HTML）：

```
纯数字（无格式符号）     → fieldHint: "number"
带格式数字（12,345.67） → fieldHint: "number // formatted"
金额格式（¥123.45）     → fieldHint: "string // currency"
百分比格式（+7.78%）    → fieldHint: "string // percentage"
纯文字                  → fieldHint: "string"
checkbox/switch         → fieldHint: "boolean"
列表结构                → fieldHint: "T[]"
图片                    → fieldHint: "string // URL"
含 input/select 字样    → fieldHint: "string // input value"
```

### Step 6: 写入 design-data.json

```json
{
  "platform": "pencil",
  "tokens": {
    "colors": { "<name>": "<hex>" },
    "fonts": [{ "family": "", "sizes": [] }],
    "shadows": [],
    "radii": [],
    "spacing": []
  },
  "pages": [
    {
      "title": "<页面名>",
      "layers": [
        {
          "name": "<图层名>",
          "type": "<图层类型>",
          "textContent": "<文本内容>",
          "fieldHint": "<推断类型>",
          "description": "<图层描述>",
          "style": {
            "color": "#333333",
            "fontSize": "16px",
            "fontFamily": "PingFang SC",
            "fontWeight": 400,
            "backgroundColor": "#FFFFFF",
            "borderRadius": "8px",
            "padding": "12px 16px",
            "width": "375px",
            "height": "44px",
            "boxShadow": "0 2px 4px rgba(0,0,0,0.1)"
          },
          "position": { "x": 0, "y": 0 }
        }
      ],
      "children": [
        {
          "name": "<父图层>",
          "type": "group",
          "children": [
            { "name": "<子图层>", "type": "text", "textContent": "..." }
          ]
        }
      ]
    }
  ],
  "components": [
    {
      "name": "<组件名>",
      "type": "frame",
      "reusable": true,
      "layers": [
        {
          "name": "<图层名>",
          "type": "<图层类型>",
          "fieldHint": "<推断类型>",
          "style": { "...": "..." }
        }
      ],
      "children": [
        {
          "name": "<父图层>",
          "type": "frame",
          "layout": "vertical",
          "gap": 8,
          "children": [
            { "name": "<子图层>", "type": "text", "textContent": "..." }
          ]
        }
      ]
    }
  ]
}
```

## Guardrails

- 蓝湖返回的数据中若 `tokens` 或 `layers` 为空 → 输出警告"设计稿可能为纯图片，样式数据不完整"
- 不修改原始设计数据，只做格式转换
- `design-data.json` 必须写入 `openspec/changes/<change-name>/session/` 目录下
- Pencil 适配必须输出 `tokens` 顶层字段，即使为空对象
- 每层必须输出 `description`，无法推断时取 `null`
- `style` 字段键名与蓝湖一致，缺失属性输出 `null`
- `textContent` 仅 text 类型图层输出，其他类型省略
- 每页和每个可复用组件必须同时输出 `layers`（平铺+完整样式）和 `children`（嵌套树+布局属性）
- 可复用组件（reusable: true）的 children 递归规则与页面一致，不得拍平为单层 layers
- `children` 树中的布局属性仅包含 `layout`/`gap`/`padding`/`justifyContent`/`alignItems` 和 `width`/`height`（仅 fill_container/fit_content 时），不含视觉样式
- 中间容器 frame 和装饰元素（rectangle/line）必须在 children 中保留，不可跳过或拍平
- 项目级链接（无 image_id）必须先 `list` → LLM 筛选 → 用户确认，不得自动分析所有设计图

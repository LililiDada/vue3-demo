---
description: 扫描项目代码，输出可复用组件/函数/Hooks，用于 sdd-design 设计匹配
agent: sdd-scan
---

# SDD Scan

扫描代码库，提取可复用代码清单。这是 `/sdd-design` 的前置步骤。

**输入**: `sdd-scan <change-name>`

## 步骤

### 1. 确认变更并读取提案

```bash
# 检查变更是否存在，不存在则报错
if (-not (Test-Path "openspec/changes/<change-name>/proposal.md")) {
  Write-Error "变更 '<change-name>' 不存在，可用 openspec status 查看已有变更"
  exit 1
}

# 读取提案，了解变更背景和目标入口
cat openspec/changes/<change-name>/proposal.md
```

### 2. 扫描代码库

加载 `sdd-scan` agent（工具：Read/Write/Bash/Grep/Glob）：

1. 从 proposal.md 推断目标 entry，若推断结果模糊则使用 question 工具让用户确认（详见 agent body）
2. 通过 `rg` + `glob` 扫描：

   ```bash
   # 扫描 Vue/React 组件
   Get-ChildItem -Recurse -Filter "*.vue" src/components/
   Get-ChildItem -Recurse -Filter "*.tsx" src/components/
   
   # 扫描工具函数
    Get-ChildItem -Recurse -Filter "*.ts" src/utils/ src/lib/
    
    # 检测 npm 依赖
   cat package.json | ConvertFrom-Json | Select-Object -ExpandProperty dependencies
   ```

完整逻辑参见 `.agents/agents/sdd-scan.body.md`。

### 3. 写入产出

- `openspec/changes/<change-name>/session/sdd-reuse.md`

### 4. 报告结果

- 组件数量、函数数量、npm 包数量
- 目标入口（如果有）
- 提示下一步：`/sdd-design <change-name>` 生成 design.md

**Guardrails**

- 如果 proposal.md 不存在，必须报错退出，不进行任何扫描

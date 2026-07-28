---
name: sdd
description: 设计图驱动开发。从蓝湖/Pencil 获取设计，匹配现有代码，生成设计文档 + 任务清单 + 规格 + Gate Review。
compatibility: 需 opencode CLI + 蓝湖 MCP 或 Pencil 扩展。
---

# SDD — 设计图驱动开发

## 流程（拆分步骤）

```
/opsx:sdd-source <name> <URL|.pen>   → session/design-data.json
/opsx:sdd-scan <name>                → session/sdd-reuse.md
/opsx:sdd-design <name>              → design.md + sdd-match-report.md
  ↓
/opsx:continue                       → tasks.md + specs/（openspec 原有流程）
  ↓
/opsx:apply                          → 实现
```

## 文件映射

| 阶段 | 文件 |
|------|------|
| 获取设计数据 | `.opencode/commands/opsx/sdd-source.md` + `.agents/agents/sdd-source.body.md` |
| 扫描可复用代码 | `.opencode/commands/opsx/sdd-scan.md` + `.agents/agents/sdd-scan.body.md` + `.opencode/agents/sdd-scan.md` |
| 生成 design.md | `.opencode/commands/opsx/sdd-design.md` + `.agents/agents/sdd-design.body.md` + `.opencode/agents/sdd-design.md` |
| Gate审查 | `.opencode/agents/sdd-audit.md` + `.agents/agents/sdd-audit.body.md` |
| 旧版入口（已弃用） | `.opencode/commands/opsx/sdd-generate.md` |

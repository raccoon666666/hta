# HTA 项目规范

## 目录结构

```
project-root/
  AGENTS.md              # 本文件（规范总纲）
  docs/                  # 手册文档
    type-definitions.md  # 类型定义规范
    com-components.md    # COM 组件规范
    component-library.md # 公共组件库使用指南
    known-issues.md      # 已知问题日志
  library/               # 第三方库
    vue/                 # Vue2 第三方库
      vue.js
      vue.d.ts           # Vue2 类型定义
  components/            # 公共组件库（所有app共享）
    js/com.js            # COM 组件封装
    js/common.js         # Mixin + 工具函数 + Vue 指令
    css/common.css       # 公共样式
    types/com.d.ts       # COM 组件类型定义
    types/common.d.ts    # 公共组件类型定义
  {app-name}/            # 每个应用独立文件夹
    main.hta             # 入口文件
    js/                  # 应用专属 JS
    css/                 # 应用专属样式
    types/               # 应用类型定义
      {app-name}.d.ts
    data/                # 应用数据存储（JSON 文件）
    logs/                # 日志目录
  tools/                 # 验证工具
```

## 核心规则

### 引用路径
```
../library/vue/vue.js      # Vue2 库
../components/js/com.js   # COM 组件（必须在 common.js 之前）
../components/js/common.js # Mixin + 工具函数
../components/css/common.css # 公共样式
```

### 文件操作
- 禁止擅自删除文件，删除前须确认并说明原因
- 移动/重命名须提前告知
- 严禁删除 `.git` 文件夹

### 编码规范
- **HTA/JS/CSS 文件**：UTF-8 with BOM
- **PowerShell 脚本 (.ps1)**：UTF-8 无 BOM
- 写入后必须运行 `verify-hta.ps1` 验证

### JavaScript 编写规范
- 使用 `var`，禁止 `let`/`const`/`class`/`箭头函数`/`template literal`/`for...of`
- 不支持 `WScript` 对象（如 `WScript.Sleep`）
- 禁止直接使用 `new ActiveXObject()`，必须通过 `COMComponents` 获取

### 类型定义
- 每个 app 的 JS 必须在 app 内的 `types/` 创建对应的 `.d.ts`
- 公共组件库的 JS 必须在 `components/types/` 创建对应的 `.d.ts`
- 详细规范见 [docs/type-definitions.md](docs/type-definitions.md)

## 工具脚本

| 脚本 | 用法 | 说明 |
|------|------|------|
| `tools\verify-hta.ps1 <files>` | `.\tools\verify-hta.ps1 app\main.hta app\js\app.js` | 验证编码、括号匹配、ES6+ 语法 |
| `tools\fix-encoding.ps1 <files>` | `.\tools\fix-encoding.ps1 app\main.hta` | 修复文件为 UTF-8 with BOM |
| `tools\new-hta.ps1 <name>` | `.\tools\new-hta.ps1 my-app` | 创建新的 HTA 应用目录结构（含 .d.ts 模板） |

**工作流（强制执行）：**
1. 写完后用 `verify-hta.ps1` 检查所有新建/修改的文件
2. 如果报 encoding 错误，用 `fix-encoding.ps1` 修复后再验证
3. 如果报语法错误，修复 JS 代码后再次验证
4. 全部 `[PASS]` 后，执行「固化检查」
5. 固化完成后，任务才算完成

## 详细文档

| 文档 | 说明 |
|------|------|
| [docs/type-definitions.md](docs/type-definitions.md) | 类型定义编写规范、接口定义示例 |
| [docs/com-components.md](docs/com-components.md) | COM 组件帮助函数参考、使用示例 |
| [docs/component-library.md](docs/component-library.md) | 公共组件库（Mixin/指令/样式）使用指南 |
| [docs/known-issues.md](docs/known-issues.md) | 已知问题日志 |

## 自完善反馈机制

### 触发条件（满足任一）
- 运行时出现报错/异常，修复后确认是环境/工具/兼容性问题
- 用户指出"为什么又犯同样的错"类问题
- 发现已有规范/脚本无法覆盖的边界情况
- 同一个问题在同一会话中被修复两次及以上

### 固化流程
1. **识别** — 定位问题根因
2. **修复** — 修正当前文件或代码
3. **归类** — 判断写入位置：
   - 编码/语法/兼容性问题 → 更新「编码规范」「JavaScript 编写规范」
   - 检测/修复可自动化 → 更新 `tools\` 下的对应脚本
   - 目录/模板可预防 → 更新 `new-hta.ps1` 生成的模板内容
   - 操作流程缺陷 → 更新「工具脚本」工作流章节
4. **更新** — 编辑 AGENTS.md 或 tools 脚本
5. **记录** — 在 [docs/known-issues.md](docs/known-issues.md) 追加条目

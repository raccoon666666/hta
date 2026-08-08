## 目录结构规范

```
project-root/
  AGENTS.md          # 本文件
  library/           # 第三方库（如 vue.js）
  {app-name}/        # 每个应用独立一个文件夹
    main.hta         # 入口文件
    app.ico          # 应用图标
    js/              # JS 脚本
    css/             # 样式文件
    logs/            # 日志目录
```

### 规则
- `library/` 只放第三方库，按库名建子目录（如 `library/vue/`）
- 每个应用独立一个文件夹，互不干扰
- 入口文件统一命名为 `main.hta`
- 日志写在各自应用的 `logs/` 目录下

## 文件操作规则

1. **禁止擅自删除文件** — 不得在未告知用户的情况下删除任何文件。
2. **删除前须确认** — 确实需要删除文件时，必须先说明删除原因，获得用户明确同意后方可执行。
3. **移动/重命名也需确认** — 移动文件到其他目录（包括回收站）或重命名文件，同样需要提前告知用户。

## 恢复文件规则

如需恢复之前删除的文件：
- 说明哪些文件被误删、恢复后的位置
- 从可信任源（npm CDN 等）重新下载，不使用不可靠来源

## 文件编码规范

1. **HTA 文件必须使用 UTF-8 with BOM 编码保存** — main.hta、css、js 文件含中文时，无 BOM 会导致 IE 引擎显示乱码。
2. **PowerShell 脚本 (.ps1) 使用无 BOM 的 UTF-8** — 有 BOM 会导致 PowerShell 解析错误。
3. 写入文件后必须运行验证脚本检查编码（见下方工具调用）。

## JavaScript 编写规范

1. **JScript 兼容性** — HTA 使用 IE11 的 JScript 引擎，不支持 ES6+ 语法：
   - 禁止箭头函数 `=>`
   - 禁止 `let` / `const`（使用 `var`）
   - 禁止 template literal `` ` ``
   - 禁止 `for...of`
   - 禁止 `class`
   - 不支持 `WScript` 对象（如 `WScript.Sleep`、`WScript.Arguments`）
2. **写完必须验证语法** — 使用下方工具脚本。

## 工具脚本

项目根目录 `tools/` 下提供通用验证工具，写完文件后必须调用：

| 脚本 | 用法 | 说明 |
|------|------|------|
| `tools\verify-hta.ps1 <files>` | `.\tools\verify-hta.ps1 app\main.hta app\js\app.js` | 验证编码、括号匹配、ES6+ 语法 |
| `tools\fix-encoding.ps1 <files>` | `.\tools\fix-encoding.ps1 app\main.hta` | 修复文件为 UTF-8 with BOM |
| `tools\new-hta.ps1 <name>` | `.\tools\new-hta.ps1 my-app` | 创建新的 HTA 应用目录结构 |

**工作流（强制执行）：**
1. 写完后用 `verify-hta.ps1` 检查所有新建/修改的文件
2. 如果报 encoding 错误，用 `fix-encoding.ps1` 修复后再验证
3. 如果报语法错误，修复 JS 代码后再次验证
4. 全部 `[PASS]` 后，**执行「固化检查」**：回顾本次修复过的问题，按下方「自完善反馈机制」判断是否需固化
5. 固化完成后，任务才算完成

## 自完善反馈机制

### 触发条件（满足任一即触发）
- 运行时出现报错/异常，修复后确认是环境/工具/兼容性问题
- 用户指出"为什么又犯同样的错"类问题
- 发现已有规范/脚本无法覆盖的边界情况
- 同一个问题在同一会话中被修复两次及以上

### 固化流程（必须执行）
1. **识别** — 定位问题根因
2. **修复** — 修正当前文件或代码
3. **归类** — 判断写入位置：
   - **编码/语法/兼容性问题** → 更新「文件编码规范」「JavaScript 编写规范」
   - **检测/修复可自动化** → 更新 `tools\` 下的对应脚本
   - **目录/模板可预防** → 更新 `new-hta.ps1` 生成的模板内容
   - **操作流程缺陷** → 更新「工具脚本」工作流章节
4. **更新** — 编辑 AGENTS.md 或 tools 脚本
5. **记录** — 在下方表格追加条目

### 已知问题日志

| # | 问题 | 解决方案 | 固化位置 |
|---|------|----------|----------|
| 1 | 多次 edit 操作后 JS 文件中文出现乱码（U+FFFD） | 每次写入后用 `fix-encoding.ps1` 重新保存为 UTF-8 with BOM | 「文件编码规范」+ `fix-encoding.ps1` |
| 2 | JScript 不支持 `WScript.Sleep` | 使用 busy-wait 的 `sleep()` 函数替代 | 「JavaScript 编写规范」 |
| 3 | PowerShell 脚本 (.ps1) 有 BOM 导致解析失败 | PS1 文件使用无 BOM 的 UTF-8 编码 | 「文件编码规范」第 2 条 |
| 4 | 验证脚本 `\bclass\b` 误匹配 HTML 属性 `class="..."` | 正则改为 `(?<=^|[^"''=:\w])class\s+\w` | `tools\verify-hta.ps1` |
| 5 | PowerShell `ReadAllBytes`+`WriteAllText` 双重叠加 BOM | 使用 `Encoding.UTF8.GetBytes` + `WriteAllBytes` 精确控制 | `tools\fix-encoding.ps1` |
| 6 | IE11 不支持 `Element.closest()` | 手动遍历 parentNode 判断祖先元素 | 「JavaScript 编写规范」 |

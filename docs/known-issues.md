# 已知问题日志

记录项目运行、开发过程中遇到的已知问题及其解决方案。

| # | 问题 | 解决方案 | 固化位置 |
|---|------|----------|----------|
| 1 | 多次 edit 操作后 JS 文件中文出现乱码（U+FFFD） | 每次写入后用 `fix-encoding.ps1` 重新保存为 UTF-8 with BOM | 「编码规范」+ `fix-encoding.ps1` |
| 2 | JScript 不支持 `WScript.Sleep` | 使用 busy-wait 的 `sleep()` 函数替代 | 「JavaScript 编写规范」 |
| 3 | PowerShell 脚本 (.ps1) 有 BOM 导致解析失败 | PS1 文件使用无 BOM 的 UTF-8 编码 | 「编码规范」第 2 条 |
| 4 | 验证脚本 `\bclass\b` 误匹配 HTML 属性 `class="..."` | 正则改为 `(?<=^|[^"''=:\w])class\s+\w` | `tools\verify-hta.ps1` |
| 5 | PowerShell `ReadAllBytes`+`WriteAllText` 双重叠加 BOM | 使用 `Encoding.UTF8.GetBytes` + `WriteAllBytes` 精确控制 | `tools\fix-encoding.ps1` |
| 6 | IE11 不支持 `Element.closest()` | 手动遍历 parentNode 判断祖先元素 | 「JavaScript 编写规范」 |
| 7 | fix-encoding 覆盖写导致文件内容丢失 | 写入后立即验证文件非空，edit 操作前先 Read | 「工具脚本」工作流 |
| 8 | git 输出 UTF-8 中文被 WScript 按 ANSI 代码页解码导致乱码 | 运行 git 时加 `-c i18n.logOutputEncoding=cp<ACP>`，ACP 从注册表 `HKLM\SYSTEM\CurrentControlSet\Control\Nls\CodePage\ACP` 读取 | git-manager `runGitSync` 封装 |

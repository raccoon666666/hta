# COM 组件规范

本文档说明 HTA 项目中 COM 组件的使用方法和可用函数。

## 基本原则

- **禁止在 app 中直接使用 `new ActiveXObject()`**
- 所有 COM 对象必须通过 `COMComponents` 获取
- COM 实例会被缓存，避免重复创建

## 可用的 COM 帮助函数

### WScript.Shell 相关

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `COMComponents.getShell()` | 获取 WScript.Shell 实例 | `WScriptShell` |
| `COMComponents.getEnvVars(type)` | 获取环境变量集合（"User"/"System"） | `EnvironmentObject` |
| `COMComponents.runCmd(cmd, cwd)` | 执行命令（异步） | `WshExec` |
| `COMComponents.runCmdSync(cmd, cwd)` | 执行命令（同步，等待完成） | `string` |
| `COMComponents.readReg(path)` | 读取注册表 | `string\|number` |
| `COMComponents.writeReg(path, value, type?)` | 写入注册表 | `void` |

### FileSystemObject 相关

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `COMComponents.getFSO()` | 获取 Scripting.FileSystemObject 实例 | `FileSystemObject` |
| `COMComponents.folderExists(path)` | 判断文件夹是否存在 | `boolean` |
| `COMComponents.fileExists(path)` | 判断文件是否存在 | `boolean` |
| `COMComponents.createFolder(path)` | 创建文件夹（如果不存在） | `string` |
| `COMComponents.getParentFolder(path)` | 获取父文件夹路径 | `string` |
| `COMComponents.getBasePath()` | 获取当前 HTA 的文件基础路径 | `string` |
| `COMComponents.openTextFile(path, mode?, create?)` | 打开文本文件 | `TextStream` |

### Shell.Application 相关

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `COMComponents.getShellApp()` | 获取 Shell.Application 实例 | `ShellApplication` |
| `COMComponents.browseForFolder(title?, root?)` | 浏览文件夹对话框 | `string\|null` |

## 使用示例

### 执行命令并等待完成

```javascript
var output = COMComponents.runCmdSync('git status', repoPath);
if (output.indexOf('error') === -1) {
    // 成功
}
```

### 读写注册表

```javascript
// 读取
var repos = COMComponents.readReg('HKCU\\Software\\GitManager\\RecentRepos');

// 写入
COMComponents.writeReg('HKCU\\Software\\GitManager\\RecentRepos', value);
```

### 文件操作

```javascript
if (COMComponents.folderExists(path)) {
    var fso = COMComponents.getFSO();
    // ...
}

// 创建目录（如果不存在）
COMComponents.createFolder('C:\\temp\\myapp');
```

### 浏览文件夹

```javascript
var path = COMComponents.browseForFolder('选择Git仓库目录');
if (path) {
    // 用户选择了文件夹
}
```

## 新增 COM 组件的流程

1. 在 `components/js/com.js` 中添加封装函数
2. 在 `components/types/com.d.ts` 中添加对应的 TypeScript 类型定义（命名空间 `COMComponents`）
3. 更新 AGENTS.md 的「COM 帮助函数」表格
4. 各 app 使用新的 COM 帮助函数

## COM 接口参考

详细接口定义见 `components/types/com.d.ts`。
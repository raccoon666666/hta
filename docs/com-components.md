# COM 组件规范

本文档说明 HTA 项目中 COM 组件的使用方法和可用函数。

## 基本原则

- **禁止在 app 中直接使用 `new ActiveXObject()`**
- 所有 COM 对象必须通过 `$COM` 获取
- COM 实例会被缓存，避免重复创建

## 可用的 COM 帮助函数

### WScript.Shell 相关

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `$COM.shell` | 获取 WScript.Shell 实例 | `WScriptShell` |
| `$COM.env.get(type)` | 获取环境变量集合（"User"/"System"） | `EnvironmentObject` |
| `$COM.cmd.run(cmd, cwd)` | 执行命令（异步） | `WshExec` |
| `$COM.cmd.runSync(cmd, cwd)` | 执行命令（同步，等待完成） | `string` |
| `$COM.reg.read(path)` | 读取注册表 | `string\|number` |
| `$COM.reg.write(path, value, type?)` | 写入注册表 | `void` |

### FileSystemObject 相关

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `$COM.fso` | 获取 Scripting.FileSystemObject 实例 | `FileSystemObject` |
| `$COM.file.folderExists(path)` | 判断文件夹是否存在 | `boolean` |
| `$COM.file.exists(path)` | 判断文件是否存在 | `boolean` |
| `$COM.file.create(path)` | 创建文件夹（如果不存在） | `string` |
| `$COM.file.parent(path)` | 获取父文件夹路径 | `string` |
| `$COM.file.basePath()` | 获取当前 HTA 的文件基础路径 | `string` |
| `$COM.file.open(path, mode?, create?)` | 打开文本文件 | `TextStream` |

### Shell.Application 相关

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `$COM.shellApp` | 获取 Shell.Application 实例 | `ShellApplication` |
| `$COM.dialog.browseForFolder(title?, root?)` | 浏览文件夹对话框 | `string\|null` |

## 使用示例

### 执行命令并等待完成

```javascript
var output = $COM.cmd.runSync('git status', repoPath);
if (output.indexOf('error') === -1) {
    // 成功
}
```

### 读写注册表

```javascript
// 读取
var repos = $COM.reg.read('HKCU\\Software\\GitManager\\RecentRepos');

// 写入
$COM.reg.write('HKCU\\Software\\GitManager\\RecentRepos', value);
```

### 文件操作

```javascript
if ($COM.file.folderExists(path)) {
    var fso = $COM.fso;
    // ...
}

// 创建目录（如果不存在）
$COM.file.create('C:\\temp\\myapp');
```

### 浏览文件夹

```javascript
var path = $COM.dialog.browseForFolder('选择Git仓库目录');
if (path) {
    // 用户选择了文件夹
}
```

## 新增 COM 组件的流程

1. 在 `com/` 目录下对应的组件文件中添加封装函数
2. 在 `com/types/` 目录下对应的 `.d.ts` 文件中添加类型定义
3. 更新 AGENTS.md 的「COM 帮助函数」表格
4. 各 app 根据需要引用对应的 COM 组件文件

## COM 对象（$COM）

| 文件 | 全局变量 | 说明 |
|------|----------|------|
| `com/shell.js` | `$COM.shell` | WScript.Shell |
| `com/fso.js` | `$COM.fso` | FileSystemObject |
| `com/shell-app.js` | `$COM.shellApp` | Shell.Application |

## 辅助函数（$COM）

| 文件 | 说明 |
|------|------|
| `com/command.js` | 命令执行、注册表读写、环境变量 |
| `com/file.js` | 文件/文件夹操作 |
| `com/dialog.js` | 文件夹浏览对话框 |
| `com/json.js` | JSON 文件读写 |

## COM 接口参考

详细接口定义见 `com/types/` 目录。
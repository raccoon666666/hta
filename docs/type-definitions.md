# 类型定义规范

本文档说明 HTA 项目中 TypeScript 类型定义的编写和维护规范。

## 类型定义的作用

- **仅用于编辑器智能提示**（VS Code / WebStorm），运行时无效
- 帮助开发者在编写 JScript 时获得自动补全和错误提示
- 作为接口文档，明确函数签名和数据结构

## 命名空间

| 命名空间 | 文件 | 说明 |
|----------|------|------|
| `$COM` | `components/types/com.d.ts` | COM 组件（ActiveXObject 封装） |
| `$Component` | `components/types/common.d.ts` | 公共组件（Mixin/工具函数/指令） |

## 已提供的类型定义

| 文件 | 对应 JS | 说明 |
|------|---------|------|
| `com/types/com.d.ts` | `com/*.js` | 全局 COM 类型 |
| `com/types/shell.d.ts` | `com/shell.js` | WScript.Shell 类型定义 |
| `com/types/fso.d.ts` | `com/fso.js` | FileSystemObject 类型定义 |
| `com/types/shell-app.d.ts` | `com/shell-app.js` | Shell.Application 类型定义 |
| `com/types/json.d.ts` | `com/json.js` | JSON 文件操作类型定义 |
| `components/types/common.d.ts` | `components/js/common.js` | 公共组件类型定义（命名空间 `$Component`） |
| `components/types/promise.d.ts` | `components/js/promise.js` | Promise 类型定义 |
| `env-manager/types/env-manager.d.ts` | `env-manager/js/app.js` | 环境变量管理应用类型定义 |
| `git-manager/types/git-manager.d.ts` | `git-manager/js/app.js` | Git Manager 应用类型定义 |

## 编写规则

### 1. COM 组件类型定义 (`components/types/com.d.ts`)

```typescript
declare namespace $COM {
    interface WScriptShell {
        Environment(type: string): EnvironmentObject;
        Exec(command: string): WshExec;
        RegRead(path: string): string | number;
        // ...
    }
    
    function getShell(): WScriptShell;
    // ...
}
```

- 使用 `interface` 定义 COM 对象的方法、属性
- 所有 $COM 函数必须包含 JSDoc 注释
- 使用 `declare namespace $COM` 组织全局声明

### 2. 公共组件类型定义 (`components/types/common.d.ts`)

```typescript
declare namespace $Component {
    function sleep(ms: number): void;
    function writeLog(msg: string): void;
    
    const ToastMixin: {
        data(): { toastVisible: boolean; toastMessage: string; toastTimer: number | null; };
        methods: { showToast(msg: string, duration?: number): void; };
    };
    // ...
}
```

### 3. 应用类型定义 (`{app-name}/types/{app-name}.d.ts`)

```typescript
interface EnvItem {
    name: string;
    value: string;
    selected: boolean;
    isUser: boolean;
}

interface EnvManagerData {
    envList: EnvItem[];
    editingIndex: number;
    // ...
}

interface EnvManagerComputed {
    selectedCount: number;
    // ...
}

interface EnvManagerMethods {
    loadEnvVars(): void;
    // ...
}
```

每个应用的 `.d.ts` 需定义：
- **数据接口**：应用数据属性的类型
- **计算属性接口**：计算属性的返回类型
- **方法接口**：所有方法的签名

## 新增类型定义的流程

1. **新增 app 时**：同步在 app 内的 `types/` 中创建 `{app-name}.d.ts`
2. **新增公共组件方法时**：更新 `components/types/com.d.ts` 或 `common.d.ts`
3. **更新表格**：更新本文件的「已提供的类型定义」表格
4. **自动生成**：运行 `new-hta.ps1` 会自动生成对应的 `.d.ts` 模板

## 示例：完整的 COM 接口定义

```typescript
declare namespace $COM {
    interface FileSystemObject {
        FolderExists(path: string): boolean;
        FileExists(path: string): boolean;
        CreateFolder(path: string): Folder;
        OpenTextFile(filename: string, mode?: number, create?: boolean): TextStream;
    }
    
    interface TextStream {
        ReadAll(): string;
        WriteLine(text: string): void;
        Close(): void;
        readonly AtEndOfStream: boolean;
    }
}
```
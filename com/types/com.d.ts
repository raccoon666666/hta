/**
 * $COM 全局对象类型定义
 *
 * 设计原则：
 * 1. COM 对象直接挂载（shell/fso/shellApp）
 * 2. 辅助函数按职责分组到子对象（cmd/reg/env/file/json/dialog）
 * 3. 函数名在命名空间内保持简洁，不重复父对象语义
 * 4. 通过 .d.ts 提示参数类型，不在参数名中编码类型信息
 */

declare namespace $COM {
    // ========== COM 对象 ==========
    const shell: WScriptShell;
    const fso: FileSystemObject;
    const shellApp: ShellApplication;

    // ========== 子模块 ==========
    const cmd: CmdModule;
    const reg: RegModule;
    const env: EnvModule;
    const file: FileModule;
    const json: JsonModule;
    const dialog: DialogModule;

    // ========== WScript.Shell 接口 ==========
    interface WScriptShell {
        Environment(type: string): EnvironmentObject;
        Exec(command: string): WshExec;
        RegRead(path: string): string | number;
        RegWrite(path: string, value: string | number, type?: string): void;
        RegDelete(path: string): void;
        CurrentDirectory: string;
        ExpandEnvironmentStrings(str: string): string;
        Run(command: string, style?: number, wait?: boolean): number;
        SpecialFolders(name: string): string;
    }

    interface EnvironmentObject {
        Item(name: string): string;
        Remove(name: string): void;
        readonly Count: number;
    }

    interface WshExec {
        Status: number;
        StdOut: TextStream;
        StdErr: TextStream;
        StdIn: TextStream;
        Terminate(): void;
    }

    // ========== FileSystemObject 接口 ==========
    interface FileSystemObject {
        FolderExists(path: string): boolean;
        FileExists(path: string): boolean;
        GetParentFolderName(path: string): string;
        GetFolder(path: string): Folder;
        GetFile(path: string): File;
        CreateFolder(path: string): Folder;
        OpenTextFile(filename: string, mode?: number, create?: boolean, format?: number): TextStream;
        DeleteFolder(path: string, force?: boolean): void;
        DeleteFile(path: string, force?: boolean): void;
    }

    interface Folder {
        readonly Path: string;
        readonly Name: string;
    }

    interface File {
        readonly Path: string;
        readonly Name: string;
    }

    interface TextStream {
        Read(chars: number): string;
        ReadAll(): string;
        Write(text: string): void;
        WriteLine(text: string): void;
        Close(): void;
        readonly AtEndOfStream: boolean;
        readonly AtEndOfLine: boolean;
    }

    // ========== Shell.Application 接口 ==========
    interface ShellApplication {
        BrowseForFolder(hwnd: number, title: string, options: number, rootFolder?: any): FolderItem;
    }

    interface FolderItem {
        readonly Path: string;
        readonly Name: string;
        readonly Self: FolderItem;
    }

    // ========== Enumerator 接口 ==========
    interface Enumerator {
        atEnd(): boolean;
        moveNext(): void;
        item(): any;
        moveFirst(): void;
    }

    // ========== 子模块接口 ==========
    interface CmdModule {
        run(cmd: string, cwd?: string): WshExec;
        runSync(cmd: string, cwd?: string): string;
    }

    interface RegModule {
        read(path: string): string | number;
        write(path: string, value: string | number, type?: string): void;
    }

    interface EnvModule {
        get(type?: string): EnvironmentObject;
    }

    interface FileModule {
        exists(path: string): boolean;
        folderExists(path: string): boolean;
        create(path: string): string;
        parent(path: string): string;
        basePath(): string;
        open(path: string, mode?: number, create?: boolean): TextStream;
    }

    interface JsonModule {
        read(path: string): any;
        write(path: string, data: any): boolean;
    }

    interface DialogModule {
        browseForFolder(title?: string, root?: any): string | null;
    }
}

/** WScript.Shell COM 对象 */
declare var WScript: $COM.WScriptShell;

/** Enumerator 构造函数 */
declare function Enumerator(comObject: any): $COM.Enumerator;

/** ActiveXObject 构造函数 */
declare function ActiveXObject(progid: string): any;

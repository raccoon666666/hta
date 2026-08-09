/**
 * HTA 项目全局类型定义
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

declare namespace HTAComponents {
    // ========== 缓存管理 ==========
    const _comCache: { [key: string]: any };

    // ========== WScript.Shell ==========
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

    // ========== Scripting.FileSystemObject ==========
    interface FileSystemObject {
        FolderExists(path: string): boolean;
        FileExists(path: string): boolean;
        DriveExists(path: string): boolean;
        GetFolder(path: string): Folder;
        GetFile(path: string): File;
        GetParentFolderName(path: string): string;
        GetFileName(path: string): string;
        GetBaseName(path: string): string;
        GetExtensionName(path: string): string;
        GetTempName(): string;
        CreateFolder(path: string): Folder;
        CreateTextFile(filename: string, overwrite?: boolean, unicode?: boolean): TextStream;
        DeleteFolder(path: string, force?: boolean): void;
        DeleteFile(path: string, force?: boolean): void;
        CopyFile(source: string, destination: string, overwrite?: boolean): void;
        CopyFolder(source: string, destination: string, overwrite?: boolean): void;
        MoveFile(source: string, destination: string): void;
        MoveFolder(source: string, destination: string): void;
        OpenTextFile(filename: string, mode?: number, create?: boolean, format?: number): TextStream;
        Drives: DrivesCollection;
        GetAbsolutePathName(path: string): string;
        GetDriveName(path: string): string;
        BuildPath(base: string, name: string): string;
    }

    interface Folder {
        readonly Path: string;
        readonly Name: string;
        readonly ShortPath: string;
        readonly ShortName: string;
        readonly Drive: string;
        readonly ParentFolder: string;
        readonly Attributes: number;
        readonly DateCreated: Date;
        readonly DateLastAccessed: Date;
        readonly DateLastModified: Date;
        readonly Size: number;
        readonly Type: string;
        readonly Files: FilesCollection;
        readonly SubFolders: FoldersCollection;
        readonly IsRootFolder: boolean;
        Copy(destination: string, overwrite?: boolean): void;
        Delete(force?: boolean): void;
        Move(destination: string): void;
    }

    interface File {
        readonly Path: string;
        readonly Name: string;
        readonly ShortPath: string;
        readonly ShortName: string;
        readonly Drive: string;
        readonly ParentFolder: string;
        readonly Attributes: number;
        readonly DateCreated: Date;
        readonly DateLastAccessed: Date;
        readonly DateLastModified: Date;
        readonly Size: number;
        readonly Type: string;
        Copy(destination: string, overwrite?: boolean): void;
        Delete(force?: boolean): void;
        Move(destination: string): void;
        OpenAsTextStream(mode?: number, format?: number): TextStream;
    }

    interface TextStream {
        Read(chars: number): string;
        ReadAll(): string;
        ReadLine(): string;
        Write(text: string): void;
        WriteLine(text: string): void;
        WriteBlankLines(lines: number): void;
        Skip(chars: number): void;
        SkipLine(): void;
        Close(): void;
        readonly AtEndOfStream: boolean;
        readonly AtEndOfLine: boolean;
        readonly Column: number;
        readonly Line: number;
    }

    interface DrivesCollection {
        readonly Count: number;
        Item(key: string): Drive;
    }

    interface FilesCollection {
        readonly Count: number;
        Item(key: string): File;
    }

    interface FoldersCollection {
        readonly Count: number;
        Item(key: string): Folder;
    }

    interface Drive {
        readonly Path: string;
        readonly DriveLetter: string;
        readonly ShareName: string;
        readonly DriveType: number;
        readonly RootFolder: string;
        readonly AvailableSpace: number;
        readonly FreeSpace: number;
        readonly TotalSize: number;
        readonly VolumeName: string;
        readonly FileSystem: string;
        readonly IsReady: boolean;
        readonly SerialNumber: number;
    }

    // ========== Shell.Application ==========
    interface ShellApplication {
        BrowseForFolder(hwnd: number, title: string, options: number, rootFolder?: any): FolderItem;
        NameSpace(vFolder: any): Folder;
        Windows(): ShellWindows;
    }

    interface FolderItem {
        readonly Path: string;
        readonly Name: string;
        readonly Self: FolderItem;
        readonly Parent: any;
        readonly IsFolder: boolean;
        readonly IsFileSystem: boolean;
        readonly IsLink: boolean;
        readonly IsBrowsable: boolean;
        readonly GetLink: any;
        readonly GetFolder: any;
        readonly Verbs: FolderItemVerbs;
        readonly ModifyDate: Date;
        readonly Size: number;
        readonly Type: string;
        InvokeVerb(verb?: string): void;
    }

    interface FolderItemVerbs {
        readonly Count: number;
        Item(index: number): FolderItemVerb;
    }

    interface FolderItemVerb {
        readonly Name: string;
        DoIt(): void;
    }

    interface ShellWindows {
        readonly Count: number;
        Item(index: number): any;
    }

    // ========== Enumerator ==========
    interface Enumerator {
        atEnd(): boolean;
        moveNext(): void;
        item(): any;
        moveFirst(): void;
    }

    // ========== COM 工厂方法 ==========
    function getShell(): WScriptShell;
    function getFSO(): FileSystemObject;
    function getShellApp(): ShellApplication;
    function getEnvVars(type?: string): EnvironmentObject;
    function runCmd(cmd: string, cwd?: string): WshExec;
    function readReg(path: string): string | number;
    function writeReg(path: string, value: string | number, type?: string): void;
    function folderExists(path: string): boolean;
    function fileExists(path: string): boolean;
    function createFolder(path: string): string;
    function getParentFolder(path: string): string;
    function getBasePath(): string;
    function openTextFile(path: string, mode?: number, create?: boolean): TextStream;
    function browseForFolder(title?: string, root?: number): string | null;
    function runCmdSync(cmd: string, cwd?: string): string;

    // ========== 工具函数 ==========
    /** 阻塞等待（毫秒） */
    function sleep(ms: number): void;
    /** 写入日志到 logs/error.log */
    function writeLog(msg: string): void;

    // ========== Vue Mixins ==========
    /** Toast 通知 mixin，提供 showToast(msg, duration) 方法 */
    const ToastMixin: {
        data(): {
            toastVisible: boolean;
            toastMessage: string;
            toastTimer: number | null;
        };
        methods: {
            showToast(msg: string, duration?: number): void;
        };
    };

    /** 加载状态 mixin，提供 loading 数据属性 */
    const LoadingMixin: {
        data(): {
            loading: boolean;
        };
    };

    /** 自动聚焦指令 */
    const FocusDirective: {
        inserted(el: HTMLElement): void;
    };
}

// ========== 全局 COM 类型 ==========

/**
 * WScript.Shell COM 对象
 */
declare var WScript: {
    Shell: HTAComponents.WScriptShell;
    CreateObject(progid: string): any;
    Echo(text: string): void;
    Quit(exitCode?: number): number;
    ScriptFullName: string;
    ScriptName: string;
    Version: string;
    BuildVersion: string;
};

/**
 * Enumerator 构造函数
 */
declare function Enumerator(comObject: any): HTAComponents.Enumerator;

/**
 * ActiveXObject 构造函数
 */
declare function ActiveXObject(progid: string): any;

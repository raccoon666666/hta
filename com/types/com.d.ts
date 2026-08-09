/**
 * $COM 全局对象类型定义
 */

declare namespace $COM {
    // ========== COM 对象 ==========
    const shell: WScriptShell;
    const fso: FileSystemObject;
    const shellApp: ShellApplication;

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

    // ========== 辅助函数 ==========
    function runCmd(cmd: string, cwd?: string): WshExec;
    function runCmdSync(cmd: string, cwd?: string): string;
    function readReg(path: string): string | number;
    function writeReg(path: string, value: string | number, type?: string): void;
    function getEnvVars(type?: string): EnvironmentObject;
    function folderExists(path: string): boolean;
    function fileExists(path: string): boolean;
    function createFolder(path: string): string;
    function getParentFolder(path: string): string;
    function getBasePath(): string;
    function openTextFile(path: string, mode?: number, create?: boolean): TextStream;
    function browseForFolder(title?: string, root?: any): string | null;
    function readJsonFile(filePath: string): any;
    function writeJsonFile(filePath: string, data: any): boolean;
}

/** WScript.Shell COM 对象 */
declare var WScript: $COM.WScriptShell;

/** Enumerator 构造函数 */
declare function Enumerator(comObject: any): $COM.Enumerator;

/** ActiveXObject 构造函数 */
declare function ActiveXObject(progid: string): any;

/**
 * WScript.Shell 类型定义
 */

declare namespace COMComponents {
    /** WScript.Shell 接口 */
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

    function getShell(): WScriptShell;
    function getEnvVars(type?: string): EnvironmentObject;
    function runCmd(cmd: string, cwd?: string): WshExec;
    function readReg(path: string): string | number;
    function writeReg(path: string, value: string | number, type?: string): void;
    function runCmdSync(cmd: string, cwd?: string): string;
}

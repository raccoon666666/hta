/**
 * 全局 COM 对象声明
 */

/** COM 对象容器 */
declare var $COM: {
    shell: COMComponents.WScriptShell;
    fso: COMComponents.FileSystemObject;
    shellApp: COMComponents.ShellApplication;
};

declare namespace COMComponents {
    /** Enumerator 接口 */
    interface Enumerator {
        atEnd(): boolean;
        moveNext(): void;
        item(): any;
        moveFirst(): void;
    }
}

/** WScript.Shell COM 对象 */
declare var WScript: {
    Shell: COMComponents.WScriptShell;
    CreateObject(progid: string): any;
    Echo(text: string): void;
    Quit(exitCode?: number): number;
    ScriptFullName: string;
    ScriptName: string;
    Version: string;
    BuildVersion: string;
};

/** Enumerator 构造函数 */
declare function Enumerator(comObject: any): COMComponents.Enumerator;

/** ActiveXObject 构造函数 */
declare function ActiveXObject(progid: string): any;

/**
 * 全局 COM 类型定义
 */

declare namespace COMComponents {
    const _comCache: { [key: string]: any };

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

/** 全局变量声明 */
declare var COMComponents: typeof COMComponents;

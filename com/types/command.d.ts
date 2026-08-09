/**
 * Shell 命令与注册表类型定义
 */

declare namespace COMComponents {
    function runCmd(cmd: string, cwd?: string): WshExec;
    function runCmdSync(cmd: string, cwd?: string): string;
    function readReg(path: string): string | number;
    function writeReg(path: string, value: string | number, type?: string): void;
    function getEnvVars(type?: string): EnvironmentObject;
}

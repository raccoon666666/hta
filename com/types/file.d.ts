/**
 * 文件操作类型定义
 */

declare namespace COMComponents {
    function folderExists(path: string): boolean;
    function fileExists(path: string): boolean;
    function createFolder(path: string): string;
    function getParentFolder(path: string): string;
    function getBasePath(): string;
    function openTextFile(path: string, mode?: number, create?: boolean): TextStream;
}

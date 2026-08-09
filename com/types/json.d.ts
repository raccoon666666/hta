/**
 * JSON 文件操作类型定义
 */

declare namespace COMComponents {
    function readJsonFile(filePath: string): any;
    function writeJsonFile(filePath: string, data: any): boolean;
}

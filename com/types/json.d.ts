/**
 * JSON 文件操作类型定义
 */

declare namespace COMComponents {
    /** 读取 JSON 文件，不存在或失败返回 null */
    function readJsonFile(filePath: string): any;
    /** 写入 JSON 文件，失败返回 false */
    function writeJsonFile(filePath: string, data: any): boolean;
}

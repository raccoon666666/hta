/**
 * 工具函数类型定义
 */

declare namespace $Component {
    /** 阻塞等待（毫秒） */
    function sleep(ms: number): void;
    /** 写入日志到 logs/error.log（旧版，建议使用 log） */
    function writeLog(msg: string): void;
}

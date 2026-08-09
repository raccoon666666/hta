/**
 * 日志系统类型定义
 */

declare namespace $Component {
    /** 日志级别常量 */
    const Level: { DEBUG: number; INFO: number; WARN: number; ERROR: number };

    /** Logger 接口 */
    interface Logger {
        debug(pattern: string, ...args: any[]): void;
        info(pattern: string, ...args: any[]): void;
        warn(pattern: string, ...args: any[]): void;
        error(pattern: string, ...args: any[]): void;
        isDebugEnabled(): boolean;
        isInfoEnabled(): boolean;
        isWarnEnabled(): boolean;
        isErrorEnabled(): boolean;
    }

    /** 日志工具 */
    const log: {
        getLogger(name: string): Logger;
        setLevel(level: string | number): void;
        Level: { DEBUG: number; INFO: number; WARN: number; ERROR: number };
    };
}

/**
 * 公共组件类型定义
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

declare namespace CommonComponents {
    // ========== 工具函数 ==========
    /** 阻塞等待（毫秒） */
    function sleep(ms: number): void;
    /** 写入日志到 logs/error.log */
    function writeLog(msg: string): void;

    // ========== Vue Mixins ==========
    /** Toast 通知 mixin，提供 showToast(msg, duration) 方法 */
    const ToastMixin: {
        data(): {
            toastVisible: boolean;
            toastMessage: string;
            toastTimer: number | null;
        };
        methods: {
            showToast(msg: string, duration?: number): void;
        };
    };

    /** 加载状态 mixin，提供 loading 数据属性 */
    const LoadingMixin: {
        data(): {
            loading: boolean;
        };
    };

    /** 自动聚焦指令 */
    const FocusDirective: {
        inserted(el: HTMLElement): void;
    };
}

// ========== 全局变量声明 ==========
declare var COMComponents: typeof COMComponents;
declare var CommonComponents: typeof CommonComponents;
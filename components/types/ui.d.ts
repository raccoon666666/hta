/**
 * UI 组件类型定义
 */

declare namespace $Component {
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
}

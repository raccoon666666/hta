/**
 * Vue 指令类型定义
 */

declare namespace $Component {
    /** 自动聚焦指令 */
    const FocusDirective: {
        inserted(el: HTMLElement): void;
    };
}

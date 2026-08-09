/**
 * Vue2 类型定义（精简版）
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

interface VueSet {
    <T>(object: object, key: string | number, value: T): T;
    <T>(array: T[], key: number, value: T): T;
}

interface VueDelete {
    (object: object, key: string | number): void;
    <T>(array: T[], key: number): void;
}

interface VueDirectiveHook {
    (el: HTMLElement, binding: any, vNode: any, oldVNode: any): void;
}

interface VueDirectiveDefinition {
    bind?: VueDirectiveHook;
    inserted?: VueDirectiveHook;
    update?: VueDirectiveHook;
    componentUpdated?: VueDirectiveHook;
    unbind?: VueDirectiveHook;
}

interface VueComponentOptions<D = any, M = any, C = any> {
    el?: string | Element;
    data?: D | (() => D);
    methods?: M;
    computed?: C;
    mixins?: any[];
    directives?: { [key: string]: VueDirectiveDefinition };
    mounted?: () => void;
    watch?: { [key: string]: (this: any, newVal: any, oldVal: any) => void };
    [key: string]: any;
}

interface VueInstance {
    $set: VueSet;
    $delete: VueDelete;
    $nextTick(callback: () => void): void;
    $refs: { [key: string]: HTMLElement | VueInstance | undefined };
    $emit(event: string, ...args: any[]): void;
    [key: string]: any;
}

interface VueConstructor {
    new <D = any, M = any, C = any>(options: VueComponentOptions<D, M, C>): VueInstance & D & M & C;
    directive(name: string, definition?: VueDirectiveDefinition): VueDirectiveDefinition | undefined;
    component(name: string, definition?: any): any;
    mixin(options: any): void;
    nextTick(callback: () => void): void;
}

declare var Vue: VueConstructor;

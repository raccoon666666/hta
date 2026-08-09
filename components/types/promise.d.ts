/**
 * Promise 类型定义（ES5 兼容实现）
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

interface PromiseLike<T> {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2>;
}

interface Promise<T> {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2>;

    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): Promise<T | TResult>;

    finally(onFinally?: (() => void) | null): Promise<T>;
}

interface PromiseConstructor {
    new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    reject<T = never>(reason?: any): Promise<T>;
    all<T>(values: (T | PromiseLike<T>)[]): Promise<T[]>;
    race<T>(values: (T | PromiseLike<T>)[]): Promise<T>;
}

declare var Promise: PromiseConstructor;

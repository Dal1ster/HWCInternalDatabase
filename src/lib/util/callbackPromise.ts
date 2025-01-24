
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CallbackPromise<T> = [promise: Promise<T>, resolve: T extends {} ? (value: T | PromiseLike<T>) => void : () => void, reject: (reason?: any) => any];

export default function callbackPromise<T = unknown>(): CallbackPromise<T>{
    let resolveFn: (value: T) => any, rejectFn: (reason?: any) => any;
    const promise = new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject;
    })
    return [promise, resolveFn!, rejectFn!] as CallbackPromise<T>;
}

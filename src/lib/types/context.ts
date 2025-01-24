/* eslint-disable @typescript-eslint/no-namespace */

export namespace Context {
    export type LoadingIndicator = {
        pushState: (name: string) => void;
        popState: (name: string) => void;
    };
    export type Directory = {
        reloadDirectory: () => Promise<void>;
    };
}
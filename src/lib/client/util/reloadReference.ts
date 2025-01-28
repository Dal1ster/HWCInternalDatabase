// dirty cheat to let you reload directories by paths, before i rewrite the system to use stores
// just need it working before the 4th for now

import normalizePath from "../../util/normalizePath";

const references: Record<string, () => any | undefined> = {};

export function hookReloadReference(path: string, fn: () => any) {
    path = normalizePath(path);
    references[path] = fn;
}

export function reloadDirectoryByPath(path: string) {
    path = normalizePath(path);
    const fn = references[path];
    if(fn) {
        fn();
    } else {
        console.warn(`No reference found for path ${path}`);
    }
}

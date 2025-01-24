import { derived  } from 'svelte/store';
import type { Writable } from 'svelte/store';
export function createLocalCache<T extends U[keyof U], U extends Record<string, string>>(expectedAssets: U) {
    const assets = window.assets;

    if(!assets) {
        throw new Error('No primary asset cache found');
    }

    const cache = derived(assets.store, (store) => {
        const localCache: Record<string, string> = {};
        for(const key in store) {
            localCache[key] = store[key];
        }
        return localCache;
    });


    return {
        cache: cache as Writable<Record<T, string>>,
        loaded: assets.loadMany(Object.values(expectedAssets)),
    }
}




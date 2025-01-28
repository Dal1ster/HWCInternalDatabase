import { writable } from 'svelte/store';

export interface AssetCache {
    [url: string]: {
        promise: Promise<string>;
        data: string | null;
    };
}

const assetCache: AssetCache = {};

export const assetStore = writable<{ [url: string]: string }>({});

export async function reloadAsset(url: string): Promise<string> {
    // bypass cache
    const newUrlPromise = fetchIntoObjectUrl(`${url}&time=${Date.now()}`);
    assetCache[url] = {
        promise: newUrlPromise,
        data: assetCache[url]?.data,
    };
    
    newUrlPromise.then((objectURL) => {
        assetCache[url].data = objectURL;
        assetStore.update(store => {
            store[url] = objectURL;
            return store;
        });
    })

    if (assetCache[url]?.data) {
        URL.revokeObjectURL(assetCache[url].data!);
    }


    return newUrlPromise;
}

export async function loadAsset(url: string): Promise<string> {
    if (assetCache[url]) {
        return assetCache[url].promise;
    }

    const assetPromise = 
        fetchIntoObjectUrl(url)
        .then(objectURL => {
            assetCache[url].data = objectURL;
            assetStore.update(store => {
                store[url] = objectURL;
                return store;
            });
            return objectURL;
        });

    assetCache[url] = {
        promise: assetPromise,
        data: null,
    };

    return assetPromise;
}

function fetchIntoObjectUrl(url: string) {
    return fetch(url)
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob));
}


export function getAsset(url: string): string | null {
    return assetCache[url]?.data || null;
}

export const AssetCacheExternals = {
    load: loadAsset,
    loadMany: (urls: string[]) => Promise.all(urls.map(loadAsset)),
    get: getAsset,
    reload: reloadAsset,
    store: assetStore,
}

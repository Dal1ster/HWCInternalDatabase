import { Client } from "../../classes/resource/client";
import { getDirectory, getDirectoryChildren as getDirectoryChildren, getFile } from "$lib/client/api/getResource";
import normalizePath from "$lib/util/normalizePath";
import { get } from "svelte/store";

export class ResourceController {
    constructor(private store = window.resourceStore) {
        if(!store) {
            throw new Error('Resource store not found');
        }
    }

    async load<T extends 'directory' | 'file', V extends (T extends 'directory' ? Client.Directory : Client.File)>(path: string, type: T): Promise<V> {
        path = normalizePath(path);
        const entity = get(this.store)[path];
        if(typeof entity?.promise !== 'undefined') {
            return entity!.promise as Promise<V>;
        }
    
        const promise = (type === 'directory' ? getDirectory(path) : getFile(path)) as Promise<V>;

        this.store.update(store => {
            store[path] = {
                type: type as any,
                promise: promise as any,
                entity: undefined,
            };
            return store;
        });

        promise.then(entity => {
            this.store.update(store => {
                store[path] = {
                    type: type as any,
                    entity: entity as any,
                    promise: undefined,
                };
                return store;
            });
        }).catch((ex) => {
            this.store.update(store => {
                store[path] = undefined;
                return store;
            });
            return Promise.reject(ex);
        })

        return promise;
    }

    async loadDirectoryChildren(path: string) {
        path = normalizePath(path);
        const managedEntity = get(this.store)[path];
        let entity: Client.Directory | undefined

        if(managedEntity && managedEntity.type === 'directory' && typeof managedEntity.entity !== 'undefined') {
            entity = managedEntity.entity;
        }

        if(!entity) {
            entity = await this.load(path, 'directory');
        }

        return getDirectoryChildren(path).then((contents) => {
            entity!.children = contents;
            this.store.update((store) => {
                store[path] = {
                    type: 'directory' as any,
                    entity: entity as any,
                    promise: undefined,
                }
                return store;
            })

            return entity!.children;
        })
    }
}

export default new ResourceController();
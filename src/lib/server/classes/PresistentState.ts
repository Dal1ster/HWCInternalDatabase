import betterWrite from "$lib/server/util/fsutils";
/**
 * Stores global flags that are shared between all users.
 */
export class PresistentState {
    constructor(private data: Record<string, any> = {}) {}

    get(key: string) {
        return this.data[key];
    }

    set(key: string, value: any) {
        this.data[key] = value;
    }

    has(key: string) {
        return this.data[key] !== undefined;
    }

    async save(path: string) {  
        return betterWrite(path, this.data);
    }
}
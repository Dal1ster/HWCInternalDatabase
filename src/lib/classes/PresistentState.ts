import betterWrite from "$lib/util/betterfs";

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
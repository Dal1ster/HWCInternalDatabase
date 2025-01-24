import { existsSync, readFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export default async function betterWrite(file: string, data: object) {
    const parsed = path.parse(file);
    if(!existsSync(parsed.dir)) {
        await mkdir(parsed.dir, { recursive: true });
    }
    return await writeFile(file, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
}

export async function ensurePath(p: string) {
    const parsed = path.parse(p);

    if(parsed.ext.trim().length === 0) {
        parsed.dir = path.join(parsed.dir, parsed.name);
    }

    if(!existsSync(parsed.dir)) {
        await mkdir(parsed.dir, { recursive: true });
    }
}

export function readJSON<T extends object>(path: string): T | undefined {
    if(!existsSync(path)) {
        return;
    }

    try {
        return JSON.parse(readFileSync(path, {encoding: 'utf8'}))
    } catch {
        return;
    }
}
import { plainToClass } from 'class-transformer';
import { SystemData } from './classes/resources';
import { readJSON } from "./util/betterfs";
import env from "./util/env";
import 'reflect-metadata';

let data: SystemData;
export function loadSystemData() {
    return plainToClass(SystemData, readJSON(env.FILESYSTEM_PATH), { groups: ['server'] });
}

export function getSystemData(reload = false): SystemData {
    if(!data || reload) {
        data = loadSystemData();
    }
    
    return data;
}
import { plainToClass } from 'class-transformer';
import { Server } from '../classes/resource/server';
import { readJSON } from "./util/fsutils";
import env from "./util/env";
import 'reflect-metadata';

let data: Server.SystemData;
export function loadSystemData() {
    return plainToClass(Server.SystemData, readJSON(env.FILESYSTEM_PATH), { groups: ['server'] });
}

export function getSystemData(reload = false): Server.SystemData {
    if(!data || reload) {
        data = loadSystemData();
    }
    
    return data;
}
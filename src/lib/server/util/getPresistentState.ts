import { PresistentState } from "$lib/server/classes/PresistentState";
import { existsSync } from "fs";
import { resolve } from "path";
import { cwd } from "process";
import { readJSON } from "../util/fsutils";

let state: PresistentState;
export const STATE_PATH = resolve(cwd(), 'presistent_state.json');

export function loadPresistentState() {
    if(!existsSync(STATE_PATH)) {
        return new PresistentState();
    }
    return state = new PresistentState(readJSON<Record<string, any>>(STATE_PATH));
}

let presistentStateSaveTimeout: NodeJS.Timeout | undefined;
export function schedulePresistentStateSave() {
    if(presistentStateSaveTimeout) return;
    presistentStateSaveTimeout = setTimeout(async () => {
        await state.save(STATE_PATH);
        presistentStateSaveTimeout = undefined;
    }, 3000);
}

export function getPresistentState() {
    if(!state) {
        state = loadPresistentState();
    }
    return state;
}
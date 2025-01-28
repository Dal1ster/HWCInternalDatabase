import type { ScalingBias } from "../types/misc";
import { writable } from "svelte/store";
import type { HWCWindow } from "../interactables/HWCWindow";
import type { Client } from "../../classes/resource/client";

const windowStore = writable<HWCWindowProperties[]>([]);

export type HWCWindowProperties = { 
    title: string, 
    component: ConstructorOfATypedSvelteComponent, 
    id: string, 
    componentProps: any, 
    x: number, 
    y: number,
    invisible: boolean,
    width?: number,
    height?: number,
    awaitingDynamicResize?: boolean, // whether component waits for content to call reportFinishedLoading before appearing to the user
    scalingBias: ScalingBias,
    loading: boolean,
    loaded: Promise<HWCWindow>,
    resource?: Client.Entity,
    resolveLoading: () => void,
    rejectLoading: (reason: any) => void,
};

export default windowStore;
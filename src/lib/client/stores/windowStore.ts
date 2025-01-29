import type { ScalingBias } from "../types/misc";
import { writable } from "svelte/store";
import type { HWCWindowHandle } from "../interactables/HWCWindow";
import type { Client } from "../../classes/resource/client";
import type { Component } from "svelte";

const windowStore = writable<HWCWindowProperties[]>([]);

export type HWCWindowProperties = { 
    title: string, 
    component: Component<any>, 
    id: string, 
    componentProps: any, 

    width?: number,
    height?: number,
    scalingBias: ScalingBias,
    
    x: number, 
    y: number,
    
    invisible: boolean,
    awaitingDynamicResize?: boolean, // whether component waits for content to call reportFinishedLoading before appearing to the user
    loading: boolean,

    resource?: Client.Entity, // the resource this window is related to

    loaded: Promise<HWCWindowHandle>,
    resolveLoading: () => void,
    rejectLoading: (reason: any) => void,
};

export default windowStore;
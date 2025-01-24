import type { ScalingBias } from "../../types/misc";
import { writable } from "svelte/store";
import type { HWCWindow } from "../interactables/HWCWindow";
import externalize from "$lib/util/externalize";
import type { Resource } from "$lib/classes/resources";

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
    resource?: Resource,
    resolveLoading: () => void,
};

externalize('windowStore', windowStore);
export default windowStore;

import callbackPromise from "../../../lib/util/callbackPromise";
import { clampWindowSize } from "../util/clampWindowSize";
import { getScalingBias } from "../util/getScalingBias";
import { nanoid } from "nanoid";
import sfx from "../sfx";
import { get } from 'svelte/store';
export class HWCWindow {
    store = window.windowStore; // we grab the window store from global context, as having HWCWindow imported in custom elements would cause the store to not behave properly
    constructor(public id: string) {
        this.reportFinishedLoading = this.reportFinishedLoading.bind(this);
        this.close = this.close.bind(this);
        this.bringToFront = this.bringToFront.bind(this);
        this.recalculateWindowSizing = this.recalculateWindowSizing.bind(this);
        this.relativeMove = this.relativeMove.bind(this);
        this.relativeResize = this.relativeResize.bind(this);
        this.getMountContainer = this.getMountContainer.bind(this);
        this.getMountDimensions = this.getMountDimensions.bind(this);    
    }

    getMountContainer() {
        const container = document.getElementById(`window-mount-${this.id}`);
        if(!container) {
            console.error(`Window with id ${this.id} not found`);
        }

        return container;
    }

    getMountDimensions() {
        const container = this.getMountContainer();
        if(!container) {
            return { width: 0, height: 0 };
        }

        return { width: container.clientWidth, height: container.clientHeight };
    }

    recalculateWindowSizing() {
        const dimensions = this.getMountDimensions();
        const scalingBias = getScalingBias(dimensions);
        const clamped = clampWindowSize(dimensions, scalingBias);

        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            if (!window) {
                console.error(`Window with id ${this.id} not found`);
                return prev;
            }
            window.width = clamped.width;
            window.height = clamped.height;
            window.scalingBias = scalingBias;
            window.awaitingDynamicResize = false;
            return prev;
        });
    }

    relativeResize(width: number, height: number) {
        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            if (!window) {
                console.error(`Window with id ${this.id} not found`);
                return prev;
            }
            window.scalingBias = 'auto'; // relative resize cannot work with auto scaling
            window.width = width  + (window.width || 0);
            window.height = height + (window.height || 0);
            return prev;
        });
    }

    relativeMove({ x, y }: { x: number, y: number}) {
        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            if (!window) {
                console.error(`Window with id ${this.id} not found`);
                return prev;
            }
            window.x = x + window.x;
            window.y = y + window.y

            return prev;
        });
    }

    reportFinishedLoading() {
        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            
            if (!window) {
                console.error(`Window with id ${this.id} not found`);
                return prev;
            }
            
            if(!window.loading) {
                console.error(`Window with id ${this.id} is not loading`);
                return prev;
            }

            window.loading = false;
            window.resolveLoading();
            return prev;
        });
    }

    rejectLoading(reason: any) {
        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            
            if (!window) {
                console.error(`Window with id ${this.id} not found`);
                return prev;
            }
            
            if(!window.loading) {
                console.error(`Window with id ${this.id} is not loading`);
                return prev;
            }

            window.loading = false;
            window.rejectLoading(reason);
            return prev;
        });
    }

    close() {
        sfx.play('sfx_s_terminal_winclose');
        this.store.update((prev) => prev.filter((window) => window.id !== this.id));
    }

    bringToFront() {
        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            if (!window) {
                return prev;
            }
            return [window, ...prev.filter((window) => window.id !== this.id)];
        });
    }

    setWindowName(title: string) {
        this.store.update((prev) => {
            const window = prev.find((window) => window.id === this.id);
            if (!window) {
                console.error(`Window with id ${this.id} not found`);
                return prev;
            }
            window.title = title;
            return prev;
        });
    }

    get properties() {
        return get(this.store).find((window) => window.id === this.id); 
    }
}

export function openAsyncWindow(title: string, component: ConstructorOfATypedSvelteComponent, componentProps: any = {}) {
    const store = window.windowStore;

    const newWindow = openWindow(title, component, { ...componentProps, asynchronous: true });
    const windowProperties = get(store).find((window) => window.id === newWindow.id);

    if(!windowProperties) {
        throw new Error(`Window with id ${newWindow.id} not found`);
    }
    
    return windowProperties.loaded;
}

export function openWindow(title: string, component: ConstructorOfATypedSvelteComponent, componentProps: any = {}) {
    const store = window.windowStore;

    const offsetX = window.innerWidth / 8;
    const offsetY = window.innerHeight / 16;
    
    if(!componentProps.invisible) {
        sfx.play('sfx_s_terminal_winopen');
    }

    const [p, resolve, reject] = callbackPromise<HWCWindow>();
    
    const id = nanoid();

    const VERTICAL_WINDOW_COUNT = 8;
    function calculateXOffset() {
        if(componentProps.x) { 
            return componentProps.x;
        }

        const vertialPosition = get(store).length % VERTICAL_WINDOW_COUNT;
        const horizontalPosition = Math.floor(get(store).length / VERTICAL_WINDOW_COUNT);

        return offsetX / 2 + vertialPosition * (offsetX / 2) + horizontalPosition * (offsetX / 5);
    }

    function calculateYOffset() {
        if(componentProps.y) { 
            return componentProps.y;
        }

        const vertialPosition = get(store).length % VERTICAL_WINDOW_COUNT;
        const horizontalPosition = Math.floor(get(store).length / VERTICAL_WINDOW_COUNT);

        return offsetY / 2 + vertialPosition * (offsetY / 2) + horizontalPosition * (offsetY * 2);
    }

    
    store.update((prev) => [{ 
        title, 
        component, 
        id, 
        componentProps, 
        x: calculateXOffset(), 
        y: calculateYOffset(),
        invisible: componentProps.invisible || false,
        loading: componentProps.asynchronous || false,
        awaitingDynamicResize: componentProps.dynamicResize || false,
        width: componentProps.width, 
        height: componentProps.height,
        scalingBias: componentProps.scalingBias || 'none',
        resource: componentProps.resource,
        loaded: p,
        resolveLoading: () => resolve(new HWCWindow(id)),
        rejectLoading: reject,
    }, ...prev ]);
    
    return new HWCWindow(id);
}

export function getWindowById(id: string) {
    return new HWCWindow(id);
};

export function getWindowByParent(element: HTMLElement) {
    const id = element.closest('.window')?.getAttribute('data-window-id');

    if(!id) {
        throw new Error('No window found');
    }

    return new HWCWindow(id);
}

// make window functions accessible to executables that run as separate web components
export const UIExternals = {
    open: openWindow,
    openAsync: openAsyncWindow,
    getWindowById,
    getWindowByParent,
};

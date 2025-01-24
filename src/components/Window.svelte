<script lang="ts">
	import { setContext } from 'svelte';
	import { HWCWindow } from '../lib/client/interactables/HWCWindow';
	import type { HWCWindowProperties } from '$lib/client/stores/windowStore';

    export let zIndex: number = 0;
    export let properties: HWCWindowProperties;
    export let title = "Window";
    export let id: string;
    export let scalingStyles: string = "";

    const window = new HWCWindow(id);

    setContext('windowId', id);
    setContext('window', window)

    let grabbing: boolean = false;

    let lastX: number | undefined;
    let lastY: number | undefined;

    async function move(e: PointerEvent) {
        if (grabbing) {
            if(lastX !== undefined && lastY !== undefined) {
                window.relativeMove({
                    x: -(lastX - e.x), 
                    y: -(lastY - e.y)
                });
            }
            
            lastX = e.x;
            lastY = e.y;
        }
    }

    function onPointerdown(e: PointerEvent) {
        grabbing = true;
    }

    function onPointerup(e: PointerEvent) {
        grabbing = false;
        lastX = undefined;
        lastY = undefined;
    }

    let grabbingIntent = false;
    function abandonedGrab(e: PointerEvent) {
        if(grabbing && e.pressure > 0) {
            grabbingIntent = true;
            move(e);
        }

        grabbing = false
    }

    function tryReestabilishGrab(e: PointerEvent) {
        if(grabbingIntent && e.pressure > 0) {
            grabbing = true;
            grabbingIntent = false;
            move(e);
        }
    }

    function isVisible() {
        if(properties.invisible) {
            return false;
        }

        if(properties.awaitingDynamicResize) {
            return false;
        }

        if(properties.loading) {
            return false;
        }

        return true;
    }

    function computeStyle() {
        return Object.entries({
            top: `${properties.y}px`,
            left: `${properties.x}px`,
            'z-index': zIndex,
            visibility: isVisible() ? 'visible' : 'hidden',
        }).map(([key, value]) => `${key}: ${value}`).join(';');
    }
</script>

<svelte:window 
    on:pointermove={move}
    on:pointerup={() => grabbingIntent = false}
    on:pointerenter={tryReestabilishGrab}
/>

<svelte:body
    on:pointerenter={tryReestabilishGrab}
    on:pointerleave={abandonedGrab}
></svelte:body>

<main style={computeStyle()} class="window" data-window-id={id} on:pointerdown={window.bringToFront}>
    <div 
        class="navbar" 
        on:pointerdown={onPointerdown} 
        on:pointerup={onPointerup} 
        on:pointerleave={abandonedGrab} 
        on:pointerenter={tryReestabilishGrab}
    >
        <span>{title}</span>
        <button class="close-btn" on:click={window.close}>X</button>
    </div>
    <div class="delegate-container">
        <div class="window-mount" style={scalingStyles} id={`window-mount-${id}`}>
            <slot></slot>
        </div>
    </div>
</main>

<style>
    .close-btn {
        width: 2rem;
        height: 2rem;
        font-family: monospace;
    }

    main {
        background-color: #FD46FC;
        position: absolute;
        width: min-content;
        height: min-content;
    }
    
    button {
        background-color: #061040;
        color: #FD46FC;
    }
    
    .navbar {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        cursor: move;

        touch-action: none;
    }

    .navbar span {
        color: white;
        padding-right: 10px
    }

    .delegate-container {
        background-color: #061040;
        margin: 10px;
        margin-top: 0px;
        display:    flex;
        place-content: center;
    }

    /** Fix for a chrome bug where there would be a 5px gap underneath images*/
    .delegate-container > .window-mount {
        display: inline-grid;
    }

</style>

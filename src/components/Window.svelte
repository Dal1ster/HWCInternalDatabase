<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { HWCWindowHandle } from '../lib/client/interactables/HWCWindow';
	import type { HWCWindowProperties } from '$lib/client/stores/windowStore';

    export let zIndex: number = 0;
    export let windowProperties: HWCWindowProperties;

    const windowHandle = new HWCWindowHandle(windowProperties.id);

    setContext('windowId', windowProperties.id);
    setContext('window', windowHandle)

    let grabbing: boolean = false;

    let lastX: number | undefined;
    let lastY: number | undefined;

    async function move(e: PointerEvent) {
        if (grabbing) {
            if(lastX !== undefined && lastY !== undefined) {
                windowHandle.relativeMove({
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
        if(windowProperties.invisible) {
            return false;
        }

        if(windowProperties.awaitingDynamicResize) {
            return false;
        }

        if(windowProperties.loading) {
            return false;
        }

        return true;
    }

    function evilEffect(window: HWCWindowHandle) {
        // whoops you dont get to do anything anymore bye!
        document.body.classList.add('pointerless');
        setTimeout(() => {
            setInterval(window.relativeResize, 20, 0.05, 0.05);
        }, 1000)
    }


    function generateScalingStyles({ width, height, scalingBias } : HWCWindowProperties) {
        if(width === undefined || height === undefined) {
            return '';
        }

        const cssWidth = scalingBias === 'height' ? 'auto' : `${Math.round(width || 0)}px`;
        const cssHeight = scalingBias === 'width' ? 'auto' : `${Math.round(height || 0)}px`;

        return `width: ${cssWidth}; height: ${cssHeight};`;
    }

    function computeStyle() {
        return Object.entries({
            top: `${windowProperties.y}px`,
            left: `${windowProperties.x}px`,
            'z-index': zIndex,
            visibility: isVisible() ? 'visible' : 'hidden',
        }).map(([key, value]) => `${key}: ${value}`).join(';');
    }

    onMount(() => {
        if(windowHandle.properties?.resource?.attribute.evil)  { 
            evilEffect(windowHandle);
        }
    })
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

<main style={computeStyle()} class="window" data-window-id={windowProperties.id} on:pointerdown={windowHandle.bringToFront}>
    <div 
        class="navbar" 
        on:pointerdown={onPointerdown} 
        on:pointerup={onPointerup} 
        on:pointerleave={abandonedGrab} 
        on:pointerenter={tryReestabilishGrab}
    >
        <span>{windowProperties.title || 'window'}</span>
        <button class="close-btn" on:click={windowHandle.close}>X</button>
    </div>
    <div class="delegate-container">
        <div class="window-mount" style={generateScalingStyles(windowProperties)} id={`window-mount-${windowProperties.id}`}>
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

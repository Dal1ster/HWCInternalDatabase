
<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-siivacam', shadow: 'none' }}/>
<script lang="ts">
	import { createLocalCache } from "../../lib/client/stores/createLocalCache";
    import type { HWCWindowHandle } from "../../lib/client/interactables/HWCWindow";
    let fadeIn = false;

    const BASE_HEIGHT = 600;
    const BASE_WIDTH = 800;

    let height = BASE_HEIGHT;
    let width = BASE_WIDTH;

    const IMAGES = {
        SCREEN_OVERLAY: '/img/Screen_Overlay.png', // load first
        MAIN: '/img/Main.jpg',
        FOREGROUND_LIGHTS_PARTIAL_FADE: '/img/Foreground_Lights_Partial_Fade.png',
        FOREGROUND_LIGHTS_BLINKING: '/img/Foreground_Lights_Blinking.png',
        BACKGROUND_LIGHTS: '/img/Background_Lights.png',
        FOREGROUND_LIGHTS_FADE: '/img/Foreground_Lights_Fade.png',
        SIIVA_LIGHTS: '/img/SiIva_Lights.png',
        RECORDING_OVERLAY: '/img/Recording_Overlay.png',
    } as const;

    let dots = '';
    
    const {
        cache,
        loaded: allImagesLoaded
    } = createLocalCache(IMAGES);

    let div: HTMLDivElement;
    let windowHandle: HWCWindowHandle;
    let sizeRatio = 1;

    allImagesLoaded.then(() => fadeIn = true)

    function recalculateDimensions() {
        const parentStyle = div.closest('.window-mount')?.attributes.getNamedItem('style');
        
        if (parentStyle) {
            const v = parentStyle.value;

            // might be auto or pixels
            const parentWidth = parseInt(v.match(/width: (\d+)px/)?.[1] || '');
            const parentHeight = parseInt(v.match(/height: (\d+)px/)?.[1] || '');

            const aspectRatio = BASE_WIDTH / BASE_HEIGHT;

            // parent height is auto
            if(isNaN(parentHeight)) {
                sizeRatio = parentWidth / BASE_WIDTH;
                height = parentWidth / aspectRatio;
                width = parentWidth;
                return;
            }

            // parent width is auto
            if(isNaN(parentWidth)) {
                sizeRatio = parentHeight / BASE_HEIGHT;
                width = parentHeight * aspectRatio;
                height = parentHeight;
                return;
            }
        }
        
    }

    function onOverlayLoaded() {
        windowHandle = window.ui.getWindowByParent(div);
        windowHandle.recalculateWindowSizing();

        setTimeout(() => {
            recalculateDimensions();
            windowHandle.reportFinishedLoading();
        }, 10);

        setInterval(() => {
            dots = dots.length < 3 ? dots + '.' : '';
        }, 500);
    };
</script>
<style>
    /* stolen from https://siivahouseoutpost.highquality.rip/*/
    .parent {
        width: 800px;
        height: 600px;
        position: relative;
        margin: auto;
        overflow: hidden;
        background-color: black;
    }
    .inner img, .inner .text {
        position: absolute;
        display: inline-block;
        object-fit: contain;
        max-height: 100%
    }

    .text {
        font-size: 2rem;
        color: white;
        z-index: 8;
        width: 100%;
        height: 100%;
        padding-top: 1rem;
        text-align: center;
    }

    @-webkit-keyframes leftright {
        0%, 30%{
            left: 0;
        }
        50%, 70% {
            left: calc(100% - calc(1280px * var(--size-ratio, 1)));
        }
        90%, 100% {
            left: 0;
        }
    }

    @-webkit-keyframes inandout {
        0%, 100%
        {
            opacity: 0;
        }
        50% {
            opacity: 100%;
        }
    }
    @-webkit-keyframes partial-inandout {
        0%, 100%
        {
            opacity: 50%;
        }
        50% {
            opacity: 100%;
        }
    }
    @-webkit-keyframes blinking {
        0%{
            opacity: 0;
        }
        50% {
            opacity: 100%;
        }
    }
    @-webkit-keyframes appear {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    @-webkit-keyframes huerotate {
        0%{
            filter: hue-rotate(0deg);
        }
        100% {
            filter: hue-rotate(360deg);
        }
    }

    .main {
        animation: leftright linear 30s infinite;
    }

    .foreground-lights-partial-fade {
        animation: partial-inandout 5s ease-in-out infinite, leftright linear 30s infinite;
    }
    .foreground-lights-blinking {
        animation: blinking 2s step-end infinite, leftright linear 30s infinite;
    }
    .foreground-lights-fade {
        animation: inandout 10s ease-in-out infinite, leftright linear 30s infinite;
    }
    .background-lights {
        animation: blinking 3s step-end infinite, leftright linear 30s infinite;
    }
    .siiva-lights {
        animation: huerotate linear .75s infinite, leftright linear 30s infinite;
    }

    .appear-1 {
        animation: appear 1s linear forwards;
        opacity: 0;
        animation-play-state: paused;
    }

    .recording-overlay {
        animation: blinking 1.5s step-end infinite, appear linear 1;
        z-index: 7;
    }

</style>
<div bind:this={div}>
    <div class="parent" style="width: {width}px; height: {height}px;" style:--size-ratio={sizeRatio}>
        <div class="inner appear-1" style:animation-play-state={fadeIn ? 'running' : 'paused'}>
            <img src={$cache[IMAGES.MAIN]} class="main"/>
            <img src={$cache[IMAGES.FOREGROUND_LIGHTS_PARTIAL_FADE]} class="foreground-lights-partial-fade">
            <img src={$cache[IMAGES.FOREGROUND_LIGHTS_BLINKING]} class="foreground-lights-blinking">
            <img src={$cache[IMAGES.BACKGROUND_LIGHTS]} class="background-lights">
            <img src={$cache[IMAGES.FOREGROUND_LIGHTS_FADE]} class="foreground-lights-fade">
            <img src={$cache[IMAGES.SIIVA_LIGHTS]} class="siiva-lights">
        </div>
        <div class="inner">
            <img src={$cache[IMAGES.SCREEN_OVERLAY]} on:load={onOverlayLoaded}>
            <img src={$cache[IMAGES.RECORDING_OVERLAY]} class="recording-overlay" style:display={fadeIn ? 'block' : 'none'}>
            {#if !fadeIn}
                <div class="text">
                    <span>Connecting{dots}</span>
                </div>
            {/if} 
        </div>
    </div>
</div>
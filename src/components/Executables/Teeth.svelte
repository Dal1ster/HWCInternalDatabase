<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-teeth', shadow: 'none' }}/>
<script lang="ts">
	import { getWindowByParent, HWCWindow } from "../../lib/client/interactables/HWCWindow";
	import { createLocalCache } from "../../lib/client/stores/createLocalCache";
	import { onDestroy, onMount } from "svelte";

    let video: HTMLVideoElement;
    let div: HTMLDivElement;
    let windowHandle: HWCWindow;

    const sfx = window.sfx.extendInstance({
        'teeth': '/sfx/teeth.mp3'
    });
    
    const assets = {
        "teeth": "/img/teeth.mp4",
    } as const;

    const {
        loaded,
        cache
    } = createLocalCache(assets);

    let playing = false;

    onMount(async () => {
        await sfx.loadAll();
        await loaded;
        windowHandle = getWindowByParent(div);
        windowHandle.reportFinishedLoading();
    });

    function click() {
        playing = true;

        setTimeout(() => {
            sfx.play('teeth', true);
            video.play();
        }, 10)
        
    };

    onDestroy(() => {
        sfx.stop('teeth');
    });
    
</script>
<style>
    video {
        object-fit: fill;
        height:100%;
        width:100%;
    }
    #overlay {
        width:500px;
        height:500px;
        color:white;
    }
</style>
<div bind:this={div}>
    {#if !playing}
        <div id="overlay" on:click={click}>
            <h1>CLICK ME</h1>
        </div>
    {:else }
        <video muted={true} id="video" loop src={$cache[assets.teeth]} bind:this={video}></video>
    {/if}
</div>
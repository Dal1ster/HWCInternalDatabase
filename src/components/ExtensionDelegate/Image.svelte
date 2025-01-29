<script lang="ts">
	import { HWCWindowHandle } from "../../lib/client/interactables/HWCWindow";
	import { createLocalCache } from "../../lib/client/stores/createLocalCache";
	import {  onMount } from "svelte";

    export let src: string = "";

    let img: HTMLImageElement;
    let windowHandle: HWCWindowHandle;

    const {
        cache,
    } = createLocalCache({ image: src });

    function onload() {
        windowHandle.recalculateWindowSizing();
        windowHandle.reportFinishedLoading();
    }
    onMount(() => {
        // so it works when imported within exes
        windowHandle = window.ui.getWindowByParent(img);
    })
</script>

<style>
    /** WindowManager decides these */
    img {
        width: inherit;
        height: inherit;
    }
</style>

<img bind:this={img} src={$cache[src]} on:load={onload}/>
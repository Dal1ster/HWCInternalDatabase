<script lang="ts">
	import type { HWCWindow } from "$lib/client/interactables/HWCWindow";
	import { getContext } from "svelte";

    export let src: string = "";
    const window = getContext<HWCWindow>('window');

    function loadedmetadata() {
        window.recalculateWindowSizing();
        window.reportFinishedLoading();
    }

</script>

<style>
    video {
        width: inherit;
        height: inherit;
    }

</style>

<video src={src} controls on:loadedmetadata={loadedmetadata}></video>
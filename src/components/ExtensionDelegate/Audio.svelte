<script lang="ts">
	import type { HWCWindow } from "$lib/client/interactables/HWCWindow";
	import { getContext, onMount } from "svelte";

    export let src: string = "";

    const window = getContext<HWCWindow>('window');
    onMount(() => {
        window.recalculateWindowSizing();
    });
</script>

<style>
    div {
        display: flex;
        width: 100%;
        height: 100%;
    }
</style>
<div>
    <audio src={src} controls></audio>
</div>
<script lang="ts">
	import componentLibrary from "$lib/client/ComponentLibrary";
	import { onMount } from "svelte";

    export let src: string;

    let tag = '';
    let isLoaded = false;

    async function loadScript() {
        const tagName = await componentLibrary.load(src);

        isLoaded = true;
        tag = tagName;
    }

    onMount(loadScript);
</script>

{#if isLoaded}
    <svelte:element this={tag}/>
{/if}
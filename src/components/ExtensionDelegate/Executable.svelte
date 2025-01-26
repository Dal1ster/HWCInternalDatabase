<script lang="ts">
	import componentLibrary from "$lib/client/ComponentLibrary";
	import { onMount } from "svelte";

    export let src: string;

    let tag = '';
    let isLoaded = false;

    // sideloads the given custom element
    // Important: in order to be shown, the loaded custom element MUST:
    // - have a custom html tag name that is of the format `haltmann-${componentFileName.toLowerCase()}`
    // - use the reportFinishedLoading function of an HWCWindow to signal that the window can be shown to the client
    //   Handle can be obtained via window.ui.getWindowByParent(element)
    // - have shadow root disabled
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
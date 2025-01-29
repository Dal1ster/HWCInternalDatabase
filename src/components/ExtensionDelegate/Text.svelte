<script lang="ts">
	import { HWCWindowHandle } from "$lib/client/interactables/HWCWindow";
	import { getContext, onMount } from "svelte";

    export let text = "";
    export let lang: "text" | "markdown" = "text";

    const window = getContext<HWCWindowHandle>('window');

    let html = "";

    $: {
        if (lang === "text") {
            html = text;
        } else if (lang === "markdown") {
            // html = marked(text, { async: false}); we arent using markdown, disabled to decrease bundle size
        }
    }

    const delay = (n: number) => new Promise(resolve => setTimeout(resolve, n));

    let checkingAvailableSpace = true;
    onMount(async () => {
        await delay(50);
        window.recalculateWindowSizing();
        await delay(50);
        checkingAvailableSpace = false
        await delay(50);
        window.reportFinishedLoading()
    })
</script>

<style> 
    p {
        padding: 1rem;  
        user-select: text;
    }

    div.checking-space { 
        overflow-x: auto;
    }

    .checking-space p {
        white-space: pre;
    }

    div {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 80vh;
    }
</style>

<div class:checking-space={checkingAvailableSpace} class="text-delegate">
    <p >{@html html}</p>
</div>
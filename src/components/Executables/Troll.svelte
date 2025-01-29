<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-troll', shadow: 'none' }}/>
<script lang="ts">
	import type { HWCWindowHandle } from "../../lib/client/interactables/HWCWindow";
    import { onMount } from "svelte";
	import callbackPromise from "../../lib/util/callbackPromise";
	import SafeTroll from "./troll/SafeTroll.svelte";
	import EvilTroll from "./troll/EvilTroll.svelte";

    let div: HTMLDivElement;
    let windowHandle: HWCWindowHandle;

    const trollLevel = Math.random();
    const trolled = trollLevel < 0.05;
    const [trollLoaded, resolveTrollLoaded] = callbackPromise();
    

    onMount(async () => {
        windowHandle = window.ui.getWindowByParent(div);
        await trollLoaded;
        
        windowHandle.recalculateWindowSizing();
        windowHandle.reportFinishedLoading();
    });

</script>

<style>
    .main {
        width: inherit;
        height: inherit;
    }

</style>

<div class="main" bind:this={div}>
    {#if !trolled}
        <SafeTroll onLoad={resolveTrollLoaded}/>
    {:else if !!windowHandle }
        <EvilTroll onLoad={resolveTrollLoaded} {windowHandle}/>
    {/if}
</div> 

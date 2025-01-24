<svelte:options customElement={{ tag: 'haltmann-premiere', shadow: 'none' }}/>

<script lang="ts">
    
    import { getWindowByParent, HWCWindow } from "../../lib/client/interactables/HWCWindow";
    import { onMount } from "svelte";
    
    let div: HTMLDivElement;
    let windowHandle: HWCWindow;

    onMount(() => {
        windowHandle = getWindowByParent(div);
        windowHandle.reportFinishedLoading();
    });
</script>

<div bind:this={div}>

</div>
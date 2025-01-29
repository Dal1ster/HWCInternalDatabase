<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-premiere', shadow: 'none' }}/>

<script lang="ts">
    
    import { getWindowByParent, HWCWindowHandle } from "../../lib/client/interactables/HWCWindow";
    import { onMount } from "svelte";
    
    let div: HTMLDivElement;
    let windowHandle: HWCWindowHandle;

    onMount(() => {
        windowHandle = getWindowByParent(div);
        windowHandle.reportFinishedLoading();
    });
</script>

<div bind:this={div}>

</div>

<script lang='ts'>
	import Window from "./Window.svelte";
    import windowStore from "$lib/client/stores/windowStore";

</script>

{#each $windowStore as windowProperties, i (windowProperties.id) }
    <Window 
        windowProperties={windowProperties}
        zIndex={100 - i} 
    >
        <svelte:component this={windowProperties.component} {...windowProperties.componentProps}/>
    </Window>
{/each}


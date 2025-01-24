
<script lang='ts'>
	import Window from "./Window.svelte";
    import windowStore, { type HWCWindowProperties } from "$lib/client/stores/windowStore";

    function generateScalingStyles({ width, height, scalingBias } : HWCWindowProperties) {
        if(width === undefined || height === undefined) {
            return '';
        }

        const cssWidth = scalingBias === 'height' ? 'auto' : `${Math.round(width || 0)}px`;
        const cssHeight = scalingBias === 'width' ? 'auto' : `${Math.round(height || 0)}px`;

        return `width: ${cssWidth}; height: ${cssHeight};`;
    }
</script>

{#each $windowStore as window, i (window.id) }
    <Window 
        id={window.id} 
        title={window.title} 
        properties={window}
        zIndex={100 - i} 
        scalingStyles={generateScalingStyles(window)}
    >
        <svelte:component this={window.component} {...window.componentProps}/>
    </Window>
{/each}


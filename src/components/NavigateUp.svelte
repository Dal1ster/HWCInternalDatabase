
<script lang="ts">
	import ResourceLabel from "./ResourceLabel.svelte";
	import type { Icons } from "./Icon.svelte";
    import BackArrow from './icons/back-arrow.svg?raw';
	import Underline from "./Underline.svelte";
	import sfx from "$lib/client/sfx";
    
    let icon: Icons = 'folder';
</script>

<style>
    .navigate-up {
        display: flex;
    }

    .padding { 
        min-width: var(--sidebar-width);
        display: grid;
        place-content: center;
    }
    .dot {
        height:calc(var(--sidebar-width) * 0.65);
        width: calc(var(--sidebar-width) * 0.65);
        transform: rotateX(180deg) rotateZ(-90deg);
    }
    .file {
        width:100%;
    }
    .navigate-up:hover {
        color: #2dd4f1;
    }

</style>

<div class="navigate-up" on:click on:pointerup={() => sfx.play('sfx_s_terminal_loading_end')}>
    <div class="padding"><div class="dot">{@html BackArrow}</div></div>
    <div class="file">
        <ResourceLabel {icon} label={'...'}/>
        <Underline/>
    </div>
</div>
 
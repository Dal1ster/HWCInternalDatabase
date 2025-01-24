<script lang="ts">
    import muted from "$lib/client/stores/muted";
	import { get } from "svelte/store";
	import Icon from "./Icon.svelte";
</script>

<style>
    main {
        position: absolute;
        bottom: 0;
        left: 0;
    }

    div {
        cursor: pointer;
    }

    div:hover {
        color: #2dd4f1;
    }
</style>

<main>
    <div on:click={() => muted.set(!get(muted))}>
        <Icon icon={$muted ? 'volumeSilent' : 'volumeLow'} width="32px" height="32px"/>
    </div>
</main>
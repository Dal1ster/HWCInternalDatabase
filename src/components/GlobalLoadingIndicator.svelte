<script lang="ts">
	import type { Context } from "$lib/types/context";
	import { setContext } from "svelte";

    let activeLoadingStates = new Set();

    function pushState(name: string) {
        activeLoadingStates.add(name);
        activeLoadingStates = activeLoadingStates;
    }

    function popState(name: string) {
        activeLoadingStates.delete(name);
        activeLoadingStates = activeLoadingStates;
    }

    setContext<Context.LoadingIndicator>('loadingIndicator', {
        pushState,
        popState
    });

</script>

<style>
    :global(main.active *) {
        cursor: wait !important;
    }

    main {
        display: contents;
    }

</style>
<main class:active={activeLoadingStates.size > 0}>
    <slot/>
</main>  
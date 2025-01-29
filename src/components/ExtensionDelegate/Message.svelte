<script lang="ts">
	import { HWCWindowHandle } from "$lib/client/interactables/HWCWindow";
	import { getContext } from "svelte";

    export let message = "Hello world!";

    export let scalingStyles: string = "";

    const window = getContext<HWCWindowHandle>("window");
</script>

<style>
    div {
        padding: 15px;
        color: red;
        text-align: center;
    }

    button {
        padding-left: 25px;
        padding-right: 25px;
    }

    button {
        background: #FD46FC;
        border: 4px solid #FD46FC;
        height: 46px;
        font-size: 32px;
        color: white;
        font-family: 'Ace Futurism', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    button:hover {
        background: #a610c1;
        border: 4px solid #a610c1;
        cursor: pointer;
    }
</style>

<h1>{message}</h1>
<div>
    <button on:click={window.close}>OK</button>
</div>
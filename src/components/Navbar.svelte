<script lang="ts">
	import Underline from "./Underline.svelte";

    export let value: string;

</script>

<main>
    <input type="text" class="text-glow ccc-terminal-text" autocorrect="off" bind:value on:keydown/>
    <Underline/>
</main>

<style>

    input {
        background: none;
        outline: none;
        color: inherit;
        border: none;
    }

    .ccc-terminal-text {
        font-size: 36px;
        width:100%;
        display: inline-block;
        outline: none;
    }

    main {
        width: 100%;
        color:#00B9FD;
        font-size:24px;
    }
</style>

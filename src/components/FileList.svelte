<script lang='ts'>
    import { Client } from "$lib/classes/resource/client";
    
	import DirectoryComponent from "./Directory.svelte";;
    import FileComponent from "./File.svelte";

    export let folderRoot: string;
    export let files: Client.Entity[] = [];
</script>

{#each files as file (file.name)}
    {#if file instanceof Client.Directory}
        <DirectoryComponent directory={file} folderRoot={folderRoot}/>
    {:else}
        <FileComponent {file} folderRoot={folderRoot}/>
    {/if}
{/each}
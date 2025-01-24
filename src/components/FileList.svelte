<script lang='ts'>
    import { Directory, type FileSystemEntity } from "$lib/classes/resources";
    
	import DirectoryComponent from "./Directory.svelte";;
    import FileComponent from "./File.svelte";
	import Underline from "./Underline.svelte";

    export let folderRoot: string;
    export let files: FileSystemEntity[] = [];
</script>

{#each files as file (file.name)}
    {#if file instanceof Directory}
        <DirectoryComponent directory={file} folderRoot={folderRoot}/>
    {:else}
        <FileComponent {file} folderRoot={folderRoot}/>
    {/if}
{/each}
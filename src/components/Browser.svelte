<script lang="ts">
	import { getContext, onMount } from "svelte";

    import FileList from "./FileList.svelte";
	import Navbar from "./Navbar.svelte";

	import { open } from "./File.svelte";
    import { Client } from "$lib/classes/resource/client";
	import { getResource, getDirectoryChildren } from "$lib/client/api/getResource";
	import { createErrorDialog } from "$lib/client/interactables/createErrorDialog";
	import { ApiError } from "$lib/client/api/ApiError";
	import type { Context } from "$lib/client/types/context";
	import { passwordChallenge } from "$lib/client/interactables/passwordChallenge";
	import sfx from "$lib/client/sfx";
	import { pushState } from "$app/navigation";
	import { page } from "$app/stores";
	import { tokenize } from "$lib/util/tokenize";
	import NavigateUp from "./NavigateUp.svelte";

    export let onFilesystemChange: (location: string) => void = () => {};
    export let onInit = () => {};

    // todo: this doesnt work properly, needs to be fixed
    function getRoot() {
        const root = ($page?.state as any).root;
        if(!root) return 'x:\\';
        return root;
    }


    let initialized = false;
    let input = getRoot();
    let loading = false;
    let mountedRoot = '';

    let tokenizedPath: string[] = [];
    let files: Client.Entity[] = [];

    let loadingIndicator = getContext<Context.LoadingIndicator>('loadingIndicator');

    $: {
        if(loading) {
            loadingIndicator.pushState('browser');
        } else {
            loadingIndicator.popState('browser');
        }

        tokenizedPath = tokenize(mountedRoot).filter(Boolean);
    }

    page.subscribe(() => {
        const newRoot = getRoot();

        if(newRoot !== mountedRoot) {
            input = newRoot;
            loadDirectory(newRoot);
        }
    });

    async function loadDirectory(currentInput: string = $page.data.mountedRoot || input) {
        loading = true;
        try {
            const resource = await getResource(currentInput);

            if(resource.attribute.locked) {
                const challengeResult = await passwordChallenge(resource.location);

                if(!challengeResult) {
                    return;
                }

                return loadDirectory(currentInput);
            }

            if(resource instanceof Client.File) {
                await open(resource);
                input = mountedRoot;
                return;
            }

            const children = await getDirectoryChildren(currentInput);
            files = children;

            mountedRoot = currentInput;

            pushState(``, { root: mountedRoot });
            
            if(!initialized) {
                onInit();
                initialized = true;
            }

            onFilesystemChange(input);
        } catch (ex) {
            console.log(ex);
            const err = ApiError.from(ex);
            input = mountedRoot;
            sfx.play('sfx_s_terminal_buzzer');
            createErrorDialog("OS_ERROR", err.message);
        } finally {
            loading = false;
        }
    }

    onMount(loadDirectory);
    onMount(() => {
        window.reloadRoot = () => loadDirectory('x:\\');
    })
    
    function keydown(event: KeyboardEvent) {
        if(event.key === 'Enter') {
            event.preventDefault();
            input = input.trim();
            loadDirectory(input);
        }
    }

    function navigateUp(){
        const newPath = tokenizedPath.slice(0, -1).join('\\') + '\\';
        input = newPath;
        loadDirectory(newPath);
    }
</script>
<style>
    .scrollable-container {
        overflow-y: auto;
        height: calc(100vh - 80px);
    }

</style>
<Navbar bind:value={input} on:keydown={keydown}/>
<div class="scrollable-container">
    {#if tokenizedPath.length > 1} 
        <NavigateUp on:click={navigateUp}/>
    {/if}
    <FileList folderRoot={mountedRoot} files={files}/>
</div>
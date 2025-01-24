<script lang="ts">
	import ResourceLabel from "./ResourceLabel.svelte";
    import type { Directory } from "$lib/classes/resources";
    import { slide } from "svelte/transition";
	import FileList from "./FileList.svelte";
	import { getDirectoryChildren } from "$lib/util/getResource";
	import { getContext, onMount, setContext } from "svelte";
	import { passwordChallenge } from "$lib/client/interactables/passwordChallenge";
	import RotatingBar from "./RotatingBar.svelte";
	import type { Context } from "$lib/types/context";
	import sfx from "$lib/client/sfx";
	import { createErrorDialog } from "$lib/client/interactables/createErrorDialog";
	import { ApiError } from "$lib/util/ApiError";
	import { hookReloadReference } from "$lib/util/reloadReference";
    export let directory: Directory;
    export let folderRoot: string;
    export let expanded = false;

    let myLocation: string;
    let loadedLocation: string = '';
    let icon: 'locked' | 'folderOpen' | 'folder' = 'folder';

    let loading = false;

    const loadingIndicator = getContext<Context.LoadingIndicator>('loadingIndicator');

    setContext<Context.Directory>('directory', { 
        reloadDirectory
    });


    $: { 
        myLocation = `${folderRoot}/${directory.name}`;

        if(directory.attribute.locked) {
            icon = 'locked';
        } else {
            icon = expanded ? 'folderOpen' : 'folder';
        }

        if(loading) {
            loadingIndicator.pushState(myLocation);
        } else {
            loadingIndicator.popState(myLocation);
        }
    };

    function reloadDirectory() {
        return loadDirectory(myLocation);
    }

    async function loadDirectory(location: string) {
        loading = true;
        try {
            const populated = await getDirectoryChildren(location);
            directory.children = populated;
            loadedLocation = location;
        } catch (ex) {
            const err = ApiError.from(ex);
            createErrorDialog('OS_ERROR', err.message);
            throw err; // prevent expanded from being set to true
        } finally {
            loading = false;
        }
    }

    async function toggleDirectory(previouslyExpanded: boolean) {
        if(!previouslyExpanded) {
            if(loadedLocation !== myLocation) {
                await loadDirectory(myLocation);
            };
        }

        expanded = !previouslyExpanded;
    }

    async function attemptOpen(previouslyExpanded: boolean) {
        if(directory.attribute.locked) {
            const challengeResult = await passwordChallenge(directory.location);

            if(!challengeResult) {
                return;
            }

            directory.attribute.locked = false;
            directory = directory;
        }

        if(!previouslyExpanded) {
            sfx.play('sfx_s_terminal_loading_end');
        } else {
            sfx.play('sfx_s_terminal_cancel');
        }

        await toggleDirectory(previouslyExpanded);
    }

    onMount(() => {
        hookReloadReference(myLocation, reloadDirectory);
    })

</script>

<main class="ccc-terminal-text">
	<div class="folder-label" on:click={() => attemptOpen(expanded)}>
		<div class="sidebar">
            <div class="trig-container place-content-center">
                <div class="trig" class:active={expanded}><div class="indicator"></div></div>
            </div>
        </div>
		<div class="mainbar">
			<ResourceLabel icon={icon} label={directory.name}>
                {#if loading }
                    <RotatingBar/>
                {/if}
            </ResourceLabel>
		</div>
	</div>
	<div class="folder-contents">
		<div class="sidebar pole-container" style:padding-bottom={expanded ? null : '0px'}>
            {#if expanded }
			    <div class="pole-turn" transition:slide></div>
            {/if}
		</div>
        {#if expanded }
            <div class="mainbar file-list" transition:slide>
                <div class="line-continue"><div class="line"></div></div>
                <FileList files={directory.children} folderRoot={myLocation}/>
            </div>
        {/if}
	</div>
</main>

<style>
    .trig-container {
        width:100%;
        height: 100%;
    }

    .indicator {
        width: 0px;
        height: 0px;

        border: transparent solid 8px;
        border-left: #00b9fd solid 8px;
    }

    .trig {
        width:16px;
        height:16px;

        transition: transform 0.2s;
        transform-origin: 25% 50%;
        transform: rotate(0deg) translateX(4px);
    }

    .trig.active {
        transform: rotate(90deg) translateX(4px);
    }

	main > div {
		width: 100%;
	}

	.folder-contents,
	.folder-label {
		display: flex;

	}

    .folder-label {
        cursor: pointer;
    }   

	.sidebar {
		width: var(--sidebar-width);
	}
	.mainbar {
		width: calc(100% - var(--sidebar-width));
        padding-bottom: 0px;
	}

	.pole,
	.pole-turn {
		width: 50%;
		float: right;
		height: 100%;
		margin-right: 4px;
		margin-bottom: 4px;
	}

	.pole {
		border-left: 1px solid #00b9fd;
	}
	.pole-turn {
		border-left: 1px solid #00b9fd;
		border-bottom: 1px solid #00b9fd;
	}

	.pole-container {
        padding-bottom: 15px;
	}
</style>

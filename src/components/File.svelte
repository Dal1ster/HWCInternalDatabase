<script lang="ts" context="module">
	import { Client } from "$lib/classes/resource/client";
	import { getContentUrl } from "$lib/client/api/getResource";

    async function openImage(file: Client.File) {
        const contentUrl = getContentUrl(file.location);

        // file has content override, replace all other instances of this asset
        if(file.shouldBypassCache()) {
            await reloadAsset(contentUrl);
        }

        return openAsyncWindow(Image, {
            title: file.name,
            props: {
                src: contentUrl
            },
            dynamicResize: true,
            resource: file,
        })
    }

    function openAudio(file: Client.File) {
        // file has content override, use cache buster
        const contentUrl = getContentUrl(file.location, file.shouldBypassCache());
        return openWindow(Audio, {
            title: file.name,
            props: {
                src: contentUrl
            },
            dynamicResize: true,
            resource: file,
        })
    }

    async function openVideo(file: Client.File) {
        const contentUrl = getContentUrl(file.location, file.shouldBypassCache());
        return openAsyncWindow(Video, {
            title: file.name,
            props: {
                src: contentUrl
            },
            dynamicResize: true,
            resource: file,
        })
    }

    async function openDocument(file: Client.File) {
        const lang = file.name.toLowerCase().endsWith('.md') ? 'markdown' : 'text';
        const text = file.attribute.content ?? file.content;

        return openAsyncWindow(Text, { 
            title: file.name, 
            props: {
                text,
                lang,
            },
            dynamicResize: true,
            width: window.innerWidth, // text needs to be nudged towards wanting to take up space
            height: -1,
            resource: file
        });
    }

    export async function open(file: Client.File) {
        const subtype = getFileSubtype(file);
        switch(subtype) {
            case 'url':
                const content = file.attribute.content ?? file.content;
                window.open(content, '_blank');
                return;
            case 'pdf':
                const pdfUrl = getContentUrl(file.location);
                window.open(pdfUrl, '_blank');
                return;
            case 'image':
                return openImage(file);
            case "video":
                return openVideo(file);
            case "document":
                return openDocument(file);
            case 'audio':
                return openAudio(file);
            case 'executable': 
                const src = getContentUrl(file.location, false);;
                const invisible = !!file.attribute.hiddenWindow;
                const synchronous = file.attribute.synchronous;

                if(synchronous) {
                    return openWindow(Executable, {
                        title: file.name,
                        props: {
                            src
                        },
                        width: -1,
                        height: -1,
                        invisible,
                        resource: file
                    })
                }

                return openAsyncWindow(Executable, {
                    title: file.name,
                    props: {
                        src
                    },
                    width: -1,
                    height: -1,
                    invisible,
                    resource: file
                })
            case 'archive':            
                // quick hack just to be able to host 6-in-3_L_aptop_FILES.rar externally
                if(file.attribute.hotlinked) {
                    window.open(file.attribute.content ?? file.content, '_blank');
                    return;
                }
                download(getContentUrl(file.location), file.name);
                return;
        }

        throw new Error(`Unsupported file type: ${subtype}`);
    }
 </script>

<script lang="ts">
	import Image from "./ExtensionDelegate/Image.svelte";
    import Audio from "./ExtensionDelegate/Audio.svelte";
	import ResourceLabel from "./ResourceLabel.svelte";
	import { openAsyncWindow, openWindow } from "../lib/client/interactables/HWCWindow";
	import Video from "./ExtensionDelegate/Video.svelte";
	import Text from "./ExtensionDelegate/Text.svelte";
	import { download } from "$lib/client/util/download";
	import { passwordChallenge } from "$lib/client/interactables/passwordChallenge";
	import Executable from "./ExtensionDelegate/Executable.svelte";
	import type { Icons } from "./Icon.svelte";
	import Underline from "./Underline.svelte";
	import RotatingBar from "./RotatingBar.svelte";
	import { getContext } from "svelte";
	import type { Context } from "$lib/client/types/context";
	import { ApiError } from "$lib/client/api/ApiError";
	import { createErrorDialog } from "$lib/client/interactables/createErrorDialog";
	import { reloadAsset } from "$lib/client/stores/assetCache";
	import { getFileSubtype } from "$lib/classes/resource/shared";

    export let folderRoot: string;
    export let file: Client.File;

    function getIcon(file: Client.File): Icons {
        if(file.attribute.locked) {
            return 'locked';
        }

        return getFileSubtype(file);
    }

    let loading = false;
    let icon: Icons = 'folder';

    $: {
        icon = getIcon(file);

        if(loading) {
            loadingIndicator.pushState(file.location)
        } else {
            loadingIndicator.popState(file.location);
        }
    }

    const loadingIndicator = getContext<Context.LoadingIndicator>('loadingIndicator');

    async function onClick() {
        // workaround for the server adding locked attribute to all files with a challenge
        // actually fixing this would require a bunch of things to be reworked
        // ideally the class used by the client would be different from the one used by the server but thats not what i did
        if(file.attribute.locked) {
            const challengeResult = await passwordChallenge(file.location);

            if(!challengeResult) {
                return;
            }

            file.attribute.locked = false;
            file = file; // force update
        }

        loading = true;
        
        try {
            await open(file);
        } catch (ex) {
            const err = ApiError.from(ex);
            createErrorDialog('OS_ERROR', err.message);
        } finally {
            loading = false;
        }
    }

</script>

<style>
    main {
        display: flex;
    }


    .padding { 
        min-width: var(--sidebar-width);
        text-align: center;
        display: flex;
        justify-content: center;
    }
    .dot::after {
        text-align: center;
        content: '\2B24';
        font-size: 7px;
    }
    .file {
        width:100%;
    }
    main:hover {
        color: #2dd4f1;
    }

</style>

<main on:click={onClick}>
    <div class="padding"><div class="dot"></div></div>
    <div class="file">
        <ResourceLabel {icon} label={file.name}>
            {#if loading }
                <RotatingBar/>
            {/if}
        </ResourceLabel>
        <Underline/>
    </div>
</main>
 
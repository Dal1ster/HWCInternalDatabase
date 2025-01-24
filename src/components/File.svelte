<script lang="ts" context="module">
	import { File } from "$lib/classes/resources";
	import { getContentUrl } from "$lib/util/getResource";

    async function openImage(file: File) {
        const contentUrl = getContentUrl(file.location);

        // file has content override, replace all other instances of this asset
        if(file.shouldBypassCache()) {
            await reloadAsset(contentUrl);
        }

        return openAsyncWindow(file.name, Image, { src: contentUrl, dynamicResize: true, resource: file });
    }

    function openAudio(file: File) {
        // file has content override, use cache buster
        const contentUrl = getContentUrl(file.location, !!file.attribute.content);
        return openWindow(file.name, Audio, { src: contentUrl, dynamicResize: true, resource: file });
    }

    async function openVideo(file: File) {
        const contentUrl = getContentUrl(file.location, !!file.attribute.content);
        return openAsyncWindow(file.name, Video, { src: contentUrl, dynamicResize: true, resource: file });
    }

    async function openDocument(file: File) {
        const lang = file.name.toLowerCase().endsWith('.md') ? 'markdown' : 'text';
        const text = file.getAttribute('content') ?? file.content;

        return openAsyncWindow(file.name, Text, { 
            text, 
            lang, 
            dynamicResize: true,
            width: window.innerWidth, // text needs to be nudged towards wanting to take up space
            height: -1,
        });
    }

    export async function open(file: File) {
        switch(file.subtype) {
            case 'url':
                const content = file.getAttribute('content') ?? file.content;
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
                    return openWindow(file.name, Executable, { src, width: -1, height: -1, invisible, resource: file });
                }

                return openAsyncWindow(file.name, Executable, { src, width: -1, height: -1, invisible, resource: file });
            case 'archive':            
                // quick hack just to be able to host 6-in-3_L_aptop_FILES.rar externally
                if(file.attribute.hotlinked) {
                    window.open(file.getAttribute('content') ?? file.content, '_blank');
                    return null;
                }

                return download(getContentUrl(file.location), file.name);
        }

        throw new Error(`Unsupported file type: ${file.subtype}`);
    }
 </script>

<script lang="ts">
	import Image from "./ExtensionDelegate/Image.svelte";
    import Audio from "./ExtensionDelegate/Audio.svelte";
	import ResourceLabel from "./ResourceLabel.svelte";
	import { HWCWindow, openAsyncWindow, openWindow } from "../lib/client/interactables/HWCWindow";
	import Video from "./ExtensionDelegate/Video.svelte";
	import Text from "./ExtensionDelegate/Text.svelte";
	import { download } from "$lib/util/download";
	import { passwordChallenge } from "$lib/client/interactables/passwordChallenge";
	import Executable from "./ExtensionDelegate/Executable.svelte";
	import type { Icons } from "./Icon.svelte";
	import Underline from "./Underline.svelte";
	import RotatingBar from "./RotatingBar.svelte";
	import { getContext } from "svelte";
	import type { Context } from "$lib/types/context";
	import { ApiError } from "$lib/util/ApiError";
	import { createErrorDialog } from "$lib/client/interactables/createErrorDialog";
	import { reloadAsset } from "$lib/client/stores/assetCache";

    export let folderRoot: string;
    export let file: File;

    function getIcon(file: File): Icons {
        if(file.flattenAttributes().locked) {
            return 'locked';
        }

        return file.subtype;
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

    function evilEffect(window: HWCWindow) {
        // whoops you dont get to do anything anymore bye!
        document.body.classList.add('pointerless');
        setTimeout(() => {
            setInterval(window.relativeResize, 20, 0.05, 0.05);
        }, 1000)
    }

    async function onClick() {
        // workaround for the server adding locked attribute to all files with a challenge
        // actually fixing this would require a bunch of things to be reworked
        // ideally the class used by the client would be different from the one used by the server but thats not what i did
        if(file.flattenAttributes().locked) {
            const challengeResult = await passwordChallenge(file.location);

            if(!challengeResult) {
                return;
            }

            file.attribute.locked = false;
            file = file; // force update
        }

        loading = true;
        
        try {
            const window = await open(file);
            if(file.attribute.evil && window)  { // ugly hack for the one image that locks up the computer
                evilEffect(window);
            }
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
 
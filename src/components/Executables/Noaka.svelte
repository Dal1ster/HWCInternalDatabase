<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-noaka', shadow: 'none' }}/>

<script lang="ts">
	import apiFetch from "../../lib/client/api/apiFetch";
	import { getWindowByParent, HWCWindow } from "../../lib/client/interactables/HWCWindow";

    let iframe: HTMLIFrameElement;
    let windowHandle: HWCWindow;
    let videoSrc: string = '';
    let showVideo = false;

    function onload() {
        windowHandle = getWindowByParent(iframe);
        windowHandle.reportFinishedLoading();
        registerNoakaWorker();
    }

    async function submit(url: string) {
        const result = await apiFetch('/puzzle/noakiller?noaka=' + btoa(url));
        videoSrc = result.data.url;
        if(videoSrc) {
            showVideo = true;
        }
    }

    // Register interceptor that will listen for translation requests coming out of the flappy noaka game
    // the translation request is used as a password to get the solution video
    function registerNoakaWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/game/sw.js').then(() => {
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'noaka') {
                        submit(event.data.url);
                    }
                });
            }).catch(error => {
                console.error('Service Worker registration failed:', error);
            });
        }
    }

</script>

<div>
    {#if showVideo}
        <video src={videoSrc} autoplay></video>
    {:else}
        <iframe bind:this={iframe} src="/game/Flappy Noaka.html" on:load={onload}></iframe>
    {/if}
</div>

<style>
    div {
        width: 800px;
        height: 600px;
    }

    video, iframe {
        width: 100%;
        height: 100%;
    }
</style>
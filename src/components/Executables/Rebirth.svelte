
<svelte:options customElement={{ tag: 'haltmann-rebirth', shadow: 'none' }}/>

<script lang="ts">
	import { get } from "svelte/store";
    import apiFetch from "../../lib/client/api/apiFetch";
	import { onMount } from "svelte";
	import marioVirus from "../../lib/client/mario/marioVirus";

    let div: HTMLDivElement;

    function playSFX(url: string) {
        return new Promise<void>((resolve) => {
            const audio = new Audio(url);
            audio.onpause = () => {
                resolve();
                document.body.removeChild(audio);
            };
            document.body.appendChild(audio);
            audio.play();
        })
    }

    function reloadMarios() {
        const assets = window.assets;
        if(!assets) return;

        const currentStore = get(assets.store);

        const marioKey = Object.keys(currentStore).find((k) => {
            if(k.includes('autopsy-report.png')) {
                return true;
            }
            return false;
        })

        if(!marioKey) return;

        return assets.reload(marioKey);
    }

    async function rebirth() {
        const windowHandle = window.ui.getWindowByParent(div);
        await apiFetch('/rebirth?mario=bingbingwahootimes2', { method: 'GET' });
        await reloadMarios();

        try {
            windowHandle.reportFinishedLoading();
        } catch (ex) {
            console.error(ex);
        }
        const sequence = await marioVirus();

        sequence();
        window.reloadRoot();
    }

    onMount(rebirth);
</script>

<div bind:this={div}>
    <p>What are you looking at? Get Back To Work.</p>
</div>
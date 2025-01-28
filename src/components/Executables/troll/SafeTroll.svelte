<script lang="ts">
	import { createLocalCache } from "../../../lib/client/stores/createLocalCache";
	import { onDestroy} from "svelte";

    export let onLoad: (p?: any) => any;

    const IMG_SAFE = {
        Troll: '/img/troll.jpg'
    } as const;

    const TROLL_SFX = {
        'sfx_s_troll': '/sfx/troll.mp3'
    };

    let sfx = window.sfx.extendInstance(TROLL_SFX);

    const {
        loaded: allImagesLoaded,
        cache,
    } = createLocalCache(IMG_SAFE);


    onDestroy(() => {
        sfx.stop('sfx_s_troll');
    })

    async function onTroll() {
        await Promise.all([
            sfx.loadAll(),
            allImagesLoaded
        ])
        onLoad();
        sfx.play('sfx_s_troll', true);
    }
</script>

<style>
    img {
        width: inherit;
        height: inherit;
    }
</style>

<img src={$cache[IMG_SAFE.Troll]} on:load={onTroll}/>
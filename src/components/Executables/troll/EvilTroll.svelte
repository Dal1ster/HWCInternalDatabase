<script lang="ts">
	import { get } from "svelte/store";
	import type { HWCWindow } from "../../../lib/client/interactables/HWCWindow";
	import { createLocalCache } from "../../../lib/client/stores/createLocalCache";
	import { onDestroy } from "svelte";
	import { loadAsset } from "../../../lib/client/stores/assetCache";

    export let onLoad: (p?: any) => any;
    export let windowHandle: HWCWindow;
    
    let eyeLeft: HTMLDivElement;
    let eyeRight: HTMLDivElement;

    const IMG_SAFE = {
        Troll: '/img/troll.jpg'
    } as const;

    const IMG_EVIL = {
        Troll: '/img/troll_e.jpg',
        TrollEye1: '/img/troll_e_e1.png',
        TrollEye2: '/img/troll_e_e2.png',
    } as const;

    const TROLL_SFX = {
        'sfx_s_trolling': '/sfx/trolled_h.mp3',
        'sfx_s_ouch': '/sfx/trolled_ouch_short.mp3',
    }

    const {
        loaded: allImagesLoaded,
        cache,
    } = createLocalCache(IMG_EVIL);

    const sfx = window.sfx.extendInstance(TROLL_SFX);

    onDestroy(() => {
        clearInterval(timer);
        sfx.stop('sfx_s_trolling');
        document.body.classList.remove('trolling');
    })

    function appendCss() {
        if(document.getElementById('problem')) return;

        // hide these from users
        const css = `body {transition: filter 1s;}body.trolling{transition-duration: 15s!important;filter: contrast(29.5) grayscale(1);}.trolling .browser-container, .trolling .window .navbar {pointer-events: none;}`

        const styleElement = document.createElement('style');
        styleElement.id = 'problem';
        styleElement.innerHTML = css;

        document.body.append(styleElement);
    }


    let timer: ReturnType<typeof setInterval>;
    async function onEpicTroll() {
        appendCss();
        
        await Promise.all([
            hijackCache(),
            sfx.loadAll(),
            allImagesLoaded
        ])
        
        onLoad();

        document.body.classList.add('trolling');
        windowHandle.recalculateWindowSizing();
        windowHandle.reportFinishedLoading();
        sfx.play('sfx_s_trolling' as any, true);
        timer = setInterval(() => {
            windowHandle.relativeMove({
                x: Math.random() * 10 - 5,
                y: Math.random() * 10 - 5
            })
        }, 50);

        
        // position the eyes
        const currentMouse = get(window.mouse);
        const coords = {
            clientX: currentMouse.x,
            clientY: currentMouse.y
        }

        positionEye(eyeLeft, coords);
        positionEye(eyeRight, coords);
    }

    async function hijackCache() {
        const asset = window.assets;
        const satisfied = await loadAsset('/img/troll_satisfied.jpg');

        asset.store.update((old) => {
            old[IMG_SAFE.Troll] = satisfied;
            return old;
        })
    }

    const EYESOCKET_RADIUS = 20;

    function positionEye(div: HTMLDivElement, e: { clientX: number; clientY: number; }) {
        const rect = div.getBoundingClientRect();
        const b = e.clientX - rect.left + rect.width / 2;
        const a = e.clientY - rect.top + rect.height / 2;
        const c = Math.sqrt(b * b + a * a);

        const sin = a / c;
        const cos = b / c;
        
        const maxA = EYESOCKET_RADIUS * sin;
        const maxB = EYESOCKET_RADIUS * cos;

        if(c > EYESOCKET_RADIUS) {
            div.setAttribute('style', `--shift-x: ${maxB}px; --shift-y: ${maxA}px;`);
            return;
        }

        div.setAttribute('style', `--shift-x: ${b}px; --shift-y: ${a}px;`);
    }

    function onPointerMove(e: PointerEvent) {
        positionEye(eyeLeft, e);
        positionEye(eyeRight, e);
        windowHandle.bringToFront();
    }

    let hp = 2;
    function ouch(e: MouseEvent) {
        const eye = e.currentTarget as HTMLDivElement;
        eye.remove();
        hp--;

        sfx.stop('sfx_s_trolling');
        sfx.play('sfx_s_ouch').then(() => hp > 0 && sfx.play('sfx_s_trolling', true));

        if(hp === 0) {
            windowHandle.close();
        } 
    }
</script>

<style>

    img {
        width: inherit;
        height: inherit;
    }

    .e {
        transform-origin: center;
        position: absolute;

        cursor: pointer;
    }

    .e.e-l {
        top: calc(35% + calc(var(--shift-y, 0) * 1));
        left: calc(30% + var(--shift-x, 0));
    }

    .e.e-r {
        top: calc(35% + calc(var(--shift-y, 0) * 1));
        left: calc(57% + var(--shift-x, 0));
    }

    .t {
        animation: leftright 0.15s infinite;
    }

    @keyframes leftright {
        0%, 23%{
            transform: translateX(0);
        }
        25%, 48% {
            transform: translateX(15px);
        }
        50% {
            transform: translateX(-15px);
        }
    }
</style>

<svelte:body on:pointermove={onPointerMove}/>

<img class="t" src={$cache[IMG_EVIL.Troll]} on:load={onEpicTroll} />
<div class="e e-l" bind:this={eyeLeft} on:mousedown={ouch}>
    <img src={$cache[IMG_EVIL.TrollEye1]}/>
</div>
<div class="e e-r" bind:this={eyeRight} on:mousedown={ouch}>
    <img src={$cache[IMG_EVIL.TrollEye2]}/>
</div>
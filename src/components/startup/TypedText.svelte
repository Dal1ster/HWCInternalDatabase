<script lang="ts">
    import { nanoid } from 'nanoid';
    import { onDestroy, onMount } from 'svelte';
    import TypedJS from 'typed.js';
	import sfx from '../../lib/client/sfx';

    export let speed = 50;
    export let text = '';
    export let color = 'white';
    export let onComplete = () => {};

    export let type: 'text' | 'password' = 'text';

    export let showCursor = true;

    const id = `tt-${nanoid()}`;

    const MINIMUM_SFX_INTERVAL = 150;

    let typed: TypedJS;
    let typingClickTimer: ReturnType<typeof setTimeout>;

    onMount(() => {
        typed = new TypedJS(`#${id}`, {
            strings: [text],
            typeSpeed: speed,
            onComplete() {
                stopSFXTimer()
                sfx.play('sfx_s_terminal_data_p3');
                onComplete();
            },
            onBegin() {
                if(text.length > 0) {
                    sfx.play('sfx_s_terminal_data_p1');
                    playAndSetSFXTimer()
                }
            },
            onTypingPaused: stopSFXTimer,
            onTypingResumed: playAndSetSFXTimer,
            onDestroy: stopSFXTimer
        });
    });

    function stopSFXTimer() {
        clearTimeout(typingClickTimer);
        sfx.stop('text');
    }

    function playAndSetSFXTimer() {
        sfx.play('sfx_s_terminal_data_p2');
        if(!showCursor) {
            return;
        }

        typingClickTimer = setTimeout(playAndSetSFXTimer, speed > MINIMUM_SFX_INTERVAL ? speed : MINIMUM_SFX_INTERVAL);
    }


    onDestroy(() => {
        typed?.destroy();
    });

</script>

<style>
    span {
        font-size: 16px;
        font-family: monospace;
        --cursor-font-size: 16px;
        display: 'inline-block';
    }

    .password {
        --webkit-text-security: disc;
        color: transparent;
        user-select: none;
    }


    :global(.typed-cursor) {
        font-size: var(--cursor-font-size)!important;
        font-family: monospace!important;
    }
</style>
<span style:--cursor-font-size={showCursor ? '16px' : '0px'} style:color={color}>
    <span class={type} {id} ></span>
</span>
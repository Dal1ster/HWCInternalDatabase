<script lang="ts">
    import { nanoid } from 'nanoid';
    import { onDestroy, onMount } from 'svelte';
    import Typed from 'typed.js';
	import sfx from '../../lib/client/sfx';

    export let speed = 50;
    export let text = '';
    export let color = 'white';
    export let onComplete = () => {};

    export let type: 'text' | 'password' | 'user' = 'text';

    export let showCursor = true;

    const id = `tt-${nanoid()}`;

    let typed: Typed;

    let typingClickTimer: ReturnType<typeof setTimeout> | number;

    onMount(() => {
        typed = new Typed(`#${id}`, {
            strings: [text],
            typeSpeed: speed,
            onComplete() {
                stopClick()
                sfx.play('sfx_s_terminal_data_p3');
                onComplete();
            },
            onBegin() {
                if(text.length > 0) {
                    sfx.play('sfx_s_terminal_data_p1');
                    playAndSetNextClick()
                }
            },
            onTypingPaused() {
                stopClick()
            },
            onTypingResumed() {
                playAndSetNextClick()
            },
            onDestroy() {
                stopClick()
            }
        });
    });

    function stopClick() {
        clearTimeout(typingClickTimer as number);
        sfx.stop('text');
    }

    function playAndSetNextClick() {
        sfx.play('sfx_s_terminal_data_p2');
        if(!showCursor) {
            return;
        }
        typingClickTimer = setTimeout(playAndSetNextClick, speed > 150 ? speed : 150);
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
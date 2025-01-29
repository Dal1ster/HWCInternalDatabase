
<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement={{ tag: 'haltmann-oracle2', shadow: 'none' }}/>

<script lang="ts">
	import type { HWCWindowHandle } from "../../lib/client/interactables/HWCWindow";
	import { onMount } from "svelte";
	import { ApiError } from "../../lib/client/api/ApiError";
	import apiFetch from "../../lib/client/api/apiFetch";
	import RotatingBar from "../RotatingBar.svelte";
	import { tokenize } from "../../lib/util/tokenize";
    
    let answer = '';
    let message = '';
    let loading = false;
    let isError = false;

    let input: HTMLInputElement;
    let p: HTMLParagraphElement
    let windowHandle: HWCWindowHandle;


    function getMyDirectory() {
        const location = windowHandle.properties?.resource?.location;
        if(!location) {
            return;
        }

        const pathTokens = tokenize(location);
        return pathTokens.slice(0, -1).join('/');
    }

    function reloadDirectory(location = getMyDirectory()) {
        if(!location) {
            return;
        }

        window.reloadDirectory(location);
    }

    async function submit() {
        if (loading) return;
        loading = true;

        let pHeight = p.clientHeight;

        try {
            const res = await apiFetch('/puzzle/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer }),
            });

            message = res.message;
            window.sfx.play('sfx_s_item_get02_cassette');

            isError = false;

            reloadDirectory(res.data.refreshTarget);
        } catch (ex) {
            const err = ApiError.from(ex);

            isError = true;
            message = err.message;
            window.sfx.play('sfx_s_terminal_buzzer')
        } finally {
            // doesnt work here as the window already has a set height, this could be reworked but we dont have time
            // windowHandle.recalculateWindowSizing();
            setTimeout(() => {
                const sizeDifference = p.clientHeight - pHeight;
                windowHandle.relativeResize(0, sizeDifference);
            }, 10)

            loading = false;
        }
    }

    function onkeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            submit();
        }
    }

    onMount(() => {
        input.focus();
        windowHandle = window.ui.getWindowByParent(input);
        
        windowHandle.recalculateWindowSizing();
        windowHandle.reportFinishedLoading();
    });
</script>

<style>
    p {
        text-align: center;
        width:100%;
    }

    .error {
        color: red;
    }

    main {
        padding-left: 2em;
        padding-right: 2em;
    }

    h1 {
        text-align: center;
    }

    .input-field {
        display: flex;
        align-items: stretch;
        justify-content: center;
    }

    input {
        background: transparent;
        padding: 0.3em;
        color: #00B9FD;
        border: 0.30em solid #FD46FC;
        font-size: 1.1em;
        font-family: 'Ace Futurism', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    input:focus-visible {
        outline: none;
    }

    button {
        background: #FD46FC;
        border: 0.2em solid #FD46FC;
        font-size: 1.41em;
        color: white;
        font-family: 'Ace Futurism', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    button:hover {
        background: #a610c1;
        border: 0.2em solid #a610c1;
        cursor: pointer;
    }

    /* hack to make the loading bar overlaid on top of the button text*/
    .input-field :global(.bar) {
        position: absolute;
        margin-left: 1em;
    }
</style>

<main>
    <div>
        <h1>
            What do you have to offer?
        </h1>
        <div class="input-field">
            <input disabled={loading} type="text" bind:value={answer} bind:this={input} on:keydown={onkeydown} size="15"/>
            <button disabled={loading} on:click={submit}>
                {#if loading}
                    <RotatingBar/>
                {/if}
                <span style:visibility={loading ? 'hidden' : 'visible'}>Offer</span>  
            </button>
        </div>
        <div style="width:100%;" class:error={isError}>
            <p bind:this={p} style:visibility={message && !loading ? 'visible' : 'hidden'}>{message || 'Placeholder'}</p>
        </div>
    </div>
</main>
<script lang="ts">
	import { getContext, onDestroy, onMount } from "svelte";
	import Icon from "../Icon.svelte";

	import { ApiError } from "$lib/client/api/ApiError";
	import apiFetch from "$lib/client/api/apiFetch";
	import type { Context } from "$lib/client/types/context";
	import RotatingBar from "../RotatingBar.svelte";
	import sfx from "$lib/client/sfx";

    let password = '';
    let loading = false;
    let message = '';

    let input: HTMLInputElement;

    export let onSuccess = () => {};
    export let onDismiss = () => {};

    export let location: string;

    // anti datamining flag
    let silly = false;

    const loadingIndicator = getContext<Context.LoadingIndicator>('loadingIndicator');

    $: {
        if(loading) {
            loadingIndicator.pushState(`challenge-${location}`);
        } else {
            loadingIndicator.popState(`challenge-${location}`);
        }
    }

    

    async function submit() {
        if (loading) return;
        loading = true;

        try {
            await apiFetch(`/filesystem/challenge?${new URLSearchParams({ location })}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });
            onSuccess();
        } catch (ex) {
            const err = ApiError.from(ex);

            if(err.data?.silly) {
                silly = true;
                return;
            }
            
            sfx.play('sfx_s_terminal_buzzer');
            message = err.message;
        } finally {
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
    });

    onDestroy(() => {
        onDismiss();
        loadingIndicator.popState(`challenge-${location}`);
    });
</script>

<style>
    p {
        color: red;
        text-align: center;
        width:100%;
    }

    main {
        padding: 15px;
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
        -webkit-text-security: disc;
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
        {#if !silly }
            <h1>
                <Icon icon="locked" width="48px" height="48px" inline/>
                Password Required
            </h1>
            <div class="input-field">
                <input disabled={loading} autocomplete="off" bind:value={password} bind:this={input} on:keydown={onkeydown}/>
                <button disabled={loading} on:click={submit}>
                    {#if loading}
                        <RotatingBar/>
                    {/if}
                    <span style:visibility={loading ? 'hidden' : 'visible'}>Submit</span>
                </button>
            </div>
            <div style="width:100%;" style:visibility={message && !loading ? 'visible' : 'hidden'}>
                <p>{message || 'Placeholder'}</p>
            </div>
        {:else}
            <img style="width:100%;height:auto;" src="/youarebeingsilly.png"/>
        {/if}
    </div>
</main>
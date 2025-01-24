
<svelte:options customElement={{ tag: 'haltmann-cs50x', shadow: 'none' }}/>

<script lang="ts">
	import type { HWCWindow } from "../../lib/client/interactables/HWCWindow";
	import { onMount } from "svelte";
	import { ApiError } from "../../lib/util/ApiError";
	import apiFetch from "../../lib/util/apiFetch";
	import { download } from "../../lib/util/download";

    type Input = {
        maxlength: number;
        state?: 'correct' | 'incorrect' | '';
    }

    let inputs: Input[] = [
        { maxlength: 3, state: '' },
        { maxlength: 5, state: '' },
        { maxlength: 10, state: ''},
        { maxlength: 4, state: '' },
        { maxlength: 4, state: '' },
        { maxlength: 8, state: '' },
        { maxlength: 8, state: '' },
        { maxlength: 4, state: '' },
        { maxlength: 7, state: '' },
        { maxlength: 7, state: '' }
    ];

    let loading = false;
    let message = '';

    let form: HTMLFormElement;
    let p: HTMLParagraphElement
    let windowHandle: HWCWindow;
    let isError: boolean = false;

    function updateInputWithData(data: Pick<Input, 'state'>[]) {
        inputs = inputs.map((input, i) => ({ ...input, ...data[i] }));
    }

    async function submit() {
        if (loading) return;
        loading = true;

        let pHeight = p.clientHeight;
        const formData = new FormData(form);
        const answer = Array.from(formData.getAll('answer[]') as string[]);

        try {
            const res = await apiFetch('/proficiency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answer }),
            });

            message = res.message;
            isError = false;
            // updateInputWithData(res.data);
            download(res.data.prize, 'RESPH.zip');
            window.sfx.play('sfx_s_item_get02_cassette');
        } catch (ex) {
            const err = ApiError.from(ex);
            message = err.message;
            isError = true;
            // updateInputWithData(err.data);

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

    onMount(() => {
        windowHandle = window.ui.getWindowByParent(p);
        
        windowHandle.recalculateWindowSizing();
        windowHandle.reportFinishedLoading();
    });

    function onkeydown(event: KeyboardEvent) {
        const element = event.currentTarget as HTMLInputElement;
        const i = parseInt(element.getAttribute('data-position')!);

        if (event.key === 'Enter') {
            submit()
        }

        inputs[i].state = '';

        inputs = inputs;
    }
</script>

<main>
    <div>
        <h1>
            Solutions
        </h1>
        <form bind:this={form}>
            {#each inputs as { maxlength, state }, i}
                <div class="input-field">
                    <label for={`answer[${i}]`}>{i + 1}</label>
                    <input type="text" class={state} name={`answer[]`} {maxlength} data-position={i} on:keydown={onkeydown}/>
                </div>
            {/each}
        </form>
        <div style="display: flex; justify-content: center;">
            <button on:click={submit}>Submit</button>
        </div>
        <div style="width:100%;">
            <p class:error={isError}  bind:this={p} style:visibility={message && !loading ? 'visible' : 'hidden'}>{message || 'Placeholder'}</p>
        </div>
    </div>
</main>

<style>
    .error {
        color: red;
    }

    p {
        text-align: center;
        width:100%;
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
        color: #00B9FD;
        border: 0.30em solid #FD46FC;
        font-size: 1.1em;
        font-family: 'Ace Futurism', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    input:focus-visible {
        outline: none;
    }

    button {
        margin-top: 1em;
        padding: 0.1em 0.8em;
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

    form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-column-gap: 10px;
        grid-row-gap: 10px;
    }

    .input-field input{
        width: 200px;
    }

    
    .input-field label {
        margin-right: 10px;
        font-size: 1.5em;
        width: 1.5em;
        text-align: center;
        align-self: center;
    }

    .correct {
        border-color: green;
    }

    .incorrect {
        border-color: red;
    }
</style>

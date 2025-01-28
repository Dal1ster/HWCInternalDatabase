<svelte:options customElement={{ tag: 'haltmann-thesafe', shadow: 'none' }}/>
<script lang="ts">
	import { derived } from "svelte/store";
    import { getWindowByParent, HWCWindow } from "../../lib/client/interactables/HWCWindow";
    import { onDestroy, onMount } from "svelte";
	import countdownStore, { setCountdown } from "../../lib/client/stores/countdownStore";
	import apiFetch from "../../lib/client/api/apiFetch";
	import { ApiError } from "../../lib/client/api/ApiError";
	import wait from "../../lib/util/wait";
	import Icon from "../Icon.svelte";
	import VoteBar from "./shared/VoteBar.svelte";

    type APIResponse = {
        previousGuess: string;
        timeLeft: number,
        votes: number,
        yourVote?: string,
        lockedIn: boolean,
        status: 'solved' | 'unsolved' | 'waiting',
        results: { vote: string, count: number }[]
    } & ({
        status: 'solved',
        reward: string,
        title: string
    } | {
        status: 'unsolved' | 'waiting'
    })


    function formatTime(n: number) {
        const minutes = Math.floor(n / 60);
        const seconds = n % 60;

        return `${minutes}:${seconds < 10 ? `0${seconds}` : `${seconds}`}`;
    }


    const display = derived(countdownStore, formatTime);

    let div: HTMLDivElement;
    let windowHandle: HWCWindow;

    let input = ['_', '_', '_', '_', '_'];
    let currentField = 0;

    let initialized = false;

    let videoPlayerMode = false;
    let showSafeFace = true;
    let videoLink = '';

    let locked = false;
    let message = 'Enter your guess';

    let results: { vote: string, percentage: number, color: string }[] = [
        { vote: '', percentage: 0, color: 'red'},
        { vote: '', percentage: 0, color: 'blue'},
        { vote: '', percentage: 0, color: 'purple'},
        { vote: '', percentage: 0, color: 'orange'},
        { vote: '', percentage: 0, color: 'green'}
    ];

    const sfx = window.sfx.extendInstance({
        'sfx_s_rumble': '/sfx/sfx_s_rumble.mp3',
        'explosion': '/sfx/sfx_deltarune.mp3',
    });

    async function getStatus() {
        const response = await apiFetch('/puzzle/the-safe' + (locked ? `?vote=${input.filter(m => m !=='_').join('')}` : ''), { method: 'GET', credentials: 'include'});
        return response;
    }

    async function updateCycle() {
        const status = await getStatus().catch(ApiError.from);
        update(status);
    }

    async function update(response: { data?: APIResponse, message: string}) {
        const { data } = response;

        if(data) {
            if(!initialized) {
                initialized = true;
                rerender();
                if(data.yourVote) {
                    input = [...data.yourVote];
                    currentField = data.yourVote.length;
                }
            }

            if(data.status === 'unsolved') {
                input = ['_', '_', '_', '_', '_'];
                sfx.play('sfx_s_terminal_buzzer');
                currentField = 0;
            }

            if(data.status === 'solved' && exploding !== true) {
                grantReward(data.title, data.reward);
            }

            if(data.results) {
                let sorted = data.results.map(({ vote, count }, i) => ({ vote, percentage: (count / data.votes * 100) })).splice(0, 5);
                for(const i in results) {
                    results[i].percentage = 0;
                    results[i].vote = '';
                }
                
                for(const i in sorted) {
                    results[i].vote = sorted[i].vote;
                    results[i].percentage = sorted[i].percentage;
                }
                results = results;
            }


            locked = data.lockedIn;
            setCountdown(Math.round(data.timeLeft / 1000));
        }

        message = response.message || message;
    }


    let updateInterval: ReturnType<typeof setInterval>;
    function setUpdateInterval() {
        updateInterval = setInterval(updateCycle, 1000);
    }
    
    async function grantReward(windowName: string, rewardUrl: string) {
        videoLink = rewardUrl;
        
        await explode();
        await doThrow();
        // there is a bug with the width of the element, i spent way too much time trying to fix it
        windowHandle.recalculateWindowSizing();
        windowHandle.relativeResize(0, 0);
        showSafeFace = false;
        
        document.body.classList.add('pointerless');
        await takeOverScreen();
        windowHandle.setWindowName(windowName);
    }

    onMount(async () => {
        windowHandle = getWindowByParent(div);
        await updateCycle();
        windowHandle.reportFinishedLoading();
        setUpdateInterval();
    });

    async function takeOverScreen() {
        const rect = windowHandle.getMountContainer()?.getBoundingClientRect();
        if(!rect) {
            return;
        }

        const leftShift = 20 - rect.left;
        const topShift = 60 - rect.top;

        const widthShift = window.innerWidth * 0.9 - (rect.width);
        const heightShift = window.innerHeight * 0.9 - (rect.height);
    
        const totalTime = 2 * 1000 ;
        const iterations = 60;
        
        const interval = setInterval(() => {
            windowHandle.relativeMove({ 
                x: leftShift / iterations, 
                y: topShift / iterations,
            })

            windowHandle.relativeResize(widthShift / iterations, heightShift / iterations);
            
        }, totalTime / iterations);

        await wait(totalTime);
        clearInterval(interval);

        videoPlayerMode = true;
    }


    onDestroy(() => clearInterval(updateInterval));

    function pressKey(value: string) {
        return (e: MouseEvent) => {
            sfx.play('sfx_s_terminal_loading_end');
            if(currentField >= input.length) return;
            input[currentField++] = value;
        }
    }

    function backspace() {
        if(currentField === 0) return;
        sfx.play('sfx_s_terminal_cancel');
        input[--currentField] = '_';
    }

    async function submit() {
        sfx.play('sfx_s_terminal_loading_end');
        const result = await apiFetch('/puzzle/the-safe?1', {
            method: 'POST',
            body: JSON.stringify({ vote: input.join('') })
        }).catch(ApiError.from);

        if(!(result instanceof ApiError)) {
            locked = true;
        }

        update(result);
        rerender();
    }

    function disableIfFilled(n: typeof NUMBERS[number]) {
        return currentField >= input.length && !isNaN(parseInt(n.value)) || locked || !initialized;
    }
    
    function disableIfUnfilled(n: typeof NUMBERS[number]) {
        return currentField < input.length || locked || !initialized;
    }

    function rerender() {
        NUMBERS = NUMBERS;
    }

    function onVideoFinished() {
        document.body.classList.remove('pointerless');
        windowHandle.close();
    }

    let NUMBERS: { 
        onClick: (e: MouseEvent) => any, 
        value: string,
        disableCondition: (n: typeof NUMBERS[number]) => boolean 
    }[] = [
        { onClick: pressKey('1'), value: '1', disableCondition: disableIfFilled },
        { onClick: pressKey('2'), value: '2', disableCondition: disableIfFilled },
        { onClick: pressKey('3'), value: '3', disableCondition: disableIfFilled },
        { onClick: pressKey('4'), value: '4', disableCondition: disableIfFilled },
        { onClick: pressKey('5'), value: '5', disableCondition: disableIfFilled },
        { onClick: pressKey('6'), value: '6', disableCondition: disableIfFilled },
        { onClick: pressKey('7'), value: '7', disableCondition: disableIfFilled },
        { onClick: pressKey('8'), value: '8', disableCondition: disableIfFilled },
        { onClick: pressKey('9'), value: '9', disableCondition: disableIfFilled },
        { onClick: backspace, value: '←', disableCondition: () => locked || !initialized },
        { onClick: pressKey('0'), value: '0', disableCondition: disableIfFilled },
        { onClick: submit, value: 'A', disableCondition: disableIfUnfilled },
    ]; 

    let exploding = false;
    let magnitude = 0;

    let offsetX = 0;
    let velocityX = 0;
    let offsetY = 0;
    let velocityY = 0;
    let angle = 0;

    let shaking = false;

    async function doThrow() {
        velocityY = -15;
        velocityX = Math.random() * 10 - 5;
        const gravity = setInterval(() => {
            offsetX += velocityX;
            offsetY += velocityY;
            angle += 1;
        }, 1000 / 60);

        const velocity = setInterval(() => {
            velocityY += 0.5;
        }, 1000 / 60);

        await wait(5 * 1000);
        clearInterval(gravity);
        clearInterval(velocity);
    }

    async function explode() {
        if(exploding) return;
        exploding = true;
        
        await Promise.all([
            sfx.load('/sfx/sfx_s_rumble.mp3', 'sfx_s_rumble', 0),
            wait(2000)
        ])

        shaking = true;
        magnitude = 1;
        const wiggle = setInterval(() => {
            magnitude += 0.5;
        }, 200);
        
        await Promise.all([
            sfx.load('/sfx/sfx_deltarune.mp3','explosion', 0),
            sfx.play('sfx_s_rumble', false)
        ])
        clearInterval(wiggle);

        shaking = false;

        sfx.play('explosion');
    }

</script>
<div class="container">
    <div class="front" class:wiggler={shaking} style:--wiggle-intensity={`${magnitude}px`}>
        {#if videoPlayerMode}
            <video src={videoLink} autoplay on:pause={onVideoFinished}></video>
        {:else if showSafeFace }
            <div class="safe" bind:this={div} style:transform={`translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg)`}>
                <div class="safe-face">
                    <div class="display">
                        {#each input as i}
                            <span class="input-number">{i}</span>
                        {/each}
                        {#if locked}
                            <span class="lock">
                                <Icon icon="locked" />
                            </span>
                        {/if}
                    </div>
                    <div class="message opener">
                        {message}
                    </div>
                    <div class="">
                        
                    </div>
                    <div class="counter">
                        <span style="display:inline-block"><Icon icon="clock" width="0.75em"></Icon></span>
                        <span class="timestamp">{$display}</span>
                    </div>
                </div> 
                <div class="keypad">
                {#each NUMBERS as n (n.value)}
                    <button class="key" disabled={n.disableCondition(n) || !initialized} on:click={n.onClick}>{n.value}</button>
                {/each}
                </div>
                <div class="analytics">
                    <div class="analytics-text">Vote-O-Matic</div>
                    <div class="vote-tallies">
                    {#each results as result}
                        <VoteBar hidden={result.vote.length < 5} color={result.color} percentage={result.percentage} vote={result.vote}/>
                    {/each}
                    </div>
                </div>
            </div>
        {:else}
            <div class="filler"> </div>
        {/if}
    </div>
</div>

<style>

    .lock {
        position: absolute;
        left: 0.5em;
    }

    .front {
        background-color: #061040;
        border: 10px solid hsl(214, 97%, 24%);
        display: grid;
        place-content: center;
    }

    .display {
        background-color: #061040;
        padding: 0.25em;
        display:flex;
        justify-content: center;
        position: relative;
    }

    .key {
        width: 50px;
        height: 50px;
        font-size: 32px;
    }

    .safe {
        display: flex;
        background-color: hsl(214, 97%, 24%);
        padding: 1em;
    }

    .safe-face {
        width: 200px;
        height: auto;
        background-color: hsl(214, 97%, 24%);
        border-radius: 10px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
    }

    .keypad {
        display: grid;
        background-color: #061040;
        grid-template-columns: repeat(3, 1fr);
        grid-gap: 10px;
        margin-left: 10px;
        padding: 10px;
    }

    .keypad button {
        background-color: #FD46FC;
        border: 5px solid #FD46FC;
        color:white;
        cursor: pointer;
    }

    .keypad button:hover {
        background-color: hsl(300deg 95.78% 35.07%);
        border: 5px solid #FD46FC;
        color: hsl(300deg 100% 20.15%);
    }

    .keypad button:disabled {
        background-color: hsl(300deg 95.78% 35.07%);
        border: 5px solid hsl(300deg 95.78% 35.07%);
        color: hsl(300deg 100% 20.15%);
        cursor: revert;
    }

    .input-number {
        margin-left: 10px;

    }

    .opener {
        flex-grow:1;
    }

    .message { 
        height: 2em;
        background-color: #061040;
        margin: 10px 0px;
        padding: 5px;
        font-size: 0.8em;
        text-align: center;
        vertical-align: middle;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .counter { 
        background-color: #061040;
        width: max-content;

        display: flex;
        padding: 5px;
    }

    .timestamp {
        display: inline-block;
        width: 2em;
        text-align: center;
    }

    .wiggler {
        animation: wiggle 0.25s forwards infinite linear;
    }

    .vote-tallies { 
        width: 180px;
        background-color: #061040;

        display: flex;
        flex-direction: column;
        justify-content: space-evenly;

        margin-top:10px;

        flex-grow:1;
    }

    .analytics-text {
        width: 100%;
        background-color: #061040;
        display: flex;
        justify-content: center;
        padding: 5px 0;
    }
    
    .analytics {
        margin-left: 10px;
        display:flex;
        flex-direction: column;
    }


    @keyframes wiggle {
        0%, 50%, 100% {
            transform: translateX(0);
        }

        25% {
            transform: translateX(var(--wiggle-intensity));
        }

        75% {
            transform: translateX(calc(var(--wiggle-intensity) * -1));
        }
    }

    .front {
        height: calc(100% - 1em - 20px);
        background: black;
    }

    video, .filler {
        width: 100%;
        height: 100%;
        max-height: 80vh;
    }

    .container {
        padding: 0.5em;
        height: 100%;
    }
</style>
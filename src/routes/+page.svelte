<script lang="ts" context="module">

    type TypedTextLine = { 
        type?:'text' | 'password', 
        text?: string, 
        speed?: number, 
        nobreak?: true, 
        color?: string, 
        precall?: (() => Promise<any>) | (() => any)
    };
</script>

<script lang="ts">
    import externalizeGlobals from "$lib/client/externalizeGlobals";
    

	import CrtStripes from "../components/CRTStripes.svelte";
    import GlobalLoadingIndicator from "../components/GlobalLoadingIndicator.svelte";
	import Display from "../components/Display.svelte";
	import WindowManager from "../components/WindowManager.svelte";
	import Browser from "../components/Browser.svelte";
	import TypedText from "../components/startup/TypedText.svelte";
	import callbackPromise from "$lib/util/callbackPromise";
	import { onMount } from "svelte";
	import TransitionaryBackground from "../components/TransitionaryBackground.svelte";
	import sfx from "$lib/client/sfx";
	import VolumeToggle from "../components/VolumeToggle.svelte";

    let loaded = false;

    let showBrowser = false;
    let showShell = true;
    let beginAnimation = false;

    let mountBrowser = false;

    let mbfDiv: HTMLDivElement;

    const [promiseThatResolvesWhenFilesLoad, resolveFileLoadingPromise] = callbackPromise();
    const [animationFinished, finishAnimation] = callbackPromise();
    const [anyKeyPressed, resolveAnyKeyPressed] = callbackPromise();

    function playStartupSound() {
        if(localStorage.getItem('1up') === 'true') {
            localStorage.removeItem('1up');
            return sfx.play('sfx_s_1up');
        }
        return sfx.play('sfx_s_terminal_power_on');
    }

    animationFinished.then(() => { // for some reason this wont work as part of the sequence and i dont know why 
        playStartupSound();
        showBrowser = true;
    })

    function setQuickStartupFlag() {
        localStorage.setItem('loggedin', 'true');
    }

    let strings = new Array<TypedTextLine & { lineNo: number }>();
    
    let sequence = new Array<TypedTextLine>();
    
    const desktopMOTD: TypedTextLine[] = [
        {   text: "$----------------------------------------MOTD------------------------------------------$", speed: 5 },
        {   text: '|                                                                                      |'    },
        {   text: '|                        HWC Distributed Database $ystems v1.5.                        |'    },
        {   text: '|                              Project AIRTH !TOP SECRET!                              |'    },
        {   text: '|                                                                                      |'    },
        {   text: '| "I\'ll send you to the crusher if you so much as joke about leaking this" - Haltmann. |'   },
        {   text: '|                                                                                      |'    },
        {   text: '$--------------------------------------------------------------------------------------$'    },
    ];

    const mobileMOTD: TypedTextLine[] = [
        {   text: "$-------------MOTD-------------$", speed: 5 },
        {   text: '|                              |'    },
        {   text: '|         HWC DD$ v1.5.        |'    },
        {   text: '|  Project AIRTH !TOP SECRET!  |'    },
        {   text: '|                              |'    },
        {   text: "$------------------------------$"   },
    ]

    const longLoginSequence: TypedTextLine[] = [
        {   text: '', color: 'yellow', speed: 25 },
        {   text: '[warn] SAFE MODE: ENABLED' },
        {   text: '', color: 'white' },
        {   text: '[info] Connecting to //hwcinternaldb^500.^600.^700.' },
        {   text: '[info] Connection to authentication server established on TCP port 777!^1000' },
        {   text: '', color: 'white' },
        {   text: 'User: ^2000', nobreak: true, speed: 25 },
        {   text: 'M^250A^250X^250P^250H', speed: 10 },
        {   text: 'Password: ^2000', nobreak: true, speed: 25 },
        {   text: 'Susie$777$^2000', type: 'password',  speed: 350 },
        {   text: '', speed: 25 },
        {   text: '[info] Password accepted.' },
        {   text: '[info] Welcome President Haltmann. We wish you glorious profits today!^1000' },
        {   text: '' },
        {   text: '[info] Connecting to primary database //main.hwcinternaldb/^200.^200.^200.^2000' },
        {   text: '[error] Connection Error: EHOSTDOWN', color: 'red', precall: () => void sfx.play('sfx_s_terminal_buzzer'), speed: 10 },
        {   text: '[critc] !!!PRIMARY //main.hwcinternaldb/ DATABASE UNAVAILABLE!!!^1000', speed: 25 },
        {   text: '', color: 'yellow', speed: 25 },
        {   text: '[warn] Safe mode is enabled, engaging recovery.^1000' },
        {   text: '', color: 'white' },
        {   text: '[info] ACCESSING LOCAL STORAGE SHARD //s102.hwcinternaldb/ IN READ-ONLY MODE^200.^300.^450.^750.', precall: async () => mountBrowser = true, nobreak: true }
    ]

    const shortLoginSequence: TypedTextLine[] = [
        {   text: 'HWC Distributed Database $ystems v1.5. Copyright 2016', speed: 10, color: 'white' },
        {   text: '[info] Restoring Session^100.^200.^200.^1200.', precall: () => mountBrowser = true, nobreak: true }
    ];

    const boostrapSequence: TypedTextLine[] = [
        {   text: 'OK!^200', precall: () => promiseThatResolvesWhenFilesLoad.then(() => void sfx.play('sfx_s_terminal_enter')) },
        {   text: 'Message from the Administrator: In light of recent incidents, Haltmann Works Company wishes to remind its employees of their responsibility to report any unauthorized activity on the company intranet to their supervisors. Failure to carry out your duties will result in termination and punitive action.'},
        {   text: '[info] Initializing interface^200.^300.^400.^3000' },
        {   text: '', precall: () => { beginAnimation = true, showShell = false, setQuickStartupFlag(), sfx.play('hwc-chime') } },
        {   text: '', precall: () => animationFinished },
    ];

    const anyKeyToContinue: TypedTextLine[] = [
        {   text: 'Press any key to start...', speed: 25, color: 'yellow' },
        {   text: '', precall: () => anyKeyPressed }
    ]

    async function* bootup() {
        let currentColor = 'white';
        let curentTypeSpeed = 0;
        let nextLine: TypedTextLine | undefined;
        let lineNo = 0;
        while(nextLine = sequence.shift()) {
            // prevent overflow
            if(mbfDiv.scrollHeight > mbfDiv.offsetHeight) {
                strings.splice(0, 4);
                strings = strings;
            }

            if(nextLine.speed) {
                curentTypeSpeed = nextLine.speed;
            }
            if(nextLine.color) {
                currentColor = nextLine.color;
            }

            if(nextLine.precall) {
                const result = await nextLine.precall();
                if(typeof result === 'string') {
                    nextLine.text = nextLine.text || result;
                }
            }

            if(typeof nextLine.text === 'string') {
                strings.push({
                    text: nextLine.text.replaceAll(' ', ' '), // Replace spaces with full-width spaces, to prevent culling
                    speed: curentTypeSpeed,
                    color: currentColor,
                    nobreak: nextLine.nobreak,
                    type: nextLine.type,
                    lineNo: lineNo++
                });
                strings = strings;
                yield;
            }
        }
    }

    const seq = bootup();
    
    let shortStart = false;
    let startupBypass = false;
    onMount(() => {
        // initialize all the stuff we're shoving into the window object
        externalizeGlobals();
        
        let oneUp = false;
        if(localStorage.getItem('1up') === 'true') {
            oneUp = true;
        }

        startupBypass = localStorage.getItem('skip') === 'true';

        sfx.loadAll();
        if(startupBypass) {
            mountBrowser = true
            showShell = false;
            beginAnimation = true;
            promiseThatResolvesWhenFilesLoad.then(() => showBrowser = true);
            return;
        }

        shortStart = localStorage.getItem('loggedin') ? true : false;
        if(shortStart) {
            sequence.push(...shortLoginSequence);
        } else {
            sequence.push(...anyKeyToContinue);
            if(window.innerWidth > 825) { // we have enough space for the large motd
                sequence.push(...desktopMOTD);
            } else {
                sequence.push(...mobileMOTD);
            }
            sequence.push(...longLoginSequence);
        }

        sequence.push(...boostrapSequence);

        seq.next();
    })


    // piggyback off of user interactions to get a valid audio context
    let userInteracted = false;
    function userInteraction() {
        if(userInteracted) return;
        resolveAnyKeyPressed();
        sfx.init();

        userInteracted = true;
    }

</script>
<svelte:body on:click={userInteraction} on:keydown={userInteraction}/>
<div class="mobile-bug-fix" bind:this={mbfDiv}>
    <GlobalLoadingIndicator>
        <Display>
            <form>
            { #if showShell }
                {#each strings as tt, i (tt.lineNo)}
                    <TypedText {...tt} showCursor={i === (strings.length - 1)} onComplete={() => seq.next()} />
                    {#if !tt.nobreak}
                        <br/>
                    {/if}
                {/each}
            {/if}
            </form>

            {#if mountBrowser}
                <div style:display={showBrowser ? 'block' : 'none'} class="browser-container" style:animation-play-state={showBrowser ? 'running' : 'paused'}>
                    <Browser onInit={resolveFileLoadingPromise}/>
                    <VolumeToggle/>
                </div>
            {/if}
            <CrtStripes/>
        </Display>
        <WindowManager/>
        <TransitionaryBackground onComplete={finishAnimation} start={beginAnimation} animationLength={startupBypass ? '0.01s' : shortStart ? '3s' : '6s'}/>
    </GlobalLoadingIndicator>
</div>
<style>
    :global(body) {
		--sidebar-width: 32px;

        overflow: hidden;
        margin: 0px;
        color: #00B9FD;
        font-size:24px;
        font-family: 'Ace Futurism', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    :global(.border-glow) {
        -webkit-box-shadow: 0px 0px 3px 1px rgba(0, 186, 253, 0.79);
        -moz-box-shadow: 0px 0px 3px 1px rgba(0, 186, 253, 0.79);
        box-shadow: 0px 0px 3px 1px rgba(0, 186, 253, 0.79);
    }
    :global(.text-glow) {
        text-shadow: -1px 1px 4px rgba(0,186,253,0.79);
    }

    :global(.place-content-center) {
        display: grid;
        place-content: center;
    }

    :global(*) {
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
    }

    /* ===== Scrollbar CSS ===== */
    /* Firefox */
    @-moz-document url-prefix()  {
        :global(*) {
            scrollbar-width: thin;
            scrollbar-color: #00b9fd #1b3779;
        }
    }
    /* Chrome, Edge, and Safari */
    :global(*)::-webkit-scrollbar {
        width: 5px;
    }

    :global(*)::-webkit-scrollbar-track {
        background: #1b3779;
    }

    :global(*)::-webkit-scrollbar-thumb {
        background-color: #00b9fd;
        border-radius: 0px;
        border: 3px none #ffffff;
    }

    :global(body, html, .mobile-bug-fix) {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        position:fixed;
    }

    :global(.filter-glow) {
        filter: url(#glow);
    }

    @keyframes bootup {
        from {
            transform: rotateX(90deg);
        }
        to {
            transform: rotateX(0deg);
        }
    }

    .browser-container {
        animation: bootup 1s forwards;
    }

    :global(html) {
        line-height: 1!important;
    }

    :global(.pointerless) {
        pointer-events: none;
    }
</style>

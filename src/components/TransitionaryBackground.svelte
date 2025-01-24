<script lang="ts">
    import branding from '../lib/client/stores/branding';
	import HwcLogo from './HWCLogo.svelte';

    export let onComplete = () => {};
    export let start = false;

    export let animationLength = '6s';


</script>


<style>
    main {
        z-index: -1000;
        position:absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;

        display: grid;
        place-content: center;
        background-color: black;

        --hwc-animation-length: 6s;
        --hwc-animation-state: paused;

        animation: background-shift forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
    }

    .logo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .middle-line {
        display: flex;
        width: 100%;
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
    }

    .half-line {
        width: 50%;
        height:0.25rem;
        display: flex;
    }

    .top-text, .wc {
        font-family: 'primetimeregular';
    }
    
    .top-text, .bottom-text {
        display: flex;
        justify-content: center;

        overflow: hidden;

        font-size: calc(30px + 3.5vw);

    }
    

    .bottom-text {
        flex-direction:  column;
    }

    .top-text span {
        animation: text-emerge-top forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
    }

    .bottom-text span {
        text-align: center;
    }

    .bottom-text span.wc {
        animation: text-emerge-bottom forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
    }

    .tagline {
        animation: tagline-fade forwards; 
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
        font-size: calc(calc(20px + 3.5vw) / 2);
    }

    .hwc-logo {
        width: 50vw;
        max-width: 400px;
        animation: hwc-logo-fade forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
        margin-bottom: 1rem;
    }

    img { 
        width: 100%;
        height: auto;
    }
    
    .half-line.left {
        justify-content: right;
        animation: line-container-left forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
    }

    .half-line.right {
        justify-content: left;
        animation: line-container-right forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
    }

    .the-line {
        width: 100%;
        height: 100%;
        background-color: white;
        animation: line forwards;
        animation-duration: var(--hwc-animation-length);
        animation-play-state: var(--hwc-animation-state);
    }

    @keyframes text-emerge-top {
        0%, 40% {
            transform: translateY(100%);
        }
        70%, 100% {
            transform: translateY(0%);
        }
    }

    @keyframes text-emerge-bottom {
        0%, 40% {
            transform: translateY(-100%);
        }
        70%, 100% {
            transform: translateY(0%);
        }
    }

    @keyframes line-container-left {
        0%, 54.9% {
            justify-content: right;
        }
        55%, 100% {
            justify-content: left;
        }
    }

    
    @keyframes line-container-right {
        0%, 54.9% {
            justify-content: left;
        }
        55%, 100% {
            justify-content: right;
        }
    }


    @keyframes line {
        0%, 40% {
            width: 0%;
        }
        55% {
            width: 100%;
        }
        70%, 100% {
            width: 0%;
        }
    }

    @keyframes tagline-fade {
        0%, 60% {
            opacity: 0;
        }
        75%, 100% {
            opacity: 1;
        }
    }

    @keyframes hwc-logo-fade {
        0% {
            opacity: 0;
        }
        40%, 100% {
            opacity: 1;
        }
    }

    @keyframes background-shift {
        0%, 75% {
            background-color: black;
            color: white;
        }
        100% {
            background-color: #061040;
            color: #002973;
        }
    }

</style>

<main on:animationend={onComplete} style:--hwc-animation-state={start ? 'running' : 'paused' } style:--hwc-animation-length={animationLength}>
    <div class="logo-container">
        <div class="hwc-logo">
            <HwcLogo/>
        </div>
        <div class="hwc-text">
            <div class="top-text">
                <span>{$branding['line1']}</span>
            </div>
            <div class="middle-line">
                <div class="half-line left">
                    <div class="the-line"></div>
                </div>
                <div class="half-line right">
                    <div class="the-line"></div>
                </div>
            </div>
            <div class="bottom-text">
                <span class="wc">{$branding['line2']}</span>
                <span class="tagline">{$branding['subtitle']}</span>
            </div>
        </div>
    </div>
</main>
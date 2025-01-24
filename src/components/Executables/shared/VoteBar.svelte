<script lang="ts">
	import { tweened } from "svelte/motion";

    export let hidden = false;
    export let color: string;
    export let percentage: number;
    export let vote: string; 

    const percentageTween = tweened(percentage);

    $: {
        percentageTween.set(percentage);
    }
</script>


<div class="vote-tally" class:hidden={hidden} >
    <div class="vote-bar" >
        <span style:background-color={color} style:width={`${$percentageTween}%`} >{$percentageTween.toFixed(2)} %</span>
    </div>
    <div class="vote-number">
        <span>{vote}</span>
    </div>
</div>

<style>

.vote-tally {
    display: flex;
    justify-content: space-between;
}

.vote-bar {
    width: 100px;
    color: white;
    white-space: nowrap;
}

.vote-bar span {
    padding-left: 5px;
}

.vote-number {
    margin-left: 10px;
    width: 70px;
}

.vote-tally span {
    display: inline-block;
}

.hidden {
    visibility: hidden;
}

</style>
<script lang="ts">
	import type { HWCWindowHandle } from "../../../lib/client/interactables/HWCWindow";
    import { onMount } from "svelte";

    const PAYLOADS = [
        `.window { font-family: "Comic Sans MS", "Comic Sans", cursive!important; }`,
        ` button { font-family: "Comic Sans MS", "Comic Sans", cursive!important; }`,
        `.window { background-color: #42CD00!important; }`,
        ` main { padding: 5px!important;}`,
        `.window .window-mount { background: white!important; }`,
        `.window h1 { color: black; }`,
        `.window input { border-color: #42CD00!important;  border-radius: 15px; color: black; font-family: "Comic Sans MS", "Comic Sans", cursive!important; font-size: 20px; margin-left: -15px; }`,
        `.window .navbar span { color: #0717B3!important; }`,
        `.window button { border-radius: 50%;margin-left:15px;color: #0717B3!important;background:#89218F!important;border-color: #89218F!important;}`,
        ` .error .result { color: red!important; }`,
        ` .result { color: green!important }`
    ];
    const createPayload = (windowId: string) => PAYLOADS.map((p) => `[data-window-id="${windowId}"]${p}`).join('\n');
    let div: HTMLDivElement;
    let windowHandle: HWCWindowHandle;

    onMount(() => {
        windowHandle = window.ui.getWindowByParent(div);

        const style = document.createElement('style');
        style.innerText = createPayload(windowHandle.id);
        div.appendChild(style);
    });
</script>
<div style:display='contents' bind:this={div}>
    
</div>
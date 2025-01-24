import { writable } from "svelte/store";

const muted = writable(typeof localStorage !== 'undefined' && localStorage.getItem("muted") === "true");

muted.subscribe((muted) => {
    if(typeof localStorage !== 'undefined') {
        localStorage.setItem("muted", muted.toString());
    }
})

export default muted;
import { writable } from 'svelte/store';

const mouseStore = writable({ x: 0, y: 0 });
let mouseHooked = false;

if(typeof document === 'object' && !mouseHooked) {
    document.onmousemove = (event) => {
        mouseStore.set({ x: event.clientX, y: event.clientY });
    }
    mouseHooked = true;
}

export default mouseStore;
import externalize from '../util/externalize';
import { writable } from 'svelte/store';

const mouse = writable({ x: 0, y: 0 });

if(typeof document === 'object') {
    document.onmousemove = (event) => {
        mouse.set({ x: event.clientX, y: event.clientY });
    }
}

externalize('mouse', mouse);
export default mouse;
import { writable } from 'svelte/store';

type HwcBackgroundAttributes = {
    e: string,
    line1: string;
    line2: string;
    subtitle: string;
}

const store = writable<HwcBackgroundAttributes>({
    e: '',
    line1: 'HALTMANN',
    line2: 'Works Company',
    subtitle: 'Prosper eternally without end'
});


export default store;
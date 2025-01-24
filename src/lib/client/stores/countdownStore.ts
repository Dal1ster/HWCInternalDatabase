import { writable } from "svelte/store";

const store = writable(0);

let interval: ReturnType<typeof setInterval>;

function startCountdown() {
    clearInterval(interval);
    interval = setInterval(() => {
        store.update(n => {
            if(n > 0) {
                return n - 1;
            }
            clearInterval(interval);
            return 0;
        });
    }, 1000)
}

export const setCountdown = (n: number) => {
    store.update(() => n)
    if(n > 0) {
        startCountdown();
    }
};

export default store;
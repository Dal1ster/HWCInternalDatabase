import { get } from "svelte/store";
import { HWCWindow } from "../interactables/HWCWindow";
import GenericFuck from "./genericFuck";

function slider(window: HWCWindow) {
    const getDirection = () => Math.random() > 0.5 ? 1 : -1;
    const maybe = (i: number) => Math.random() > 0.5 ? i : 0; 
    const x = maybe(getDirection());
    const y = maybe(getDirection());
    
    setInterval(window.relativeMove, 10, { x, y });
}

function troller(window: HWCWindow) {
    setInterval(() => window.relativeMove({ x: Math.random() * 10 - 5, y: Math.random() * 10 - 5}), 30);
}

async function marioer(window: HWCWindow) {
    const div = window.getMountContainer();

    setInterval(function() {
        if(!div) {
            return;
        }
        div.innerHTML = `<img src="/img/mario-super-mario.gif"/>`
    }, 100);
}

function shrinker(window: HWCWindow) {
    const getDirection = () => Math.random() > 0.5 ? 1 : -1;
    const maybe = (i: number) => Math.random() > 0.5 ? i : 0; 
    const width = maybe(getDirection());
    const height = maybe(getDirection());
    
    setInterval(() => window.relativeResize(width, height), 50);
}


class WindowFuck extends GenericFuck {
    fuckedWindows: Set<string> = new Set();
    
    getElements() {
        return get(window.windowStore);
    }

    fuck() {
        const windows = this.getElements();

        for(const window of windows) {
            if(this.fuckedWindows.has(window.id)) {
                continue;
            }

            if(this.rand(0.01, 0.001)) {
                const anotherOne = Math.random();
                const hwcWindow = new HWCWindow(window.id);

                const iterations = Math.random() > 0.7 ? 3 : Math.random() > 0.7 ? 2 : 1;

                for(let i = 0; i < iterations; i++) {
                    if(anotherOne < 0.35) {
                        slider(hwcWindow);
                    } else if (anotherOne < 0.5) {
                        troller(hwcWindow);
                    } else if (anotherOne < 0.8) {
                        shrinker(hwcWindow)
                    } else {
                        marioer(hwcWindow);
                    }
                } 

                this.fuckedWindows.add(window.id);
            }
        }
    }
}

export default new WindowFuck(200);
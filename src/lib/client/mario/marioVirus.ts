import NewHwcLogo from '../../../components/icons/halt-m-ann-works-company2.svg?raw'
import { get } from 'svelte/store'
import { startTextGlitch, increaseGlitchFactor } from './textFuck';
import transformFuck from './transformFuck';
import windowFuck from './windowFuck';
import marginFuck from './marginFuck';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function appendStyle(css: string) {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
}

const BASE_INTENSITY_OFFSET = 250;
function svgFuck(path: Element, intensity: number) {
    const d = path.getAttribute('data-og-d') || path.getAttribute('d') || '';
    path.setAttribute('data-og-d', d || '');

    const individual = [...d];
    const newd = [];

    let i = 0;
    for(const c of individual){
        let newC = c;
        i += Math.max(Math.round(Math.random() * 3), 1);
        if(!isNaN(parseInt(c)) && (BASE_INTENSITY_OFFSET - i) < intensity) {
            newC = (parseInt(c) + Math.min(Math.floor((Math.random() * 4 - 2) / 2), 0)).toString();
            i = 0;
        }
        newd.push(newC);
    }
    return newd.join('');
}


// Entry point for the mario virus sequence
export default async function marioVirus() {
    const {
        branding,
        sfx,
        assets
    } = window;

    await Promise.all([
        assets.load('/img/him.jpg'),
        sfx.load('/sfx/he-rises.mp3', 's_he_rises', 0),
        sfx.load('/sfx/sfx_s_terminal_power_off.mp3', 'sfx_s_terminal_power_off', 0)
    ])


    function updateLogo() {
        branding.update((b) => {
            return {
                ...b,
                e: NewHwcLogo
            }
        });
    }

    const subdivide = (duration: number, parts: number) => Math.floor(duration / parts); 

    async function untypeTitle(duration: number) {
        const untypingDelay = subdivide(duration, get(branding).line1.length);
        while(get(branding).line1.length > 0) {
            branding.update((b) => {
                return {
                    ...b,
                    line1: b.line1.slice(0, -1)
                }
            });
            await delay(untypingDelay);
        }
    }

    async function retypeTitle(duration: number) {
        const newTitle = ['M', 'A', 'R', 'I', 'O'];
        const retypingDelay = subdivide(duration, newTitle.length);
        while(newTitle.length > 0) {
            branding.update((b) => {
                return {
                    ...b,
                    line1: b.line1 + newTitle.shift()
                }
            });
            await delay(retypingDelay);
        }
    }

    async function untypeSubtitle(duration: number) {
        const untypingDelay = subdivide(duration, get(branding).subtitle.length);
        while(get(branding).subtitle.length > 0) {
            branding.update((b) => {
                return {
                    ...b,
                    subtitle: b.subtitle.slice(0, -1)
                }
            });
            await delay(untypingDelay);
        }
    }

    async function retypeSubtitle(duration: number) {
        const newSubtitle = [...'It\'s a me, Ma'];
        const retypingDelay = subdivide(duration, newSubtitle.length);
        while(newSubtitle.length > 0) {
            branding.update((b) => {
                return {
                    ...b,
                    subtitle: b.subtitle + newSubtitle.shift()
                }
            });
            await delay(retypingDelay);
        }
    }
    
    async function infiniteA() {
        while(true) {
            branding.update((b) => {
                return {
                    ...b,
                    subtitle: b.subtitle + 'a'
                }
            });
            await delay(50);
        }
    }
    
    async function redShift() {
        appendStyle(`
            .mobile-bug-fix {
                transition: filter 25s ease-in-out;
            }
            .he-rises {
                filter: hue-rotate(137deg);        
            }
        `);

        await delay(1000);
        document.getElementsByClassName('mobile-bug-fix')[0]?.classList.add('he-rises');
    }

    async function shutdown() {
        sfx.stop('s_he_rises' as any);
        sfx.play('sfx_s_terminal_power_off' as any);

        appendStyle(`
            html {
                background-color: black;
            }   
            body {
                animation: shutdown 0.3s ease-in-out forwards;
            }

            @keyframes shutdown {
                from {
                    transform: rotateX(0deg);
                    filter: brightness(1);
                }
                to {
                    transform: rotateX(90deg);
                    filter: brightness(10);
                }
            }
        `);

        await delay(3000);
        window.location.reload();
    }

    async function playBGM() {
        await sfx.play('s_he_rises' as any);
    }


    let svgCorruptionIntensity = 0;
    let fuckParams = [
        [0.01, 1],
        [0.02, 1],
        [0.05, 10],
        [0.1, 50],
        [0.15, 60],
        [0.2, 150],
        [0.6, 360],
    ]
    async function corruptAllSVG() {
        const allPaths = document.querySelectorAll('.scrollable-container svg path');

        if(allPaths.length === 0) {
            return;
        }



        allPaths.forEach((path) => {
            if(Math.random() < fuckParams[svgCorruptionIntensity][0]) {
                path.setAttribute('d', svgFuck(path, fuckParams[svgCorruptionIntensity][1]));
            } else {
                fixSVG(path);
            }
        });
    }

    async function fixMostSVG() {
        const allPaths = document.querySelectorAll('.scrollable-container svg path');

        if(allPaths.length === 0) {
            return;
        }

        allPaths.forEach((path) => {
            if(Math.random() < 0.05) {
                path.setAttribute('d', svgFuck(path, 1));
            } else {
                fixSVG(path);
            }
        });

    }

    async function fixSVG(path: Element) {
        path.setAttribute('d', path.getAttribute('data-og-d') || path.getAttribute('d') || '');
    }

    async function startSVGGlitch() {
        setInterval(() => {
            corruptAllSVG()
            setTimeout(fixMostSVG, 30);
        }, 100)
    }

    async function createHIM(n: number) {
        for(let i = 0; i < n; i++) {
            await window._debug.openImage('HIM', '/img/him.jpg')
        }
    }

    type AnimationKeyframe = {
        start: number,
        end?: number,
        fn: ((duration: number) => any) | (() => any)
    }

    const setIntensity = (i: number) => () => svgCorruptionIntensity = i;

    const timeline: AnimationKeyframe[] = [
        {
            start: 0,
            fn: redShift
        },
        {
            start: 0,
            fn: playBGM
        }, {
            start: 3000,
            fn: startTextGlitch
        }, 
        {
            start: 5000,
            fn: startSVGGlitch,
        }, 
        {
            start: 10000,
            fn: () => setInterval(increaseGlitchFactor, 100)
        },
        {
            start: 10000,
            fn: transformFuck.setInterval
        }, {
            start: 15000,
            fn: () => setInterval(transformFuck.increaseGlitchFactor, 100, 100)
        }, {
            start: 15000,
            fn: windowFuck.setInterval
        },
        {
            start: 17000,
            end: 19000,
            fn: untypeTitle
        }, {
            start: 20010,
            end: 24000,
            fn: retypeTitle
        }, 
        {
            start: 20000,
            fn: updateLogo
        }, { 
            start: 20000,
            fn: () => setInterval(increaseGlitchFactor, 100, 3)
        }, {
            start: 21460,
            end: 23500,
            fn: untypeSubtitle
        }, {
            start: 24000,
            end: 24700,
            fn: retypeSubtitle 
        },
        {
            start: 24770,
            fn: infiniteA
        },
        {
            start: 24770,
            fn: () => increaseGlitchFactor(100)
        },
        {
            start: 24770,
            fn: () => transformFuck.increaseGlitchFactor(10000)
        },
        {
            start: 24770,
            fn: () => marginFuck.setInterval()
        }, {
            start: 24770,
            fn: startTextGlitch
        },
        {
            start: 24770,
            fn: setIntensity(fuckParams.length - 1)
        }, {
            start: 24770,
            fn: async () => {
                createHIM(1)
                await delay(300);
                createHIM(1)
                await delay(300);
                createHIM(1)
                await delay(500);
                createHIM(1)
            },
        }, {
            start: 26500,
            fn: () => {
                const i = setInterval(createHIM, 100, 1)
                setTimeout(() => clearInterval(i), 3000)
            }
        }, 
        {
            start: 29000,
            fn: shutdown
        }
    ]

    function animate(t: AnimationKeyframe[]) {
        for(const animation of t) {
            setTimeout(animation.fn, animation.start, (animation.end || animation.start) - animation.start)
        }
    }

    async function sequence() {
        if(window.getFucked) return;
        window.getFucked = true;
        
        //timeline
        const t = [
            { 
                start: 0,
                end: 500,
                fn: () => createHIM(1)
            }
        ];
        animate(timeline);
    }

    window.localStorage.setItem('1up', 'true');

    return sequence;
    window.virus = {
        sequence,
        updateLogo,
        retypeTitle,
        retypeSubtitle,
        redShift,
        playBGM,
        fuck: startSVGGlitch,
        shutdown
    }
}
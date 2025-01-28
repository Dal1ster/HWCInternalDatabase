import SoundFx from 'sound-fx';
import { promisify } from 'es6-promisify'; 
import { get } from 'svelte/store';
import muted from './stores/muted';

const sounds = {
    'text': '/sfx/ui_hacking_charscroll.wav',
    'sfx_s_terminal_power_on': '/sfx/sfx_s_terminal_power_on.mp3',
    'sfx_s_terminal_loading_end': '/sfx/sfx_s_terminal_loading_end.mp3',
    'sfx_s_terminal_winclose': '/sfx/sfx_s_terminal_winclose.mp3',
    'sfx_s_terminal_winopen': '/sfx/sfx_s_terminal_winopen.mp3',
    'sfx_s_terminal_buzzer': '/sfx/sfx_s_terminal_buzzer.mp3',
    'sfx_s_terminal_enter': '/sfx/sfx_s_terminal_enter.mp3',
    'sfx_s_terminal_cancel': '/sfx/sfx_s_terminal_cancel_soft.mp3',
    'sfx_s_terminal_data_p1': '/sfx/sfx_s_terminal_blip_p1.wav',
    'sfx_s_1up': '/sfx/sfx_s_1up.mp3',
    'sfx_s_terminal_data_p2': [
        '/sfx/sfx_s_terminal_blip_p2.wav',
        '/sfx/sfx_s_terminal_blip_p2-2.mp3',
        '/sfx/sfx_s_terminal_blip_p2-3.mp3',
        '/sfx/sfx_s_terminal_blip_p2-4.mp3',
        '/sfx/sfx_s_terminal_blip_p2-5.mp3',
        '/sfx/sfx_s_terminal_blip_p2-6.mp3',
    ],
    'sfx_s_terminal_data_p3': '/sfx/sfx_s_terminal_blip_p3.wav',
    'sfx_s_item_get02_cassette': '/sfx/sfx_s_item_get02_cassette.mp3',
    'hwc-chime': '/sfx/hwc_demo.mp3'
}

export type SFXPlayer<T extends Record<string, string | Array<string>>, TSoundName extends keyof T & string = keyof T & string> = {
    /**
     * Request the SFXPlayer to create the audio context, needs to be called in a function triggered by a user gesture
     */
    init: () => any;
    play(sound: TSoundName, loop?: boolean): Promise<any>;
    load(url: string, name: TSoundName, delay?: number): Promise<any>;
    stop(name: TSoundName): Promise<any>;
    has(name: TSoundName): boolean;
    remove(name: TSoundName): void;
    loadAll(): Promise<any>;
    extendInstance<K extends SoundDictionary>(sounds: K): SFXPlayer<K & T>;

    loadedSFX: {
        [K in TSoundName]?: true;
    };
}

export type SoundDictionary = Record<string, string | Array<string>>;

export function createSFXPlayer<T extends SoundDictionary, TSoundName extends keyof T & string = keyof T & string>(sounds: T, playerInstance?: SoundFx): SFXPlayer<T> {
    const soundFx = playerInstance || new SoundFx();
    const playPromisified = promisify(soundFx.play.bind(soundFx));
    const loadPromisified = promisify(soundFx.load).bind(soundFx);

    const sfx: SFXPlayer<T> = {
        init: () => soundFx.support && soundFx.context.state !== 'running' && (soundFx.context = new soundFx.AudioContext()),
        loadedSFX: {},
        play(sound: TSoundName, loop = false) {
            if(get(muted)) return Promise.resolve();

            // action may have been initiated by a user gesture so try to initialize sound engine
            if(soundFx.context.state !== 'running') {
                sfx.init();
            }
            // we still dont have a sound engine, so we'll play the sound later
            if(soundFx.context.state === 'suspended') {
                return Promise.resolve();
            }

            let soundToPlay = sound as string;
            if(Array.isArray(sounds[sound])) {
                const len = sounds[sound].length;
                soundToPlay = `${sound}_${Math.floor(Math.random() * len)}`;
            }


            return playPromisified(soundToPlay, loop)
        },
        async load(url: string, name: TSoundName, delay?: number) {
            if(soundFx.sounds[name]) { 
                console.debug('Already loaded SFX', name, 'at', url);
                return;
            }

            await loadPromisified(url, name, delay || 0);
            sfx.loadedSFX[name] = true;
        },
        stop: promisify(soundFx.stop).bind(soundFx),
        has: soundFx.has.bind(soundFx),
        remove(name: TSoundName) {
            delete sfx.loadedSFX[name];
            soundFx.remove(String(name));
        },
        loadAll() {
            return Promise.all(Object.entries(sounds).map(([name, url]) => {
                if(Array.isArray(url)) {
                    return Promise.all(url.map((u, i) => sfx.load(u, `${name}_${i}`, 0)))
                } else {
                    return sfx.load(url, name, 0)
                }
            }));
        },
        extendInstance(extraSounds: SoundDictionary) {
            return createSFXPlayer(extraSounds, soundFx);
        }
    }

    return sfx;
}

const globalSFX = createSFXPlayer(sounds);

export default globalSFX;
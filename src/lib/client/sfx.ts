import SoundFx from 'sound-fx';
import {promisify} from 'es6-promisify'; 
import { get } from 'svelte/store';
import muted from './stores/muted';
import externalize from './util/externalize';

const soundFx = new SoundFx();

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
const play = promisify(soundFx.play.bind(soundFx));

const sfx = {
    init: () => soundFx.support && soundFx.context.state !== 'running' && (soundFx.context = new soundFx.AudioContext()),
    play: (sound: keyof typeof sounds, loop = false) => {
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


        return play(soundToPlay, loop)
    },
    load: promisify(soundFx.load).bind(soundFx),
    stop: promisify(soundFx.stop).bind(soundFx),
    has: soundFx.has.bind(soundFx),
    remove: soundFx.remove.bind(soundFx),
    loadAll() {
        return Promise.all(Object.entries(sounds).map(([name, url]) => {
            if(Array.isArray(url)) {
                return Promise.all(url.map((u, i) => this.load(u, `${name}_${i}`, 0)))
            } else {
                return this.load(url, name, 0)
            }
        }));
    }
};

externalize('sfx', sfx);
export default sfx;
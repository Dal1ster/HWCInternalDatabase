declare module 'sound-fx' {
    export default class SoundFX {
        constructor();
        play(sound: string, loop?: boolean, cb?: (err: Error | null) => any): void;
        load(url: string, name: string, delay: number, cb?: (err: Error | null) => any): void;
        stop(sound: string): void;
        has(sound: string): boolean;
        remove(sound: string): void;

        support: boolean;
        AudioContext: { new (): AudioContext};
        context: AudioContext;

        sounds: {
            [key: string]: AudioBuffer;
        };
    }
}
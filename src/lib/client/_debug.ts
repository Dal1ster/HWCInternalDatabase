import { openAsyncWindow } from "./interactables/HWCWindow";
import Image from "../../components/ExtensionDelegate/Image.svelte";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Text from "../../components/ExtensionDelegate/Text.svelte";
import Troll from "../../components/Executables/Troll.svelte";
// obfuscate the true purpose of this module, used for the mario virus rebirth.exe
const _debug =  {
    openImage: (title: string, src: string) => openAsyncWindow(Image, {
        title,
        props: {
            src
        },
        dynamicResize: true,
        scalingBias: 'height',
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
        x: (window.innerWidth / 1.5) * Math.random(),
        y: (window.innerHeight / 1.2) * Math.random()
    }),
    openDebugWindow: () => openAsyncWindow(Troll, {
        title: 'debug',
        props: {},
        width: -1,
        height: -1,
    })
}

export default _debug;  
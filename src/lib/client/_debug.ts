import { openAsyncWindow } from "./interactables/HWCWindow";
import Image from "../../components/ExtensionDelegate/Image.svelte";
import externalize from "./util/externalize";
import Text from "../../components/ExtensionDelegate/Text.svelte";
// obfuscate the true purpose of this module, used for the mario virus rebirth.exe
const _debug =  {
    openImage: (name: string, src: string) => openAsyncWindow(name, Image, {
        src: src,
        dynamicResize: true,
        scalingBias: 'height',
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
        x: (window.innerWidth / 1.5) * Math.random(),
        y: (window.innerHeight / 1.2) * Math.random()
    }),
    openDebugWindow: () => openAsyncWindow('debug', Text, {
        width: -1,
        height: -1,
    })
}

externalize('_debug', _debug);
export default _debug;  